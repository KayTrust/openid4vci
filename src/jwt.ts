import * as jose from 'node-jose'
import { JWK } from './key';
import { createDidEthr } from '@kaytrust/did-ethr'
import { ProofTypeJWT, ResolverOrOptions } from '@kaytrust/prooftypes';
import { VerifyPresentationOptions } from 'did-jwt-vc';

export type SupportedDid = 'key' | 'ethr' | 'ev'

const createJWTDIDWithJWK = async (jwk: JWK, audience: string, params: any = {}, typ = "JWT", headers = {}) => {
    if (!jwk) {
        throw 'a private key is required';
    }

    // const privateKey = await jose.importJWK(jwk)

    // const jwt = await new jose.SignJWT()

    const opt = { compact: true, fields: { typ: typ, kid: `${params.iss}#${params.iss.split(":")[2]}` } };
    const payloadObj: any = {
        'aud': audience,
        ...params
    };
    if (params.nbf) payloadObj.nbf = payloadObj.iat;
    const payload: any = JSON.stringify(payloadObj);

    const prepared = jose.JWS.createSign(opt, { key: jwk, reference: false } as any).update(payload)

    const token = await prepared.final();

    return token;
}

const createJWTwithProofTypeJwtAndPrivateKey = async (privateKey: string, audience: string, params: any = {}, typ = "JWT") => {
    const issuer = createDidEthr(params.iss, {privateKey})
    const payloadObj: any = {
        'aud': audience,
        ...params
    };
    if (params.nbf) payloadObj.nbf = payloadObj.iat;
    const vpProofType = new ProofTypeJWT({}, true)
    return vpProofType.generateProof(payloadObj, issuer)
}

export type SignOptions = {
    jwk?: JWK,
    privateKey?: string,
}

export const createJWT = (didMethod: SupportedDid, signOptions: SignOptions, audience: string, params: any = {}, typ = "JWT") => {
    let result: any = '';
    switch (didMethod) {
        case 'ethr':
        case 'key':
            if (signOptions.jwk) {
                result = createJWTDIDWithJWK(signOptions.jwk, audience, params, typ);
            } else if (signOptions.privateKey) {
                result = createJWTwithProofTypeJwtAndPrivateKey(signOptions.privateKey, audience, params, typ)
            } else {
                throw new Error('There are no sign options');
            }
            break;
        case 'ev':
            throw new Error('Not implement function');
        default:
            break;
    }
    return result;
}


export const verifyJWTFromVp = async (jwt: string, resolver: ResolverOrOptions, audience: string, options?: VerifyPresentationOptions) => {
    const proofTypePresentationEmpty = new ProofTypeJWT({resolver, verifyOptions: {
        ...options,
        audience: audience,
    }}, true)
    return proofTypePresentationEmpty.verifyProof(jwt);
}
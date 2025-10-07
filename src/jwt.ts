import * as jose from 'node-jose'
import { createJWKFromPrivateKey, getPrivateKeyFromJWK, JWK } from './key';
import { createDidEthr } from '@kaytrust/did-ethr'
import { ProofTypeJWT, ResolverOrOptions } from '@kaytrust/prooftypes';
import { VerifyPresentationOptions, VerifyCredentialOptions } from 'did-jwt-vc';
import { decodeProtectedHeader } from 'jose';
import { getFormatterErrorMessages } from './utils';
import { VerifierErrorCode, VerifierErrors } from './enums/verifier-errors.enum';
import { JWTPayload, JWTVerifyOptions, verifyJWT } from 'did-jwt';
import {getIssuerWithPrivateKey, SupportedDid} from './issuer'

export {type SupportedDid} from './issuer'

const createJWTDIDWithJWK = async (jwk: JWK, audience: string, payloadData: any = {}, typ = "JWT", headers = {}) => {
    if (!jwk) {
        throw 'a jwk is required';
    }

    const opt = { compact: true, fields: { typ: typ, kid: `${payloadData.iss}#${payloadData.iss.split(":")[2]}` } };
    const payloadObj: any = {
        ...payloadData
    };
    if (audience) payloadObj.aud = audience;
    if (payloadData.nbf) payloadObj.nbf = payloadObj.iat;
    const payload: any = JSON.stringify(payloadObj);

    const prepared = jose.JWS.createSign({...opt, alg: "ES256"}, { key: jwk, reference: false } as any).update(payload)

    const token = await prepared.final();
    return token;
}

type CreateJWTwithProofTypeJwtAndPrivateKeyOptions = {
    is_presentation?: boolean
    header?: Record<string, any>
}

const createJWTwithProofTypeJwtAndPrivateKey = async (privateKey: string, audience: string, payload: JWTPayload = {}, {is_presentation = false, ...options}: CreateJWTwithProofTypeJwtAndPrivateKeyOptions = {}) => {
    const issuer = getIssuerWithPrivateKey(payload.iss!, privateKey);
    const payloadObj: any = {
        ...payload
    };
    if (audience) payloadObj.aud = audience;
    if (payload.nbf) payloadObj.nbf = payloadObj.iat;
    const proofType = new ProofTypeJWT({}, is_presentation)
    return proofType.generateProof(payloadObj, issuer, {header: options.header})
}

export type SignOptions = {
    jwk?: JWK,
    privateKey?: string,
}

type CreateJwtOptions = {
    typ?: string,
    audience?: string,
    headers?: Record<string, any>
    is_presentation?: boolean,
    no_vc_vp?: boolean,
}

type CreateJwtVcOptions = Omit<CreateJwtOptions, 'is_presentation' | 'no_vc_vp'>

export const createJWTVc = (didMethod: SupportedDid, signOptions: SignOptions, payload: Record<string, any> = {}, options: CreateJwtVcOptions = {}) => {
    return createJWT(didMethod, signOptions, payload, {...options, is_presentation: false})
}

export const createJWT = async (didMethod: SupportedDid, signOptions: SignOptions, payload: Record<string, any> = {}, {audience, typ = "JWT", is_presentation=false, no_vc_vp = false}: Partial<CreateJwtOptions> = {}): Promise<string> => {
    let result: any = '';
    switch (didMethod) {
        case 'near':
        case 'ethr':
        case 'key':
            if ((signOptions.privateKey || signOptions.jwk) && !no_vc_vp) {
                result = createJWTwithProofTypeJwtAndPrivateKey(signOptions.privateKey || getPrivateKeyFromJWK(signOptions.jwk!), audience!, payload, {is_presentation})
            } else if (signOptions.jwk || signOptions.privateKey) {
                if (!signOptions.jwk) signOptions.jwk = await createJWKFromPrivateKey(signOptions.privateKey);
                result = createJWTDIDWithJWK(signOptions.jwk, audience!, payload, typ);
            } else {
                throw new Error('There are no sign options');
            }
            break;
        default:
            throw new Error('Not implement function');
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

export const verifyJWTFromVc = async (jwt: string, resolver: ResolverOrOptions, options?: VerifyCredentialOptions) => {
    const proofTypePresentationEmpty = new ProofTypeJWT({resolver, verifyOptions: {
        ...options,
    }}, false)
    return proofTypePresentationEmpty.verifyProof(jwt);
}

const formatVerifierError = getFormatterErrorMessages(VerifierErrors);

export function extractDidFromHeaderKid(kid: string): string {
    let did: string;

    if (kid?.startsWith("did:")) {
        if (kid.includes("#")) {
            did = kid.split("#")[0];
        } else {
            did = kid;
        }
    } else {
        const code: VerifierErrorCode = "E809302";
        throw new Error(formatVerifierError(code, kid));
    }

    return did;
}


export const verifyJwtProof = async (jwt: string, {resolver, audience}: Pick<JWTVerifyOptions, "resolver" | "audience"> = {}) => {
    const header = decodeProtectedHeader(jwt);
    const proofType = header.typ;
    const correctProofType = "openid4vci-proof+jwt"
    if (!proofType || proofType !== correctProofType) {
        const code:VerifierErrorCode = "E809304"
        throw new Error(formatVerifierError(code, proofType!, correctProofType))
    }

    const kid = header.kid!;

    const did = extractDidFromHeaderKid(kid);

    if (resolver) {
        await verifyJWT(jwt, { resolver, audience })
    }

    return did;
}
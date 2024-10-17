import * as jose from 'node-jose'
import { JWK } from './key';

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

export const createJWT = (didMethod: SupportedDid, jwk: JWK, audience: string, params: any = {}, typ = "JWT") => {
    let result: any = '';
    switch (didMethod) {
        case 'ethr':
        case 'key':
            result = createJWTDIDWithJWK(jwk, audience, params, typ);
            break;
        case 'ev':
            throw new Error('Not implement function');
        default:
            break;
    }
    return result;
}

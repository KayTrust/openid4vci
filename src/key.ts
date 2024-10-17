import type {JWK as BaseJWK} from 'jose'
import * as jose from 'node-jose';

export type JWK = BaseJWK & {
    kty: "EC"
    alg?: string
    kid: string
    crv: "P-256"
    d: string // private key
    x: string
    y: string

    use?: string
    key_ops?: string[]
}

export const createJWK = async (_kid?: string): Promise<JWK> => {
    const kid = _kid || Date.now().toString();
    const key = await jose.JWK.createKey('EC', 'P-256', { kid })
    const jwk = key.toJSON(true) as JWK;
    return jwk;
}

export const getPrivateKeyFromJWK = async (jwk: JWK): Promise<string> => {
    const privateKeyBuffer = Buffer.from(jwk.d, 'base64');
    const privateKey = '0x' + privateKeyBuffer.toString('hex');
    return privateKey;
}
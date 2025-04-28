import type {JWK as BaseJWK} from 'jose'
import * as jose from 'node-jose';
import {Wallet} from 'ethers'
import { generarHash } from './utils';
import {createECDH, createPrivateKey, createPublicKey} from 'crypto'

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

export type CreateJwkFromWalletOptions = {
    kid?: string,
    curve?: string,
}

function hexToBase64Url(hexStr: string) {
    return Buffer.from(hexStr, 'hex')
        .toString('base64url')
        // .replace(/\+/g, '-')
        // .replace(/\//g, '_')
        // .replace(/=/g, '');
}

export function getPublicKeyFromPrivateKeyCurveP256(privateKeyHex: string) {
    if (privateKeyHex.toLowerCase().startsWith("0x")) privateKeyHex = privateKeyHex.slice(2);
    const ecdh = createECDH('prime256v1'); // P-256 is also known as prime256v1 or secp256r1
    ecdh.setPrivateKey(Buffer.from(privateKeyHex, 'hex'));
    const publicKey = ecdh.getPublicKey('hex', 'uncompressed');
    return publicKey;
  }

export const createJWKFromWallet = async (wallet: Wallet, {kid: _kid, curve = "secp256k1", ...options}: CreateJwkFromWalletOptions = {}): Promise<JWK> => {
    const privateKey = wallet.privateKey.substring(2);
    const keyType = "EC";

    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    let publicKeyUncompressed: string;
    let key: Awaited<ReturnType<typeof jose.JWK.asKey>>;
    switch (curve.toLowerCase()) {
        case "secp256k1":
            publicKeyUncompressed = wallet.signingKey.publicKey;
            break;
        case "p-256":
            publicKeyUncompressed = getPublicKeyFromPrivateKeyCurveP256(privateKey);
            break;
        default:
            throw new Error("createJWKFromWallet: unsupported curve: " + curve);
            break;
    }
    key = await jose.JWK.asKey({
        kid: _kid,
        kty: keyType,
        crv: curve,
        d: privateKeyBuffer.toString("base64url"),
        x: hexToBase64Url(publicKeyUncompressed.substring(2, 66)),
        y: hexToBase64Url(publicKeyUncompressed.substring(66, 130)),
    });
    const jwk = key.toJSON(true) as JWK;
    return jwk;
}

export const createJWKFromPrivateKey = async (privateKey0: string, options?: CreateJwkFromWalletOptions): Promise<JWK> => {
    let privateKey = privateKey0;
    if (!privateKey.toLowerCase().startsWith("0x")) privateKey = "0x"+privateKey;
    const wallet = new Wallet(privateKey);
    return createJWKFromWallet(wallet, options);
}

export const createJWK = async (_kid?: string): Promise<JWK> => {
    const kid = _kid || generarHash(Date.now().toString());
    const key = await jose.JWK.createKey('EC', 'P-256', { kid })
    const jwk = key.toJSON(true) as JWK;
    return jwk;
}

export const getPrivateKeyFromJWK = (jwk: JWK): string => {
    const privateKeyBuffer = Buffer.from(jwk.d, 'base64url');
    const privateKey = '0x' + privateKeyBuffer.toString('hex');
    return privateKey;
}
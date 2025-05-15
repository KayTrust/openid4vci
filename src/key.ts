import type {JWK as BaseJWK} from 'jose'
import * as jose from 'node-jose';
import {Wallet} from 'ethers'
import { generarHash } from './utils';
import {createECDH, createPrivateKey, createPublicKey} from 'crypto'
import base64url from 'base64url'
import nacl from 'tweetnacl';

export type JWK = BaseJWK & {
    kty: "EC" | "OKP"
    alg?: string
    kid: string
    crv: "P-256" | "secp256k1" | "Ed25519"
    d: string // private key
    x: string
    y: string

    use?: string
    key_ops?: string[]
}

export type CreateJwkFromWalletOptions = {
    kid?: string,
    crv?: JWK["crv"],
    /**
     * @deprecated use `crv`
     */
    curve?: JWK["crv"],
    kty?: JWK["kty"],
}

function hexToBase64Url(hexStr: string) {
    return base64url.encode(Buffer.from(hexStr, 'hex'));
}

export function getPublicKeyFromPrivateKeyCurveP256(privateKeyHex: string) {
    if (privateKeyHex.toLowerCase().startsWith("0x")) privateKeyHex = privateKeyHex.slice(2);
    const ecdh = createECDH('prime256v1'); // P-256 is also known as prime256v1 or secp256r1
    ecdh.setPrivateKey(Buffer.from(privateKeyHex, 'hex'));
    const publicKey = ecdh.getPublicKey('hex', 'uncompressed');
    return publicKey;
  }

export const createJWKFromWallet = async (wallet: Wallet, {kid: _kid, crv, curve: deprecatedCrv, ...options}: CreateJwkFromWalletOptions = {}): Promise<JWK> => {
    const privateKey = wallet.privateKey.substring(2);
    const keyType = options.kty || "EC";

    const curve = (!crv && deprecatedCrv) ? deprecatedCrv : (crv || 'secp256k1')

    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    let publicKeyUncompressed: string;
    let key: Awaited<ReturnType<typeof jose.JWK.asKey>>;
    let keypair:nacl.SignKeyPair;
    let x:string|undefined = undefined;
    let y:string|undefined = undefined;
    switch (curve) {
        case "secp256k1":
            publicKeyUncompressed = wallet.signingKey.publicKey;
            break;
        case "P-256":
            publicKeyUncompressed = getPublicKeyFromPrivateKeyCurveP256(privateKey);
            break;
        case "Ed25519":
            keypair = nacl.sign.keyPair.fromSeed(privateKeyBuffer);
            // publicKeyUncompressed = Buffer.from(keypair.publicKey).toString("hex");
            publicKeyUncompressed = "";
            x = base64url.encode(Buffer.from(keypair.publicKey));
            y = "0x";
            break;
        default:
            throw new Error("createJWKFromWallet: unsupported curve: " + curve);
    }
    key = await jose.JWK.asKey({
        kid: _kid,
        kty: keyType,
        crv: curve,
        d: base64url.encode(privateKeyBuffer),
        x: x ?? hexToBase64Url(publicKeyUncompressed.substring(2, 66)),
        y: y ?? hexToBase64Url(publicKeyUncompressed.substring(66, 130)),
    });
    const jwk = key.toJSON(true) as JWK;
    return jwk;
}

export const createJWKFromPrivateKey = async (privateKey0?: string, options?: CreateJwkFromWalletOptions): Promise<JWK> => {
    let privateKey = privateKey0 || Wallet.createRandom().privateKey;
    if (!privateKey.toLowerCase().startsWith("0x")) privateKey = "0x"+privateKey;
    const wallet = new Wallet(privateKey);
    return createJWKFromWallet(wallet, options);
}

export const createJWK = async (_kid?: string, {crv = "P-256", kty = "EC", ...opts}: Omit<CreateJwkFromWalletOptions, "kid"> = {}): Promise<JWK> => {
    const kid = _kid || generarHash(Date.now().toString());
    return createJWKFromPrivateKey(undefined, {kid, crv, kty, ...opts});
}

export const getPrivateKeyFromJWK = (jwk: JWK): string => {
    const privateKey = '0x' + base64url.decode(jwk.d, 'hex');
    return privateKey;
}
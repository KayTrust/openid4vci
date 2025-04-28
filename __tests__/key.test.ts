import { describe, test, beforeAll, expect } from 'vitest'
import { Wallet } from 'ethers'

import { createJWK, createJWKFromPrivateKey, getPrivateKeyFromJWK, JWK } from '#src/key'

let basePrivateKey: string;
let jwk: JWK
let resultPrivateKey: string;

describe("Testing keys", () => {

    beforeAll(async () => {
        basePrivateKey = Wallet.createRandom().privateKey;
        jwk = await createJWKFromPrivateKey(basePrivateKey);
        resultPrivateKey = getPrivateKeyFromJWK(jwk);
    })

    test("test create jwk from privateKey", async () => {
        expect(resultPrivateKey).toBe(basePrivateKey);
    });

    test("test create privateKey from jwk and reverse privateKey to same jwk", async () => {
        const new_jwk = await createJWK();
        const newPrivateKey = getPrivateKeyFromJWK(new_jwk);
        const reverseJwk = await createJWKFromPrivateKey(newPrivateKey, {kid: new_jwk.kid, curve: "P-256"});
        
        expect(reverseJwk.d).toBe(new_jwk.d);
        expect(reverseJwk.x).toBe(new_jwk.x);
        expect(reverseJwk.y).toBe(new_jwk.y);
        expect(reverseJwk.crv).toBe(new_jwk.crv);
    });

})
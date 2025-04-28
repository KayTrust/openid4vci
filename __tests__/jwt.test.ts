import { describe, test, beforeAll, expect } from 'vitest'
import { createDidEthrFromPrivateKey, EthrDID } from '@kaytrust/did-ethr'
import { Wallet } from 'ethers'

import { createJWK, getPrivateKeyFromJWK, JWK } from '#src/key'
import { JwtCredentialPayload, ResolverOrOptions } from '@kaytrust/prooftypes'
import { createJWT, createJWTVc, verifyJWTFromVc } from '#src/jwt'

const issuer = "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbndPZwZdDNWhmLXsumWsx3QjsyPUaom15cgySHS2K27aSdrqBzZ9kSJHWKkDiQQ26gc7zCDVfvrzyuumtFNUBDMPEBqeodyAM6krZSvNDo7zWvt319Lxhd9dTEKMAAfLgbN";

const credential_payload: JwtCredentialPayload = {
    "sub": "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbp39niVvTewbQsNb1pbRPLaSAUiVcXraq8QuvkQyi7bnudp6aFdJPXdySf479htqsBas9cLwtjNEqdWUzUykgDpGZu6BrJX5noqWjnEtWPXSTvERS6jQkKfLzQrmTZL47RE",
    "nbf": 1727228247,
    "iss": issuer,
    "iat": 1727228247,
    "vc": {
      "issuanceDate": "2024-09-25T01:37:27Z",
      "credentialSubject": {
        "knowsAbout": {
          "provider": {
            "@type": "EducationalOrganization",
            "name": "Melon University"
          },
          "@type": "Course",
          "name": "Blockchain Technologies and their Application in the Real World",
          "about": "Example",
          "description": "A course on Blockchain Technologies and their Application in the Real World"
        },
        "@type": "Person",
        "name": "Jhan Carlos",
        "@id": "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbp39niVvTewbQsNb1pbRPLaSAUiVcXraq8QuvkQyi7bnudp6aFdJPXdySf479htqsBas9cLwtjNEqdWUzUykgDpGZu6BrJX5noqWjnEtWPXSTvERS6jQkKfLzQrmTZL47RE",
        "email": "test@gmail.com",
        "id": "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbp39niVvTewbQsNb1pbRPLaSAUiVcXraq8QuvkQyi7bnudp6aFdJPXdySf479htqsBas9cLwtjNEqdWUzUykgDpGZu6BrJX5noqWjnEtWPXSTvERS6jQkKfLzQrmTZL47RE"
      },
      "id": "vc:nttdata#4cb725d6-ba4e-4810-8b77-e396c9636234",
      "validFrom": "2024-09-25T01:37:27Z",
      "type": [
        "VerifiableCredential",
        "AcmeAccreditation"
      ],
      "issued": "2024-09-25T01:37:27Z",
      "@context": [
        "https://www.w3.org/2018/credentials/v1"
      ],
      "issuer": issuer
    },
    "jti": "vc:frutas#4cb725d6-ba4e-4810-8b77-e396c9636234"
  }

let jwk: JWK
let privateKey: string;

let issuerDidEthr: EthrDID;


const RPC_AMOY = process.env.RPC_AMOY!;
const AMOY_CHAIN_ID = 80002;

describe("Probar jwt con jwk", () => {

    beforeAll(async () => {
        jwk = await createJWK()
        console.log(jwk)
        privateKey = await getPrivateKeyFromJWK(jwk);
        issuerDidEthr = createDidEthrFromPrivateKey(privateKey, {rpcUrl: RPC_AMOY || "https://eth.merkle.io", chainNameOrId: AMOY_CHAIN_ID})
        credential_payload.iss = issuerDidEthr.did;
        credential_payload.vc.issuer = issuerDidEthr.did;
    })

    test("test createJWT with jwk", async () => {
        const jwt = await createJWT("ethr", {jwk}, credential_payload, {audience: "openid4vci.test"})
        console.log("jwt+jwk", jwt)
        expect(jwt).toBeTypeOf("string");
    })

    if (RPC_AMOY) {
        test("verify jwt", {timeout: 30000}, async () => {
            const jwt = await createJWTVc("ethr", {privateKey}, credential_payload, {audience: "openid4vci.test"})
            const resolver:ResolverOrOptions = {registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8', rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}
            const result = await verifyJWTFromVc(jwt, resolver, {audience: "openid4vci.test"});
            // console.log("result", result)
            expect(result.verified).toBe(true);
        })
    }

    test("test createJWT with both", async () => {
        const jwt = await createJWT("ethr", {jwk}, credential_payload, {audience: "openid4vci.test"})
        const jwt2 = await createJWT("ethr", {privateKey}, credential_payload, {audience: "openid4vci.test"})
        expect(jwt).toBe(jwt2);
    })

})

describe("Probar siop con privateKey + proofType", () => {

    beforeAll(async () => {
        privateKey = process.env.TEST_KEY || Wallet.createRandom().privateKey;
        issuerDidEthr = createDidEthrFromPrivateKey(privateKey, {chainNameOrId: AMOY_CHAIN_ID, rpcUrl: "https://eth.merkle.io"})
        credential_payload.iss = issuerDidEthr.did;
        credential_payload.vc.issuer = issuerDidEthr.did;
    })

    test("test createJWT with privateKey", async () => {
        const jwt = await createJWT("ethr", {privateKey}, credential_payload, {audience: "openid4vci.test", headers: {typ: "openid4vci-proof+jwt"}})
        console.log("jwt with prooftype + header", jwt)
        expect(jwt).toBeTypeOf("string")
    })
})
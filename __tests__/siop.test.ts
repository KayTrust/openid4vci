import { ResultUrlModeAsEnum, siopFlow } from '#src/siop'
import { describe, test, beforeAll, expect } from 'vitest'
import { createDidEthrFromPrivateKey, EthrDID } from '@kaytrust/did-ethr'
import { Wallet } from 'ethers'

import { createJWK, getPrivateKeyFromJWK, JWK } from '#src/key'
import { readUrlParams } from '#src/utils'
import { ProofTypeJWT, ResolverOrOptions } from '@kaytrust/prooftypes'

const credential_offering = "openid://?state=e0520dc4-b57a-47c5-8ebf-ed95175561c8&redirect_uri=https%3A%2F%2Ffrutas-back.demo.kaytrust.id%2Foauth2%2Fcb%2FvpToken&response_mode=query&response_type=vp_token&client_id=https%3A%2F%2Ffrutas-back.demo.kaytrust.id%2Foauth&scope=openid"

const credential = "eyJraWQiOiJkaWQ6a2V5OnoyZG16RDgxY2dQeDhWa2k3SmJ1dU1tRllyV1BnWW95dHlrVVozZXlxaHQxajlLYm5kUFp3WmRETldobUxYc3VtV3N4M1Fqc3lQVWFvbTE1Y2d5U0hTMksyN2FTZHJxQnpaOWtTSkhXS2tEaVFRMjZnYzd6Q0RWZnZyenl1dW10Rk5VQkRNUEVCcWVvZHlBTTZrclpTdk5Ebzd6V3Z0MzE5THhoZDlkVEVLTUFBZkxnYk4jejJkbXpEODFjZ1B4OFZraTdKYnV1TW1GWXJXUGdZb3l0eWtVWjNleXFodDFqOUtibmRQWndaZEROV2htTFhzdW1Xc3gzUWpzeVBVYW9tMTVjZ3lTSFMySzI3YVNkcnFCelo5a1NKSFdLa0RpUVEyNmdjN3pDRFZmdnJ6eXV1bXRGTlVCRE1QRUJxZW9keUFNNmtyWlN2TkRvN3pXdnQzMTlMeGhkOWRURUtNQUFmTGdiTiIsInR5cCI6IkpXVCIsImFsZyI6IkVTMjU2In0.eyJzdWIiOiJkaWQ6a2V5OnoyZG16RDgxY2dQeDhWa2k3SmJ1dU1tRllyV1BnWW95dHlrVVozZXlxaHQxajlLYnQ1aXpFWjloWFZpV3RYWmFKOEZSRlRNZG5IM3lEaGRlVk1pUDFqUUNqVVBiTnozcG1zeWZ3QWV2VUU1ZGk4MnJMQVhBbnpvUUMxMVVteXU3YUM4U28zcTRnV1pmVmtBQ2lpbUxCNGpHR3l6aDRqQW41VHpvanBCTDVENVJCYjZyWnIiLCJuYmYiOjE3MjcyNDc4NjQsImlzcyI6ImRpZDprZXk6ejJkbXpEODFjZ1B4OFZraTdKYnV1TW1GWXJXUGdZb3l0eWtVWjNleXFodDFqOUtibmRQWndaZEROV2htTFhzdW1Xc3gzUWpzeVBVYW9tMTVjZ3lTSFMySzI3YVNkcnFCelo5a1NKSFdLa0RpUVEyNmdjN3pDRFZmdnJ6eXV1bXRGTlVCRE1QRUJxZW9keUFNNmtyWlN2TkRvN3pXdnQzMTlMeGhkOWRURUtNQUFmTGdiTiIsImlhdCI6MTcyNzI0Nzg2NCwidmMiOnsiaXNzdWFuY2VEYXRlIjoiMjAyNC0wOS0yNVQwNzowNDoyNFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJrbm93c0Fib3V0Ijp7InByb3ZpZGVyIjp7IkB0eXBlIjoiRWR1Y2F0aW9uYWxPcmdhbml6YXRpb24iLCJuYW1lIjoiTWVsb24gVW5pdmVyc2l0eSJ9LCJAdHlwZSI6IkNvdXJzZSIsIm5hbWUiOiJCbG9ja2NoYWluIFRlY2hub2xvZ2llcyBhbmQgdGhlaXIgQXBwbGljYXRpb24gaW4gdGhlIFJlYWwgV29ybGQiLCJhYm91dCI6IkV4YW1wbGUiLCJkZXNjcmlwdGlvbiI6IkEgY291cnNlIG9uIEJsb2NrY2hhaW4gVGVjaG5vbG9naWVzIGFuZCB0aGVpciBBcHBsaWNhdGlvbiBpbiB0aGUgUmVhbCBXb3JsZCJ9LCJAdHlwZSI6IlBlcnNvbiIsIm5hbWUiOiJGZWxpcGUgR29uemFsZXoiLCJAaWQiOiJkaWQ6a2V5OnoyZG16RDgxY2dQeDhWa2k3SmJ1dU1tRllyV1BnWW95dHlrVVozZXlxaHQxajlLYnQ1aXpFWjloWFZpV3RYWmFKOEZSRlRNZG5IM3lEaGRlVk1pUDFqUUNqVVBiTnozcG1zeWZ3QWV2VUU1ZGk4MnJMQVhBbnpvUUMxMVVteXU3YUM4U28zcTRnV1pmVmtBQ2lpbUxCNGpHR3l6aDRqQW41VHpvanBCTDVENVJCYjZyWnIiLCJlbWFpbCI6ImZlbGlwZTEyMDM4NDgzOEBteWVtYWlsLmNvbSIsImlkIjoiZGlkOmtleTp6MmRtekQ4MWNnUHg4VmtpN0pidXVNbUZZcldQZ1lveXR5a1VaM2V5cWh0MWo5S2J0NWl6RVo5aFhWaVd0WFphSjhGUkZUTWRuSDN5RGhkZVZNaVAxalFDalVQYk56M3Btc3lmd0FldlVFNWRpODJyTEFYQW56b1FDMTFVbXl1N2FDOFNvM3E0Z1daZlZrQUNpaW1MQjRqR0d5emg0akFuNVR6b2pwQkw1RDVSQmI2clpyIn0sImlkIjoidmM6bnR0ZGF0YSNmNmIxZTZiZS1mNjk3LTRhYTItODA0OC1mNDg2MDVlOTlhZTciLCJ2YWxpZEZyb20iOiIyMDI0LTA5LTI1VDA3OjA0OjI0WiIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJBY21lQWNjcmVkaXRhdGlvbiJdLCJpc3N1ZWQiOiIyMDI0LTA5LTI1VDA3OjA0OjI0WiIsIkBjb250ZXh0IjpbImh0dHBzOlwvXC93d3cudzMub3JnXC8yMDE4XC9jcmVkZW50aWFsc1wvdjEiXSwiaXNzdWVyIjoiZGlkOmtleTp6MmRtekQ4MWNnUHg4VmtpN0pidXVNbUZZcldQZ1lveXR5a1VaM2V5cWh0MWo5S2JuZFBad1pkRE5XaG1MWHN1bVdzeDNRanN5UFVhb20xNWNneVNIUzJLMjdhU2RycUJ6WjlrU0pIV0trRGlRUTI2Z2M3ekNEVmZ2cnp5dXVtdEZOVUJETVBFQnFlb2R5QU02a3JaU3ZORG83eld2dDMxOUx4aGQ5ZFRFS01BQWZMZ2JOIn0sImp0aSI6InZjOm50dGRhdGEjZjZiMWU2YmUtZjY5Ny00YWEyLTgwNDgtZjQ4NjA1ZTk5YWU3In0.lCqaE4goWXvGBhW8zawL-Y0pXtGNeEOllcN0Or7iS0YFAGusJOQ8G6iwjz-UYWafY7HmDRreb4AoQtReBzX5GA"

let jwk: JWK
let privateKey: string;

let issuerDidEthr: EthrDID;


const RPC_AMOY = process.env.RPC_AMOY!;
const AMOY_CHAIN_ID = 80002;

describe("Probar siop con jwk", () => {

    beforeAll(async () => {
        jwk = await createJWK(Date.now()+"")
        console.log(jwk)
        privateKey = await getPrivateKeyFromJWK(jwk);
        issuerDidEthr = createDidEthrFromPrivateKey(privateKey, {rpcUrl: "https://eth.merkle.io", chainNameOrId: AMOY_CHAIN_ID})
    })

    test("test mango corp response_mode=query&response_type=vp_token", {timeout: 30000}, async () => {
        const result = await siopFlow(credential_offering, issuerDidEthr.did, {jwk}, [credential], {})
        console.log("url (jwt with jwk)", result.url)
        expect(result.modeAs).toBe(ResultUrlModeAsEnum.REQUEST)
    })

    // if (RPC_AMOY) {
    //     test("verified jwt vp", {timeout: 30000}, async () => {
    //         const result = await siopFlow(credential_offering, issuerDidEthr.did, {jwk}, [credential], {})
    //         // console.log("url (jwt with prooftype)", result.url)
    //         const params = readUrlParams(result.url!);
    //         const jwt = params.vp_token
    //         console.log("jwt with jwk - verify", jwt)
    //         const resolver:ResolverOrOptions = {registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8', rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}
    //         const proofTypePresentationEmpty = new ProofTypeJWT({resolver, verifyOptions: {
    //             audience: "https://frutas-back.demo.kaytrust.id/oauth",
    //         }}, true)
    //         const verified = await proofTypePresentationEmpty.verifyProof(jwt)
    //         expect(verified.verified).toBeTruthy();
    //     })
    // }
})

describe("Probar siop con privateKey + proofType", () => {

    beforeAll(async () => {
        privateKey = process.env.TEST_KEY || Wallet.createRandom().privateKey;
        issuerDidEthr = createDidEthrFromPrivateKey(privateKey, {chainNameOrId: AMOY_CHAIN_ID, rpcUrl: "https://eth.merkle.io"})
    })

    test("test mango corp response_mode=query&response_type=vp_token", {timeout: 30000}, async () => {
        const result = await siopFlow(credential_offering, issuerDidEthr.did, {privateKey}, [credential], {})
        console.log("url (jwt with prooftype)", result.url)
        expect(result.modeAs).toBe(ResultUrlModeAsEnum.REQUEST)
    })

    if (RPC_AMOY) {
        test("verified jwt vp", {timeout: 30000}, async () => {
            const result = await siopFlow(credential_offering, issuerDidEthr.did, {privateKey}, [credential], {})
            // console.log("url (jwt with prooftype)", result.url)
            const params = readUrlParams(result.url!);
            // console.log(params.vp_token)
            const jwt = params.vp_token
            const resolver:ResolverOrOptions = {registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8', rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}
            const proofTypePresentationEmpty = new ProofTypeJWT({resolver, verifyOptions: {
                audience: "https://frutas-back.demo.kaytrust.id/oauth",
            }}, true)
            const verified = await proofTypePresentationEmpty.verifyProof(jwt)
            expect(verified.verified).toBeTruthy();
        })
    }
})
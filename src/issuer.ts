import { createDidEthr } from "@kaytrust/did-ethr";
import { DidIssuerAlg, Issuer } from "@kaytrust/did-base";
import { NearDID } from "@kaytrust/did-near";
import { ES256KSigner, hexToBytes } from "did-jwt";

export type SupportedDid = 'key' | 'ethr' | 'near'

/**
 * Extracts the DID method from a DID string.
 * 
 * A DID (Decentralized Identifier) typically follows the format `did:method:specificId`.
 * This function uses a regular expression to extract and return the 'method' component.
 * If the DID does not follow the expected format, the function returns `undefined`.
 *
 * @param {string} did - The DID string from which the method will be extracted.
 * @returns {string | undefined} The extracted DID method, or `undefined` if the format is not valid.
 */
export const extractDidMethod = <didMethod extends string = string>(did: string): didMethod | undefined => {
    const pattern = /^did:([a-zA-Z0-9]+):/;
    const match = did.match(pattern);

    return match ? <didMethod>match[1] : undefined;
}

export const getIssuerWithPrivateKey = (did: string, privateKey: string): Issuer<DidIssuerAlg> => {
    const didMethod = extractDidMethod<SupportedDid>(did)
    switch (didMethod) {
        case "ethr":
            return <Issuer<DidIssuerAlg>>createDidEthr(did, {privateKey})
        case "near":
            return new NearDID({identifier: did, privateKey})
        default:
            return {
                did,
                signer: ES256KSigner(hexToBytes(privateKey), true),
                alg: "ES256K-R",
            }
    }
}
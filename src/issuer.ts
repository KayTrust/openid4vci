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
export const extractDidMethod = (did: string): string | undefined => {
    const pattern = /^did:([a-zA-Z0-9]+):/;
    const match = did.match(pattern);

    return match ? match[1] : undefined;
}
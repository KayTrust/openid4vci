export enum VerifierErrors {
    E809300 = "Given key does not match proof signature key.",
    E809301 = "Could not retrieve a properly public key. Public key is null.",
    E809302 = "Invalid DID: DID method '%s' not accepted.",
    E809303 = "There was a problem creating the request client to %s. Exception: %s",
    E809304 = "Proof type '%s' is not valid, it must be '%s'.",
    E809305 = "There was a problem validating jwt proof. Exception: %s",
    E809306 = "There was a problem validating status jwt. Exception: %s",
    E809307 = "There was a problem validating if credential is revoked. Exception: %s",
    E809308 = "There was a problem validating jwt. Exception: %s",
    E809309 = "There was a problem validating credential dates. Exception: %s",
    E809310 = "There was a problem getting 'verificationMethod' from didDocument. Exception: %s",
    E809311 = "There was a problem resolving the did '%s' from universal resolver client. Exception: %s",
    E809312 = "The issuer of the credential was not found in the trust chain",
    E809313 = "Extraction method for format '%s' not implemented.",
    E809314 = "Decoded credentialStatus is neither a Map nor an Array.",
    E809315 = "The credential status could not be processed due to the missing or invalid '%s' field in '%s'.",
    E809316 = "Could not extract public key from 'x5c' jwt header.",
    E809317 = "Could not extract public key from jwt header. Missing kid, jwk or x5c.",
    E809318 = "%s validation could not be perform because parameter %s is not present in the request. "
}

export type VerifierErrorCode = keyof typeof VerifierErrors;
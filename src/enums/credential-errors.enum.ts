export enum CredentialErrors {
    ECREDENTIAL0001 = "Failed to map the credential.", 
    ECREDENTIAL0002 = "Provided Verified Credential is not valid.", 
    ECREDENTIAL0003 = "Credential model not supported.", 
    ECREDENTIAL0004 = "Error parsing provided date. The date format is not valid, must be ISO format."
}

export type CredentialErrorCode = keyof typeof CredentialErrors
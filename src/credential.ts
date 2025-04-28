import { JwtCredentialPayload } from "@kaytrust/prooftypes";
import { CredentialErrorCode, CredentialErrors } from "./enums/credential-errors.enum";
import { instanceToPlain } from "class-transformer";

export interface CredentialSchema {
    id: string;
    type: string;
}

type BaseVC = JwtCredentialPayload["vc"]

export interface VerifiableCredential extends BaseVC {
    signingKid?: string;
    id?: string;
    issuer: string;
    credentialSubject: { id: any } & Record<string, any>;
    validFrom?: string;
    credentialSchema?: CredentialSchema;
    metadata?: Record<string, any>;
}



export interface VerifiableCredentialV1 extends VerifiableCredential {
    issuanceDate: string;
    issued?: string;
    expirationDate?: string;
}

export const createPayloadVCV1 = (vc: VerifiableCredentialV1) => {
    let errorMessage = "";
    let subject = "";

    let issuanceDateSeconds = 0;
    let expirationDateSeconds = 0;

    if (!vc.credentialSubject || !vc.credentialSubject?.id) {
        errorMessage += " Credential subject id is mandatory.";
    } else {
        subject = vc.credentialSubject.id.toString();
    }
    if (!vc.issuer) {
        errorMessage += " Issuer is mandatory.";
    }
    if (!vc.issuanceDate) {
        errorMessage += " Issuance date is mandatory.";
    } else {
        issuanceDateSeconds = parseInt((new Date(vc.issuanceDate).getTime() / 1000).toFixed(0));
    }

    if (errorMessage) {
        const code: CredentialErrorCode = "ECREDENTIAL0002";
        throw new Error(CredentialErrors[code] + " " + errorMessage + " (" + code + ")");
    }

    if (!vc["@context"]) vc["@context"] = [];
    if (!(vc["@context"].length)) (vc["@context"] as string[]).push("https://www.w3.org/2018/credentials/v1");

    if (vc.expirationDate) {
        expirationDateSeconds = parseInt((new Date(vc.expirationDate).getTime() / 1000).toFixed(0));
    }

    const payload: JwtCredentialPayload = {
        vc: instanceToPlain(vc) as VerifiableCredentialV1,
    }

    if (vc.id) payload.jti = vc.id;
    payload.sub = subject;
    payload.iss = vc.issuer;
    payload.nbf = issuanceDateSeconds;
    if (expirationDateSeconds) payload.exp = expirationDateSeconds;
    payload.iat = issuanceDateSeconds;

    return payload;
}
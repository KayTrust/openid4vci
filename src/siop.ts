// import { JWK } from "jose"
import { extractDidMethod } from "./issuer"
import { createJWT, SupportedDid } from "./jwt"
import { JWK } from "./key";
import { getJwtTime, readUrlParams } from "./utils"
import axios from 'axios'
import qs from 'qs';

export enum ResultUrlModeAsEnum {
    'RESPONSE' = 'response',
    'REQUEST' = 'request',
}

export enum ResponseModeEnum {
    'DIRECT_POST' = 'direct_post',
    'QUERY' = 'query',
    'FRAGMENT' = 'fragment'
}
export enum ResponseTypeEnum {
    'NONE' = 'none',
    'ID_TOKEN' = 'id_token',
    'VP_TOKEN' = 'vp_token',
}
export type ResponseMode = `${ResponseModeEnum}`
export type ResponseType = `${ResponseTypeEnum}`
export type UrlModeAs = `${ResultUrlModeAsEnum}`

export interface SIOPVPUrlParams {
    client_id: string
    presentation_definition?: string
    presentation_definition_uri?: string
    scope?: string
    response_type: ResponseType
    response_mode: ResponseMode
    state?: string
    redirect_uri: string
}

export const getToken = async (
    responseType: ResponseType,
    urlParams: Record<string, any>,
    jwk: JWK,
    did: string,
    credentials: string[] = [],
    validDays: number | undefined = undefined,
): Promise<string> => {
    let jwt: string = '';
    const jwtTimeParams = getJwtTime(validDays);
    const jwtParams: Record<string, any> = { nonce: urlParams.nonce, iss: did, sub: did, ...jwtTimeParams };
    if (responseType === ResponseTypeEnum.VP_TOKEN) {
        if (credentials.length === 0) throw new Error(`You don't have any credentials`);
        jwtParams.vp = {
            id: did,
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            type: ["VerifiablePresentation"],
            holder: did,
            verifiableCredential: credentials.map((credential) => credential),
        }
    }
    jwt = createJWT(extractDidMethod(did) as SupportedDid, jwk, urlParams.client_id, jwtParams);
    return jwt;
}

export type SiopResponse = {url?: string, modeAs: UrlModeAs, response_mode: ResponseMode}

export const siopFlow = (
    deepLinkContent: string,
    did: string,
    jwk: JWK,
    credentials: string[] = [],
    presentationSubmission: Record<string, any> = {},
    validDays: number | undefined = undefined,
): Promise<SiopResponse> => new Promise(async (resolve, reject) => {
    
    const urlParams = readUrlParams<SIOPVPUrlParams>(deepLinkContent);

    const responseType = urlParams.response_type;
    const jwt = await getToken(responseType, urlParams, jwk, did, credentials, validDays);

    const response_mode = urlParams.response_mode.toLowerCase() as ResponseMode

    switch (urlParams.response_mode.toLowerCase() as ResponseMode) {
        case ResponseModeEnum.DIRECT_POST:
            let body: Record<string, any> = { state: urlParams.state, presentation_submission: JSON.stringify(presentationSubmission) }
            
            if (responseType === ResponseTypeEnum.ID_TOKEN) body.id_token = jwt;
            else if (responseType === ResponseTypeEnum.VP_TOKEN) body.vp_token = jwt;
            let config: any = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                validateStatus: function (status: number) { return status < 500; }
            }

            let result = await axios.post(urlParams.redirect_uri, qs.stringify(body), config);
            
            if (result.status < 300) resolve({modeAs: ResultUrlModeAsEnum.RESPONSE, response_mode});
            else if (result.status === 302 && result.request) {
                const openIdRedirect = result.request?.responseHeaders.location;
                resolve({url: openIdRedirect, modeAs: ResultUrlModeAsEnum.RESPONSE, response_mode});
            }
            else {
                throw new Error(`Error ${result.status}: siopFlow()`);
            }
            break;
        case ResponseModeEnum.QUERY:
        case ResponseModeEnum.FRAGMENT:
        default:
            const redirectURL = new URL(urlParams.redirect_uri);
            if (responseType === ResponseTypeEnum.ID_TOKEN) redirectURL.searchParams.append('id_token', jwt);
            else if (responseType === ResponseTypeEnum.VP_TOKEN) redirectURL.searchParams.append('vp_token', jwt);
            if (urlParams.state) redirectURL.searchParams.append('state', urlParams.state);
            let redirectURLString = redirectURL.toString();
            if (urlParams.response_mode === ResponseModeEnum.FRAGMENT) redirectURLString = redirectURLString.replace('?', '#');
            resolve({url: redirectURLString, modeAs: ResultUrlModeAsEnum.REQUEST, response_mode});
    }
})
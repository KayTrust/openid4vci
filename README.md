# openid4vci

## SIOPv2

SIOPv2, or Self-Issued OpenID Provider v2, is an extension of the OpenID Connect protocol designed to empower users to act as their own OpenID Providers (OPs). This allows individuals to authenticate directly with relying parties (RPs), such as websites or applications, without depending on third-party identity providers.

```ts

import { siopFlow } from '@kaytrust/openid4vci'

const jwk = {
    // ...claims like below
}
/**
 * 
 * {
    "kty": "EC",
    "kid": "f4c96c8d-b93a-4453-af8b-929d78952d25",
    "crv": "P-256",
    "x": "wjML2kptMTGKdOyER9YCAzPpkpjxsqXcxxN8YFWHcrg",
    "y": "xXJ-pazOSIEgaOvmk58Nt6E2rLzC8NfncxNNZSxJAV4",
    "d": "Qd-oeFUg9cDI2_KhTX3VMWMMbUAWeinOlmAMh1ot4MY" // privateKey
    }
 * 
 **/

const issuer = "did:ethr:0x..." // your did:ethr
const credentials_to_share_in_jwt_format = ["...", "..."]

const uri_offering = "openid://?state=e0520dc4-b57a-47c5-8ebf-ed95175561c8&redirect_uri=https%3A%2F%2Ffrutas-back.demo.kaytrust.id%2Foauth2%2Fcb%2FvpToken&response_mode=query&response_type=vp_token&client_id=https%3A%2F%2Ffrutas-back.demo.kaytrust.id%2Foauth&scope=openid" // A URI that contains info about how handle the siop flow.

const result = await siopFlow(uri_offering, issuer, jwk, credentials_to_share_in_jwt_format)

/**
 * Results
 * 
 * {
 *  url?: string, // redirect uri
 *  modeAs: UrlModeAs, // "response" | "request"
 *  response_mode: ResponseMode // "direct_post" | "query" | "fragment"
 * }
 * 
 **/
```
# openid4vci

## SIOPv2

SIOPv2, or Self-Issued OpenID Provider v2, is an extension of the OpenID Connect protocol designed to empower users to act as their own OpenID Providers (OPs). This allows individuals to authenticate directly with relying parties (RPs), such as websites or applications, without depending on third-party identity providers.

```ts

import { siopFlow } from '@kaytrust/openid4vci'

const privateKey = "..."

const issuer = "did:ethr:0x..." // your did:ethr
const credentials_to_share_in_jwt_format = ["...", "..."]

const uri_offering = "openid://?state=e0520dc4-b57a-47c5-8ebf-ed95175561c8&redirect_uri=https%3A%2F%2Ffrutas-back.demo.kaytrust.id%2Foauth2%2Fcb%2FvpToken&response_mode=query&response_type=vp_token&client_id=https%3A%2F%2Ffrutas-back.demo.kaytrust.id%2Foauth&scope=openid" // A URI that contains info about how handle the siop flow.

const result = await siopFlow(uri_offering, issuer, {privateKey}, credentials_to_share_in_jwt_format)

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

### Verify vpToken

```ts
import { verifyJWTFromVp } from '@kaytrust/openid4vci'

const vpToken = "<JWT>" // jwt token

const RPC_AMOY = "<RPC_URL>";
const AMOY_CHAIN_ID = 80002;

const audience = "https://frutas-back.demo.kaytrust.id/oauth"

const verified_result = await verifyJWTFromVp(vpToken, {registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8', rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}, audience)
```
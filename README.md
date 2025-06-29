# Usage Documentation for `@kaytrust/openid4vci`

This extended guide will help you explore all the functionalities offered by the `@kaytrust/openid4vci` library. Below, you will find detailed examples on how to manage private and public keys, generate and verify JWTs, sign verifiable credentials (VC), verifiable presentations (VP), and much more.

---

## Table of Contents

1. [Installation](#installation)
2. [Key Concepts](#key-concepts)
3. [Managing Private and Public Keys](#managing-private-and-public-keys)
   - [Generate a JWK Key](#generate-a-jwk-key)
   - [Extract a Private Key from a JWK](#extract-a-private-key-from-a-jwk)
   - [Convert a Hexadecimal Private Key to JWK](#convert-a-hexadecimal-private-key-to-jwk)
4. [Generating and Verifying JWTs](#generating-and-verifying-jwts)
   - [Create a JWT](#create-a-jwt)
   - [Verify a JWT](#verify-a-jwt)
5. [Signing and Verifying Verifiable Credentials (VC)](#signing-and-verifying-verifiable-credentials-vc)
   - [Sign a Verifiable Credential](#sign-a-verifiable-credential)
   - [Verify a Verifiable Credential](#verify-a-verifiable-credential)
6. [Signing and Verifying Verifiable Presentations (VP)](#signing-and-verifying-verifiable-presentations-vp)
   - [Sign a Verifiable Presentation](#sign-a-verifiable-presentation)
   - [Verify a Verifiable Presentation](#verify-a-verifiable-presentation)
7. [Common Errors and Solutions](#common-errors-and-solutions)
8. [Contribution](#contribution)

---

## Installation

To install the library, use the `yarn` or `npm` package manager:

```bash
# Using Yarn
yarn add @kaytrust/openid4vci

# Using NPM
npm install @kaytrust/openid4vci
```

---

## Key Concepts

### OpenID4VCI
The **OpenID4VCI** (OpenID for Verifiable Credential Issuance) flow enables the issuance of verifiable credentials using OAuth 2.0. These credentials can be used to represent identity information and can be cryptographically linked to a holder.

### SIOPv2
**SIOPv2** (Self-Issued OpenID Provider v2) is an extension of OpenID Connect that allows users to act as their own identity provider. This means users can authenticate directly with applications without relying on third parties.

### JWK and JWT
- **JWK (JSON Web Key):** A standard format for representing cryptographic keys.
- **JWT (JSON Web Token):** A standard for creating signed tokens that contain structured information.

---

## Library Usage

### Generate a JWK Key

You can generate a JWK key from scratch or from an existing private key.

```typescript
import { createJWK } from '@kaytrust/openid4vci';

/**
 * Generate a JWK key from scratch
 */
const jwk = await createJWK();

console.log("Generated JWK key:", jwk);
```

### Extract a Private Key from a JWK

If you already have a JWK key, you can extract its private key.

```typescript
import { getPrivateKeyFromJWK } from '@kaytrust/openid4vci';

/**
 * Example of a JWK key
 */
const jwk = {
  kty: "EC",
  crv: "P-256",
  d: "...", // Private key in base64url format
  x: "...", // X coordinate of the public key
  y: "...", // Y coordinate of the public key
};

/**
 * Extract the private key
 */
const privateKey = getPrivateKeyFromJWK(jwk);

console.log("Extracted private key:", privateKey);
```

### Convert a Hexadecimal Private Key to JWK

If you have a private key in hexadecimal format, you can convert it to JWK.

```typescript
import { createJWKFromPrivateKey } from '@kaytrust/openid4vci';

/**
 * Private key in hexadecimal format
 */
const privateKeyHex = "0x...";

/**
 * Convert the private key to JWK
 */
const jwk = await createJWKFromPrivateKey(privateKeyHex);

console.log("JWK key generated from hexadecimal private key:", jwk);
```

---

## Generating and Verifying JWTs

### Create a JWT

You can generate a JWT using a private key or a JWK.

```typescript
import { createJWT } from '@kaytrust/openid4vci';

/**
 * Payload data
 */
const payload = {
  iss: "did:ethr:0x...", // Issuer
  sub: "did:ethr:0x...", // Subject
  aud: "https://example.com", // Audience
  iat: Math.floor(Date.now() / 1000), // Issued at time
};

/**
 * Private key to sign the JWT
 */
const privateKey = "0x...";

/**
 * Generate the JWT
 */
const jwt = await createJWT("ethr", { privateKey }, payload);

console.log("Generated JWT:", jwt);
```

### Verify a JWT

You can verify a JWT using a resolver and an expected audience.

```typescript
import { verifyJwtProof } from '@kaytrust/openid4vci';

/**
 * JWT to verify
 */
const jwt = "<JWT>";

/**
 * Resolver configuration
 */
const resolver = { /* Resolver configuration */ };
const audience = "https://example.com";

/**
 * Verify the JWT
 */
const did = await verifyJwtProof(jwt, { resolver, audience });

console.log("DID extracted from the JWT:", did);
```

---

## Signing and Verifying Verifiable Credentials (VC)

### Sign a Verifiable Credential

You can sign a verifiable credential using a payload and a private key.

```typescript
import { createJWTVc } from '@kaytrust/openid4vci';

/**
 * Verifiable credential data
 */
const vcPayload = {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential"],
  credentialSubject: {
    id: "did:ethr:0x...",
    name: "John Doe",
  },
  issuer: "did:ethr:0x...",
  issuanceDate: new Date().toISOString(),
};

/**
 * Private key to sign the credential
 */
const privateKey = "0x...";

/**
 * Sign the verifiable credential
 */
const jwtVc = await createJWTVc("ethr", { privateKey }, vcPayload);

console.log("JWT of the verifiable credential:", jwtVc);
```

### Verify a Verifiable Credential

You can verify a verifiable credential using a resolver.

```typescript
import { verifyJWTFromVc } from '@kaytrust/openid4vci';

/**
 * JWT of the verifiable credential
 */
const jwtVc = "<JWT>";

/**
 * Resolver configuration
 */
const resolver = { /* Resolver configuration */ };

/**
 * Verify the verifiable credential
 */
const result = await verifyJWTFromVc(jwtVc, resolver);

console.log("Verification result of the verifiable credential:", result);
```

---

## Signing and Verifying Verifiable Presentations (VP)

### Sign a Verifiable Presentation

You can sign a verifiable presentation using verifiable credentials and a private key.

```typescript
import { siopFlow } from '@kaytrust/openid4vci';

/**
 * Initial configuration
 */
const privateKey = "0x...";
const issuer = "did:ethr:0x...";
const credentials = ["<credential1>", "<credential2>"];
const uriOffering = "openid://?...";

/**
 * Sign the verifiable presentation
 */
const siopResult = await siopFlow(uriOffering, issuer, { privateKey }, credentials);

console.log("SIOPv2 flow result:", siopResult);
```

### Verify a Verifiable Presentation

You can verify a verifiable presentation using a resolver and an expected audience.

```typescript
import { verifyJWTFromVp } from '@kaytrust/openid4vci';

/**
 * JWT of the verifiable presentation
 */
const vpToken = "<JWT>";

/**
 * Resolver configuration
 */
const resolverConfig = {
  registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8',
  rpcUrl: "<RPC_URL>",
  chainId: 80002,
};
const audience = "https://example.com/oauth";

/**
 * Verify the verifiable presentation
 */
const verificationResult = await verifyJWTFromVp(vpToken, resolverConfig, audience);

console.log("Verification result of the verifiable presentation:", verificationResult);
```

---

## Common Errors and Solutions

1. **Error: "You don't have any credentials"**
   - **Cause:** No credentials were provided when executing the SIOPv2 flow.
   - **Solution:** Ensure you pass an array of credentials in the `credentials` parameter.

2. **Error: "Invalid DID"**
   - **Cause:** The provided DID does not have a valid format.
   - **Solution:** Verify that the DID follows the format `did:method:specificId`.

---

## Contribution

If you wish to contribute to this project, follow the steps described in the `CONTRIBUTING.md` file. We accept pull requests, bug reports, and improvement suggestions.
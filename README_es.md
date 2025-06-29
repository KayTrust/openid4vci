# Documentación de Uso `@kaytrust/openid4vci`

Esta guía ampliada te ayudará a explorar todas las funcionalidades que ofrece la librería `@kaytrust/openid4vci`. A continuación, se describen ejemplos detallados sobre cómo gestionar claves privadas y públicas, generar y verificar JWT, firmar credenciales verificables (VC) y presentaciones verificables (VP), y mucho más.

---

## Tabla de Contenidos

1. [Instalación](#instalación)
2. [Conceptos Clave](#conceptos-clave)
3. [Gestión de Claves Privadas y Públicas](#gestión-de-claves-privadas-y-públicas)
   - [Generar una Clave JWK](#generar-una-clave-jwk)
   - [Obtener una Clave Privada desde un JWK](#obtener-una-clave-privada-desde-un-jwk)
   - [Convertir una Clave Privada Hexadecimal a JWK](#convertir-una-clave-privada-hexadecimal-a-jwk)
4. [Generación y Verificación de JWT](#generación-y-verificación-de-jwt)
   - [Crear un JWT](#crear-un-jwt)
   - [Verificar un JWT](#verificar-un-jwt)
5. [Firmar y Verificar Credenciales Verificables (VC)](#firmar-y-verificar-credenciales-verificables-vc)
   - [Firmar una Credencial Verificable](#firmar-una-credencial-verificable)
   - [Verificar una Credencial Verificable](#verificar-una-credencial-verificable)
6. [Firmar y Verificar Presentaciones Verificables (VP)](#firmar-y-verificar-presentaciones-verificables-vp)
   - [Firmar una Presentación Verificable](#firmar-una-presentación-verificable)
   - [Verificar una Presentación Verificable](#verificar-una-presentación-verificable)
7. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
8. [Contribución](#contribución)

---

## Instalación

Para instalar la librería, utiliza el gestor de paquetes `yarn` o `npm`:

```bash
# Usando Yarn
yarn add @kaytrust/openid4vci

# Usando NPM
npm install @kaytrust/openid4vci
```

---

## Conceptos Clave

### OpenID4VCI
El flujo **OpenID4VCI** (OpenID for Verifiable Credential Issuance) permite la emisión de credenciales verificables utilizando OAuth 2.0. Estas credenciales pueden ser utilizadas para representar información de identidad y pueden estar vinculadas criptográficamente a un titular.

### SIOPv2
**SIOPv2** (Self-Issued OpenID Provider v2) es una extensión de OpenID Connect que permite a los usuarios actuar como su propio proveedor de identidad. Esto significa que los usuarios pueden autenticarse directamente con aplicaciones sin depender de terceros.

### JWK y JWT
- **JWK (JSON Web Key):** Es un formato estándar para representar claves criptográficas.
- **JWT (JSON Web Token):** Es un estándar para crear tokens firmados que contienen información estructurada.

---

## Uso de la Librería
### Generar una Clave JWK

Puedes generar una clave JWK desde cero o a partir de una clave privada existente.

```typescript
import { createJWK } from '@kaytrust/openid4vci';

/**
 * Generar una clave JWK desde cero
 */
const jwk = await createJWK();

console.log("Clave JWK generada:", jwk);
```

### Obtener una Clave Privada desde un JWK

Si ya tienes una clave JWK, puedes extraer su clave privada.

```typescript
import { getPrivateKeyFromJWK } from '@kaytrust/openid4vci';

/**
 * Ejemplo de clave JWK
 */
const jwk = {
  kty: "EC",
  crv: "P-256",
  d: "...", // Clave privada en formato base64url
  x: "...", // Coordenada X de la clave pública
  y: "...", // Coordenada Y de la clave pública
};

/**
 * Extraer la clave privada
 */
const privateKey = getPrivateKeyFromJWK(jwk);

console.log("Clave privada extraída:", privateKey);
```

### Convertir una Clave Privada Hexadecimal a JWK

Si tienes una clave privada en formato hexadecimal, puedes convertirla a JWK.

```typescript
import { createJWKFromPrivateKey } from '@kaytrust/openid4vci';

/**
 * Clave privada en formato hexadecimal
 */
const privateKeyHex = "0x...";

/**
 * Convertir la clave privada a JWK
 */
const jwk = await createJWKFromPrivateKey(privateKeyHex);

console.log("Clave JWK generada desde clave privada hexadecimal:", jwk);
```

---

## Generación y Verificación de JWT

### Crear un JWT

Puedes generar un JWT utilizando una clave privada o un JWK.

```typescript
import { createJWT } from '@kaytrust/openid4vci';

/**
 * Datos del payload
 */
const payload = {
  iss: "did:ethr:0x...", // Emisor
  sub: "did:ethr:0x...", // Sujeto
  aud: "https://example.com", // Audiencia
  iat: Math.floor(Date.now() / 1000), // Tiempo de emisión
};

/**
 * Clave privada para firmar el JWT
 */
const privateKey = "0x...";

/**
 * Generar el JWT
 */
const jwt = await createJWT("ethr", { privateKey }, payload);

console.log("JWT generado:", jwt);
```

### Verificar un JWT

Puedes verificar un JWT utilizando un resolver y una audiencia esperada.

```typescript
import { verifyJwtProof } from '@kaytrust/openid4vci';

/**
 * JWT a verificar
 */
const jwt = "<JWT>";

/**
 * Configuración del resolver
 */
const resolver = { /* Configuración del resolver */ };
const audience = "https://example.com";

/**
 * Verificar el JWT
 */
const did = await verifyJwtProof(jwt, { resolver, audience });

console.log("DID extraído del JWT:", did);
```

---

## Firmar y Verificar Credenciales Verificables (VC)

### Firmar una Credencial Verificable

Puedes firmar una credencial verificable utilizando un payload y una clave privada.

```typescript
import { createJWTVc } from '@kaytrust/openid4vci';

/**
 * Datos de la credencial verificable
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
 * Clave privada para firmar la credencial
 */
const privateKey = "0x...";

/**
 * Firmar la credencial verificable
 */
const jwtVc = await createJWTVc("ethr", { privateKey }, vcPayload);

console.log("JWT de la credencial verificable:", jwtVc);
```

### Verificar una Credencial Verificable

Puedes verificar una credencial verificable utilizando un resolver.

```typescript
import { verifyJWTFromVc } from '@kaytrust/openid4vci';

/**
 * JWT de la credencial verificable
 */
const jwtVc = "<JWT>";

/**
 * Configuración del resolver
 */
const resolver = { /* Configuración del resolver */ };

/**
 * Verificar la credencial verificable
 */
const result = await verifyJWTFromVc(jwtVc, resolver);

console.log("Resultado de la verificación de la credencial verificable:", result);
```

---

## Firmar y Verificar Presentaciones Verificables (VP)

### Firmar una Presentación Verificable

Puedes firmar una presentación verificable utilizando credenciales verificables y una clave privada.

```typescript
import { siopFlow } from '@kaytrust/openid4vci';

/**
 * Configuración inicial
 */
const privateKey = "0x...";
const issuer = "did:ethr:0x...";
const credentials = ["<credential1>", "<credential2>"];
const uriOffering = "openid://?...";

/**
 * Firmar la presentación verificable
 */
const siopResult = await siopFlow(uriOffering, issuer, { privateKey }, credentials);

console.log("Resultado del flujo SIOPv2:", siopResult);
```

### Verificar una Presentación Verificable

Puedes verificar una presentación verificable utilizando un resolver y una audiencia esperada.

```typescript
import { verifyJWTFromVp } from '@kaytrust/openid4vci';

/**
 * JWT de la presentación verificable
 */
const vpToken = "<JWT>";

/**
 * Configuración del resolver
 */
const resolverConfig = {
  registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8',
  rpcUrl: "<RPC_URL>",
  chainId: 80002,
};
const audience = "https://example.com/oauth";

/**
 * Verificar la presentación verificable
 */
const verificationResult = await verifyJWTFromVp(vpToken, resolverConfig, audience);

console.log("Resultado de la verificación de la presentación verificable:", verificationResult);
```

---

## Errores Comunes y Soluciones

1. **Error: "You don't have any credentials"**
   - **Causa:** No se proporcionaron credenciales al ejecutar el flujo SIOPv2.
   - **Solución:** Asegúrate de pasar un array de credenciales en el parámetro `credentials`.

2. **Error: "Invalid DID"**
   - **Causa:** El DID proporcionado no tiene un formato válido.
   - **Solución:** Verifica que el DID siga el formato `did:method:specificId`.

---

## Contribución

Si deseas contribuir a este proyecto, sigue los pasos descritos en el archivo `CONTRIBUTING.md`. Aceptamos pull requests, reportes de errores y sugerencias de mejora.

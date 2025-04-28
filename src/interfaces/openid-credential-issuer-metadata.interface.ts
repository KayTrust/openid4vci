import { OpenIdCredentialMetadata } from './openid-credential-metadata.interface';

export interface OpenIdCredentialIssuerMetadata {
  display?: Array<{
    name: string;
    locale: string;
    logo?: {
      uri: string;
      alt_text: string;
    };
  }>;
  credential_issuer: string;
  authorization_server: string;
  credential_endpoint: string;
  deferred_credential_endpoint?: string;
  credentials_supported: OpenIdCredentialMetadata[];
}

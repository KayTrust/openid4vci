import { OpenidCredentialFormat } from '../enums/openid-credential-format.enum';

export interface OpenIdCredentialMetadata {
  format: OpenidCredentialFormat | keyof typeof OpenidCredentialFormat;
  id: string;
  types: string[];
  display?: Array<{
    name: string;
    locale: string;
  }>;
}

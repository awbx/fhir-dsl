/**
 * SMART on FHIR v2.2 well-known configuration.
 * @see https://hl7.org/fhir/smart-app-launch/conformance.html
 */
export interface SmartConfiguration {
  issuer?: string;
  jwks_uri?: string;
  authorization_endpoint: string;
  token_endpoint: string;
  token_endpoint_auth_methods_supported?: string[];
  token_endpoint_auth_signing_alg_values_supported?: string[];
  registration_endpoint?: string;
  smart_web_messaging_uri?: string;
  scopes_supported?: string[];
  response_types_supported?: string[];
  management_endpoint?: string;
  introspection_endpoint?: string;
  revocation_endpoint?: string;
  capabilities: string[];
  code_challenge_methods_supported: string[];
  grant_types_supported?: string[];
  [k: string]: unknown;
}

/**
 * OAuth 2.0 token response. SMART context parameters (patient, encounter,
 * fhirContext, id_token) appear alongside the standard fields.
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope: string;
  refresh_token?: string;
  id_token?: string;
  patient?: string;
  encounter?: string;
  fhirContext?: FhirContextEntry[];
  need_patient_banner?: boolean;
  smart_style_url?: string;
  tenant?: string;
  [k: string]: unknown;
}

export interface FhirContextEntry {
  reference?: string;
  canonical?: string;
  identifier?: unknown;
  type?: string;
  role?: string;
}

/**
 * Persisted token snapshot. `expires_at` is absolute epoch milliseconds so a
 * store can make expiry decisions without knowing when the token was issued.
 */
export interface StoredToken extends TokenResponse {
  expires_at?: number;
}

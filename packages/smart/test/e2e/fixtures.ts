import type { FhirSchema } from "@fhir-dsl/core";
import type { SmartConfiguration } from "../../src/index.js";

export const FHIR_BASE = "https://fhir.example/r4";
export const AUTH_BASE = "https://auth.example";
export const AUTHORIZE_URL = `${AUTH_BASE}/authorize`;
export const TOKEN_URL = `${AUTH_BASE}/token`;
export const WELL_KNOWN_URL = `${FHIR_BASE}/.well-known/smart-configuration`;

export const smartConfigFixture: SmartConfiguration = {
  issuer: FHIR_BASE,
  authorization_endpoint: AUTHORIZE_URL,
  token_endpoint: TOKEN_URL,
  capabilities: [
    "launch-ehr",
    "launch-standalone",
    "authorize-post",
    "client-public",
    "client-confidential-asymmetric",
    "permission-v2",
  ],
  code_challenge_methods_supported: ["S256"],
  grant_types_supported: ["authorization_code", "client_credentials", "refresh_token"],
  token_endpoint_auth_methods_supported: ["private_key_jwt"],
  token_endpoint_auth_signing_alg_values_supported: ["RS384", "ES384"],
  scopes_supported: ["openid", "fhirUser", "offline_access", "launch", "launch/patient", "patient/*.rs", "system/*.rs"],
};

export const patientAlice = {
  resourceType: "Patient",
  id: "pat-alice",
  active: true,
  name: [{ family: "Smith", given: ["Alice"] }],
  gender: "female",
  birthDate: "1990-04-12",
};

export const bundleOneAlice = {
  resourceType: "Bundle",
  type: "searchset",
  entry: [{ resource: patientAlice, search: { mode: "match" } }],
};

export interface TestPatient {
  resourceType: "Patient";
  id?: string;
  active?: boolean;
  name?: { family?: string; given?: string[] }[];
  gender?: string;
  birthDate?: string;
}

export interface E2ESchema extends FhirSchema {
  resources: {
    Patient: TestPatient;
  };
  searchParams: {
    Patient: Record<string, never>;
  };
}

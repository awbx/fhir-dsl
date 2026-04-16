import type { Resource } from "@fhir-dsl/types";

/**
 * Minimal test-only interfaces that extend Resource with just the properties
 * needed by runtime tests. Type-level tests live in types.test.ts.
 */

export interface TestPatient extends Resource {
  resourceType: "Patient";
  name?: Array<{ use?: string; family?: string; given?: string[] }>;
  active?: boolean | string | number;
  birthDate?: string;
  telecom?: Array<{ system?: string; value?: string }>;
  multipleBirthInteger?: number | string;
}

export interface TestObservation extends Resource {
  resourceType: "Observation";
  code?: { coding?: Array<{ system?: string; code?: string }> };
  valueQuantity?: { value?: number; unit?: string };
  valueInteger?: number | string;
  valueString?: string;
  effectiveDateTime?: string;
  status?: string;
}

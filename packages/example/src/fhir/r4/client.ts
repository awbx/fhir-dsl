import { createFhirClient, type FhirClientConfig } from "@fhir-dsl/core";
import type { FhirResourceMap, IncludeRegistry, SearchParamRegistry } from "./registry.js";
import type { ProfileRegistry } from "./profiles/profile-registry.js";

export type GeneratedSchema = {
  resources: FhirResourceMap;
  searchParams: SearchParamRegistry;
  includes: IncludeRegistry;
  profiles: ProfileRegistry;
};

export function createClient(config: FhirClientConfig) {
  return createFhirClient<GeneratedSchema>(config);
}


import { createFhirClient, type FhirClientConfig } from "@fhir-dsl/core";
import type { ProfileRegistry } from "./profiles/profile-registry.js";
import {
  type FhirResourceMap,
  type IncludeExpressions,
  type IncludeRegistry,
  includeExpressions,
  type RevIncludeRegistry,
  type SearchParamRegistry,
} from "./registry.js";

export type GeneratedSchema = {
  resources: FhirResourceMap;
  searchParams: SearchParamRegistry;
  includes: IncludeRegistry;
  revIncludes: RevIncludeRegistry;
  includeExpressions: IncludeExpressions;
  profiles: ProfileRegistry;
};

export function createClient(config: FhirClientConfig) {
  return createFhirClient<GeneratedSchema>({ includeExpressions, ...config });
}

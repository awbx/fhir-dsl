import { createFhirClient, type FhirClientConfig } from "@fhir-dsl/core";
import { includeExpressions, type FhirResourceMap, type IncludeExpressions, type IncludeRegistry, type RevIncludeRegistry, type SearchParamRegistry } from "./registry.js";

export type GeneratedSchema = {
  resources: FhirResourceMap;
  searchParams: SearchParamRegistry;
  includes: IncludeRegistry;
  revIncludes: RevIncludeRegistry;
  includeExpressions: IncludeExpressions;
  profiles: Record<string, never>;
};

export function createClient(config: FhirClientConfig) {
  return createFhirClient<GeneratedSchema>({ includeExpressions, ...config });
}


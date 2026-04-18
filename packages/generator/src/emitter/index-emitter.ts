import { toKebabCase } from "@fhir-dsl/utils";
import type { ResourceModel } from "../model/resource-model.js";

export function emitResourceIndex(resources: ResourceModel[], extraExports?: string[]): string {
  const lines: string[] = [];
  const sorted = [...resources].sort((a, b) => a.name.localeCompare(b.name));

  lines.push('export * from "./primitives.js";');
  lines.push('export * from "./datatypes.js";');
  lines.push('export * from "./search-param-types.js";');
  lines.push('export * from "./search-params.js";');
  lines.push('export * from "./registry.js";');
  lines.push('export * from "./client.js";');

  if (extraExports?.length) {
    for (const exp of extraExports) {
      lines.push(`export * from "${exp}";`);
    }
  }

  lines.push("");

  for (const r of sorted) {
    const fileName = toKebabCase(r.name);
    lines.push(`export * from "./resources/${fileName}.js";`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function emitRootIndex(version: string): string {
  return `export * from "./${version.toLowerCase()}/index.js";\n`;
}

export function emitClient(hasProfiles: boolean, hasValidator: boolean = false): string {
  const lines: string[] = [];

  lines.push('import { createFhirClient, type FhirClientConfig } from "@fhir-dsl/core";');
  lines.push(
    'import type { FhirResourceMap, IncludeRegistry, RevIncludeRegistry, SearchParamRegistry } from "./registry.js";',
  );
  if (hasProfiles) {
    lines.push('import type { ProfileRegistry } from "./profiles/profile-registry.js";');
  }
  if (hasValidator) {
    lines.push('import { SchemaRegistry } from "./schemas/schema-registry.js";');
  }
  lines.push("");

  lines.push("export type GeneratedSchema = {");
  lines.push("  resources: FhirResourceMap;");
  lines.push("  searchParams: SearchParamRegistry;");
  lines.push("  includes: IncludeRegistry;");
  lines.push("  revIncludes: RevIncludeRegistry;");
  lines.push(`  profiles: ${hasProfiles ? "ProfileRegistry" : "Record<string, never>"};`);
  lines.push("};");
  lines.push("");

  lines.push("export function createClient(config: FhirClientConfig) {");
  if (hasValidator) {
    lines.push("  return createFhirClient<GeneratedSchema>({ schemas: SchemaRegistry, ...config });");
  } else {
    lines.push("  return createFhirClient<GeneratedSchema>(config);");
  }
  lines.push("}");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

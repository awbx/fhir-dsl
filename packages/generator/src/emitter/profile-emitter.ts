import { fhirTypeToTs, isComplexType, isPrimitive, toKebabCase } from "@fhir-dsl/utils";
import type { ProfileModel } from "../model/profile-model.js";
import type { PropertyModel, TypeRef } from "../model/resource-model.js";

export function emitProfile(model: ProfileModel): string {
  const lines: string[] = [];
  const primitiveImports = new Set<string>();
  const datatypeImports = new Set<string>();

  collectImports(model.constrainedProperties, primitiveImports, datatypeImports);

  // Import the base resource type
  const baseFileName = toKebabCase(model.baseResourceType);

  if (primitiveImports.size > 0) {
    const sorted = [...primitiveImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "../primitives.js";`);
  }

  if (datatypeImports.size > 0) {
    const sorted = [...datatypeImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "../datatypes.js";`);
  }

  lines.push(`import type { ${model.baseResourceType} } from "../resources/${baseFileName}.js";`);

  lines.push("");

  // JSDoc
  if (model.description) {
    lines.push("/**");
    lines.push(` * ${model.description}`);
    lines.push(` * ${model.url}`);
    lines.push(" */");
  }

  lines.push(`export interface ${model.name} extends ${model.baseResourceType} {`);

  for (const prop of model.constrainedProperties) {
    lines.push(`  ${formatProperty(prop)}`);
  }

  lines.push("}");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function emitProfileIndex(profiles: ProfileModel[]): string {
  const lines: string[] = [];

  for (const p of profiles.sort((a, b) => a.name.localeCompare(b.name))) {
    const fileName = toKebabCase(p.name);
    lines.push(`export * from "./${fileName}.js";`);
  }

  lines.push(`export * from "./profile-registry.js";`);
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function emitProfileRegistry(profiles: ProfileModel[]): string {
  const lines: string[] = [];

  // Group profiles by base resource type
  const byResource = new Map<string, ProfileModel[]>();
  for (const p of profiles) {
    const list = byResource.get(p.baseResourceType) ?? [];
    list.push(p);
    byResource.set(p.baseResourceType, list);
  }

  // Imports
  for (const p of profiles.sort((a, b) => a.name.localeCompare(b.name))) {
    const fileName = toKebabCase(p.name);
    lines.push(`import type { ${p.name} } from "./${fileName}.js";`);
  }
  lines.push("");

  lines.push("export interface ProfileRegistry {");

  const sortedResources = [...byResource.keys()].sort();
  for (const resourceType of sortedResources) {
    const resourceProfiles = byResource.get(resourceType)!;
    lines.push(`  ${resourceType}: {`);
    for (const p of resourceProfiles.sort((a, b) => a.slug.localeCompare(b.slug))) {
      lines.push(`    "${p.slug}": ${p.name};`);
    }
    lines.push("  };");
  }

  lines.push("}");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function formatProperty(prop: PropertyModel): string {
  const optional = prop.isRequired ? "" : "?";
  const tsType = formatPropertyType(prop);
  const arraySuffix = prop.isArray ? "[]" : "";
  return `${prop.name}${optional}: ${tsType}${arraySuffix};`;
}

function formatPropertyType(prop: PropertyModel): string {
  if (prop.types.length === 0) return "unknown";
  if (prop.types.length === 1) {
    return formatTypeRef(prop.types[0]!);
  }
  return prop.types.map(formatTypeRef).join(" | ");
}

function formatTypeRef(typeRef: TypeRef): string {
  if (typeRef.code === "Reference" && typeRef.targetProfiles?.length) {
    const targets = typeRef.targetProfiles.map((t) => `"${t}"`).join(" | ");
    return `Reference<${targets}>`;
  }
  return fhirTypeToTs(typeRef.code);
}

function collectImports(properties: PropertyModel[], primitives: Set<string>, datatypes: Set<string>): void {
  for (const prop of properties) {
    for (const typeRef of prop.types) {
      if (typeRef.code === "Reference") {
        datatypes.add("Reference");
        continue;
      }
      const tsType = fhirTypeToTs(typeRef.code);
      if (isPrimitive(typeRef.code)) {
        primitives.add(tsType);
      } else if (isComplexType(typeRef.code)) {
        datatypes.add(tsType);
      }
    }
  }
}

import { toKebabCase } from "@fhir-dsl/utils";
import type { ProfileModel, SliceModel } from "../model/profile-model.js";
import type { PropertyModel, TypeRef } from "../model/resource-model.js";
import type { TypeMapper } from "../spec/type-mapping.js";

export function emitProfile(model: ProfileModel, mapper: TypeMapper): string {
  const lines: string[] = [];
  const primitiveImports = new Set<string>();
  const datatypeImports = new Set<string>();

  collectImports(model.constrainedProperties, mapper, primitiveImports, datatypeImports);
  collectSliceImports(model.slices, mapper, primitiveImports, datatypeImports);

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
    lines.push(`  ${formatProperty(prop, mapper)}`);
  }

  // Emit slice-named optional fields after the regular constrained
  // properties. They sit alongside the underlying array (e.g.,
  // `extension`) in the type — runtime code keeps using the array, while
  // user code reaches for `.extension_usCoreRace` to get the type-narrowed
  // hint of which element is intended.
  for (const slice of model.slices) {
    lines.push(`  ${formatSliceProperty(slice, mapper)}`);
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

function formatProperty(prop: PropertyModel, mapper: TypeMapper): string {
  const optional = prop.isRequired ? "" : "?";
  const tsType = formatPropertyType(prop, mapper);
  const arraySuffix = prop.isArray ? "[]" : "";
  return `${prop.name}${optional}: ${tsType}${arraySuffix};`;
}

function formatPropertyType(prop: PropertyModel, mapper: TypeMapper): string {
  if (prop.types.length === 0) return "unknown";
  if (prop.types.length === 1) {
    return formatTypeRef(prop.types[0]!, mapper);
  }
  return prop.types.map((t) => formatTypeRef(t, mapper)).join(" | ");
}

function formatTypeRef(typeRef: TypeRef, mapper: TypeMapper): string {
  if (typeRef.code === "Reference" && typeRef.targetProfiles?.length) {
    const targets = typeRef.targetProfiles.map((t) => `"${t}"`).join(" | ");
    return `Reference<${targets}>`;
  }
  return mapper.fhirTypeToTs(typeRef.code);
}

function collectImports(
  properties: PropertyModel[],
  mapper: TypeMapper,
  primitives: Set<string>,
  datatypes: Set<string>,
): void {
  for (const prop of properties) {
    for (const typeRef of prop.types) {
      if (typeRef.code === "Reference") {
        datatypes.add("Reference");
        continue;
      }
      const tsType = mapper.fhirTypeToTs(typeRef.code);
      if (mapper.isPrimitive(typeRef.code)) {
        primitives.add(tsType);
      } else if (mapper.isComplexType(typeRef.code)) {
        datatypes.add(tsType);
      }
    }
  }
}

function formatSliceProperty(slice: SliceModel, mapper: TypeMapper): string {
  // All slices are emitted as optional — the slice-named field is a
  // type-level convenience pointing at one (or several) elements of the
  // underlying array, and absence of the field never means absence of the
  // array. Cardinality is preserved via single-vs-array-of regardless.
  const tsType = formatSliceType(slice, mapper);
  const arraySuffix = isMultiCardinality(slice.max) ? "[]" : "";
  return `${slice.basePropName}_${slice.sanitizedName}?: ${tsType}${arraySuffix};`;
}

function formatSliceType(slice: SliceModel, mapper: TypeMapper): string {
  if (slice.types.length === 0) return "Extension";
  if (slice.types.length === 1) {
    return formatTypeRef(slice.types[0]!, mapper);
  }
  return slice.types.map((t) => formatTypeRef(t, mapper)).join(" | ");
}

function isMultiCardinality(max: string): boolean {
  if (max === "*") return true;
  const n = Number.parseInt(max, 10);
  return Number.isFinite(n) && n > 1;
}

function collectSliceImports(
  slices: SliceModel[],
  mapper: TypeMapper,
  primitives: Set<string>,
  datatypes: Set<string>,
): void {
  for (const slice of slices) {
    if (slice.types.length === 0) {
      // Default Extension fallback.
      datatypes.add("Extension");
      continue;
    }
    for (const typeRef of slice.types) {
      if (typeRef.code === "Reference") {
        datatypes.add("Reference");
        continue;
      }
      const tsType = mapper.fhirTypeToTs(typeRef.code);
      if (mapper.isPrimitive(typeRef.code)) {
        primitives.add(tsType);
      } else if (mapper.isComplexType(typeRef.code)) {
        datatypes.add(tsType);
      } else {
        // Backbone or named type — best-effort import from datatypes.
        datatypes.add(tsType);
      }
    }
  }
}

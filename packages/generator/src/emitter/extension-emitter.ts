import { toKebabCase } from "@fhir-dsl/utils";
import type { ExtensionModel } from "../model/extension-model.js";
import type { TypeRef } from "../model/resource-model.js";
import type { TypeMapper } from "../spec/type-mapping.js";

// Phase 2.2 — emit a typed `Extension<URL>` interface for each
// IG-defined extension. The shape:
//
//   export interface USCoreRaceExtension
//     extends Extension<"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"> {
//     url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race";
//     valueCodeableConcept?: CodeableConcept;
//   }
//
// Profile slices that target this extension (via `slice.extensionUrl`)
// can swap their generic `Extension` type for the named interface — the
// emitter exposes `extensionImportFor(url)` so profile-emitter can pick
// up the right import path without duplicating naming logic.

export function emitExtension(model: ExtensionModel, mapper: TypeMapper): string {
  const lines: string[] = [];
  const primitiveImports = new Set<string>();
  const datatypeImports = new Set<string>(["Extension"]);

  if (!model.isComplex) {
    for (const type of model.valueTypes) {
      collectTypeImport(type, mapper, primitiveImports, datatypeImports);
    }
  }

  if (primitiveImports.size > 0) {
    const sorted = [...primitiveImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "../primitives.js";`);
  }
  if (datatypeImports.size > 0) {
    const sorted = [...datatypeImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "../datatypes.js";`);
  }
  lines.push("");

  if (model.description) {
    lines.push("/**");
    lines.push(` * ${model.description}`);
    lines.push(` * ${model.url}`);
    lines.push(" */");
  }

  const urlLiteral = JSON.stringify(model.url);
  lines.push(`export interface ${model.name} extends Extension<${urlLiteral}> {`);
  lines.push(`  url: ${urlLiteral};`);

  if (!model.isComplex && model.valueTypes.length > 0) {
    for (const type of model.valueTypes) {
      const propName = `value${capitalize(canonicalCode(type, mapper))}`;
      const tsType = formatTypeRef(type, mapper);
      lines.push(`  ${propName}?: ${tsType};`);
    }
  }

  lines.push("}");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function emitExtensionIndex(extensions: ExtensionModel[]): string {
  const lines: string[] = [];
  for (const ext of [...extensions].sort((a, b) => a.name.localeCompare(b.name))) {
    const fileName = toKebabCase(ext.name);
    lines.push(`export * from "./${fileName}.js";`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function emitExtensionRegistry(extensions: ExtensionModel[]): string {
  const lines: string[] = [];
  const sorted = [...extensions].sort((a, b) => a.name.localeCompare(b.name));

  for (const ext of sorted) {
    const fileName = toKebabCase(ext.name);
    lines.push(`import type { ${ext.name} } from "./${fileName}.js";`);
  }
  lines.push("");

  lines.push("export interface ExtensionRegistry {");
  for (const ext of sorted) {
    lines.push(`  ${JSON.stringify(ext.url)}: ${ext.name};`);
  }
  lines.push("}");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function extensionFileNameFor(model: ExtensionModel): string {
  return toKebabCase(model.name);
}

function collectTypeImport(
  typeRef: TypeRef,
  mapper: TypeMapper,
  primitives: Set<string>,
  datatypes: Set<string>,
): void {
  if (typeRef.code === "Reference") {
    datatypes.add("Reference");
    return;
  }
  const tsType = mapper.fhirTypeToTs(typeRef.code);
  if (mapper.isPrimitive(typeRef.code)) {
    primitives.add(tsType);
  } else if (mapper.isComplexType(typeRef.code)) {
    datatypes.add(tsType);
  }
}

function formatTypeRef(typeRef: TypeRef, mapper: TypeMapper): string {
  if (typeRef.code === "Reference" && typeRef.targetProfiles?.length) {
    const targets = typeRef.targetProfiles.map((t) => `"${t}"`).join(" | ");
    return `Reference<${targets}>`;
  }
  return mapper.fhirTypeToTs(typeRef.code);
}

function canonicalCode(typeRef: TypeRef, mapper: TypeMapper): string {
  // Use the spec's FHIR code (post-System.* resolution) for the property
  // suffix so `valueQuantity` / `valueCodeableConcept` etc. read like the
  // hand-authored shape rather than `valueFhirString`.
  if (mapper.isPrimitive(typeRef.code)) {
    return typeRef.code;
  }
  return typeRef.code;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0]!.toUpperCase() + s.slice(1);
}

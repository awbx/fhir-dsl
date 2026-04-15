import { fhirTypeToTs, isComplexType, isPrimitive } from "@fhir-dsl/utils";
import type { BackboneElementModel, PropertyModel, ResourceModel, TypeRef } from "../model/resource-model.js";

export function emitResource(model: ResourceModel): string {
  const lines: string[] = [];
  const primitiveImports = new Set<string>();
  const datatypeImports = new Set<string>();

  collectImports(model.properties, primitiveImports, datatypeImports);
  for (const bb of model.backboneElements) {
    collectImports(bb.properties, primitiveImports, datatypeImports);
  }

  // Add base type import
  if (model.baseType === "DomainResource" || model.baseType === "Resource") {
    datatypeImports.add(model.baseType);
  }

  // Add BackboneElement import if there are backbone elements
  if (model.backboneElements.length > 0) {
    datatypeImports.add("BackboneElement");
  }

  if (primitiveImports.size > 0) {
    const sorted = [...primitiveImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "../primitives.js";`);
  }

  if (datatypeImports.size > 0) {
    const sorted = [...datatypeImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "../datatypes.js";`);
  }

  if (primitiveImports.size > 0 || datatypeImports.size > 0) {
    lines.push("");
  }

  for (const bb of model.backboneElements) {
    lines.push(...emitBackboneInterface(bb));
    lines.push("");
  }

  lines.push(...emitResourceInterface(model));

  return `${lines.join("\n")}\n`;
}

function emitResourceInterface(model: ResourceModel): string[] {
  const lines: string[] = [];
  const baseType = model.baseType ?? "Resource";
  const extendsClause = ` extends ${baseType}`;

  lines.push(`export interface ${model.name}${extendsClause} {`);
  lines.push(`  resourceType: "${model.name}";`);

  for (const prop of model.properties) {
    lines.push(`  ${formatProperty(prop)}`);
  }

  lines.push("}");
  return lines;
}

function emitBackboneInterface(bb: BackboneElementModel): string[] {
  const lines: string[] = [];
  lines.push(`export interface ${bb.name} extends BackboneElement {`);

  for (const prop of bb.properties) {
    lines.push(`  ${formatProperty(prop)}`);
  }

  lines.push("}");
  return lines;
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

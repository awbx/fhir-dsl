import { fhirTypeToTs, isComplexType, isPrimitive } from "@fhir-dsl/utils";
import type { BackboneElementModel, PropertyModel, ResourceModel, TypeRef } from "../model/resource-model.js";
import type { BindingTypeMap } from "./terminology-emitter.js";

export function emitResource(model: ResourceModel, bindingTypeMap?: BindingTypeMap): string {
  const lines: string[] = [];
  const primitiveImports = new Set<string>();
  const datatypeImports = new Set<string>();
  const terminologyImports = new Set<string>();

  collectImports(model.properties, primitiveImports, datatypeImports, terminologyImports, bindingTypeMap);
  for (const bb of model.backboneElements) {
    collectImports(bb.properties, primitiveImports, datatypeImports, terminologyImports, bindingTypeMap);
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

  if (terminologyImports.size > 0) {
    const sorted = [...terminologyImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "../terminology/valuesets.js";`);
  }

  if (primitiveImports.size > 0 || datatypeImports.size > 0 || terminologyImports.size > 0) {
    lines.push("");
  }

  for (const bb of model.backboneElements) {
    lines.push(...emitBackboneInterface(bb, bindingTypeMap));
    lines.push("");
  }

  lines.push(...emitResourceInterface(model, bindingTypeMap));

  return `${lines.join("\n")}\n`;
}

function emitResourceInterface(model: ResourceModel, bindingTypeMap?: BindingTypeMap): string[] {
  const lines: string[] = [];
  const baseType = model.baseType ?? "Resource";
  const extendsClause = ` extends ${baseType}`;

  lines.push(`export interface ${model.name}${extendsClause} {`);
  lines.push(`  resourceType: "${model.name}";`);

  for (const prop of model.properties) {
    lines.push(`  ${formatProperty(prop, bindingTypeMap)}`);
  }

  lines.push("}");
  return lines;
}

function emitBackboneInterface(bb: BackboneElementModel, bindingTypeMap?: BindingTypeMap): string[] {
  const lines: string[] = [];
  lines.push(`export interface ${bb.name} extends BackboneElement {`);

  for (const prop of bb.properties) {
    lines.push(`  ${formatProperty(prop, bindingTypeMap)}`);
  }

  lines.push("}");
  return lines;
}

function formatProperty(prop: PropertyModel, bindingTypeMap?: BindingTypeMap): string {
  const optional = prop.isRequired ? "" : "?";
  const tsType = formatPropertyType(prop, bindingTypeMap);
  const arraySuffix = prop.isArray ? "[]" : "";
  return `${prop.name}${optional}: ${tsType}${arraySuffix};`;
}

function formatPropertyType(prop: PropertyModel, bindingTypeMap?: BindingTypeMap): string {
  if (prop.types.length === 0) return "unknown";
  if (prop.types.length === 1) {
    return formatTypeRef(prop.types[0]!, prop, bindingTypeMap);
  }
  return prop.types.map((t) => formatTypeRef(t, prop, bindingTypeMap)).join(" | ");
}

function formatTypeRef(typeRef: TypeRef, prop?: PropertyModel, bindingTypeMap?: BindingTypeMap): string {
  if (typeRef.code === "Reference" && typeRef.targetProfiles?.length) {
    const targets = typeRef.targetProfiles.map((t) => `"${t}"`).join(" | ");
    return `Reference<${targets}>`;
  }

  // Check if this property has a resolved terminology binding
  const boundTypeName = resolveBindingType(typeRef, prop, bindingTypeMap);
  if (boundTypeName) {
    return boundTypeName;
  }

  return fhirTypeToTs(typeRef.code);
}

/** BINDABLE_TYPES are FHIR types that support generic terminology constraints */
const BINDABLE_TYPES = new Set(["code", "Coding", "CodeableConcept"]);

function resolveBindingType(
  typeRef: TypeRef,
  prop?: PropertyModel,
  bindingTypeMap?: BindingTypeMap,
): string | undefined {
  if (!prop?.binding || !bindingTypeMap || !BINDABLE_TYPES.has(typeRef.code)) return undefined;

  const { strength, valueSet } = prop.binding;

  // Only emit typed bindings for required and extensible strengths
  if (strength !== "required" && strength !== "extensible") return undefined;

  // Look up the ValueSet URL in the binding map (also try stripping version suffix)
  let typeName = bindingTypeMap.get(valueSet);
  if (!typeName) {
    const bareUrl = valueSet.split("|")[0]!;
    typeName = bindingTypeMap.get(bareUrl);
  }
  if (!typeName) return undefined;

  const typeParam = strength === "extensible" ? `${typeName} | (string & {})` : typeName;

  if (typeRef.code === "code") return `FhirCode<${typeParam}>`;
  if (typeRef.code === "Coding") return `Coding<${typeParam}>`;
  if (typeRef.code === "CodeableConcept") return `CodeableConcept<${typeParam}>`;
  return undefined;
}

function collectImports(
  properties: PropertyModel[],
  primitives: Set<string>,
  datatypes: Set<string>,
  terminology: Set<string>,
  bindingTypeMap?: BindingTypeMap,
): void {
  for (const prop of properties) {
    for (const typeRef of prop.types) {
      if (typeRef.code === "Reference") {
        datatypes.add("Reference");
        continue;
      }

      // Check if this type will use a terminology binding
      const boundType = resolveBindingType(typeRef, prop, bindingTypeMap);
      if (boundType) {
        // Still need the base type import (FhirCode, Coding, CodeableConcept)
        const tsType = fhirTypeToTs(typeRef.code);
        if (isPrimitive(typeRef.code)) {
          primitives.add(tsType);
        } else if (isComplexType(typeRef.code)) {
          datatypes.add(tsType);
        }

        // Also need the terminology type import
        let typeName = bindingTypeMap?.get(prop.binding!.valueSet);
        if (!typeName) {
          const bareUrl = prop.binding!.valueSet.split("|")[0]!;
          typeName = bindingTypeMap?.get(bareUrl);
        }
        if (typeName) terminology.add(typeName);
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

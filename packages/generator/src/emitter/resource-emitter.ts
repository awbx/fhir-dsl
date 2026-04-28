import type { BackboneElementModel, PropertyModel, ResourceModel, TypeRef } from "../model/resource-model.js";
import type { TypeMapper } from "../spec/type-mapping.js";
import type { BindingTypeMap } from "./terminology-emitter.js";

export function emitResource(model: ResourceModel, mapper: TypeMapper, bindingTypeMap?: BindingTypeMap): string {
  const lines: string[] = [];
  const primitiveImports = new Set<string>();
  const datatypeImports = new Set<string>();
  const terminologyImports = new Set<string>();

  collectImports(model.properties, mapper, primitiveImports, datatypeImports, terminologyImports, bindingTypeMap);
  for (const bb of model.backboneElements) {
    collectImports(bb.properties, mapper, primitiveImports, datatypeImports, terminologyImports, bindingTypeMap);
  }

  // Add base type import
  if (model.baseType === "DomainResource" || model.baseType === "Resource") {
    datatypeImports.add(model.baseType);
  }

  // Add BackboneElement import if there are backbone elements
  if (model.backboneElements.length > 0) {
    datatypeImports.add("BackboneElement");
  }

  // Phase 1.3: any primitive-only property triggers an underscore
  // sibling typed as `Element` (or sparse `(Element | null)[]`).
  if (
    hasPrimitiveSibling(model.properties, mapper) ||
    model.backboneElements.some((bb) => hasPrimitiveSibling(bb.properties, mapper))
  ) {
    datatypeImports.add("Element");
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
    lines.push(...emitBackboneInterface(bb, mapper, bindingTypeMap));
    lines.push("");
  }

  lines.push(...emitResourceInterface(model, mapper, bindingTypeMap));

  return `${lines.join("\n")}\n`;
}

function emitResourceInterface(model: ResourceModel, mapper: TypeMapper, bindingTypeMap?: BindingTypeMap): string[] {
  const lines: string[] = [];
  const baseType = model.baseType ?? "Resource";
  const extendsClause = ` extends ${baseType}`;

  lines.push(`export interface ${model.name}${extendsClause} {`);
  lines.push(`  resourceType: "${model.name}";`);

  for (const prop of model.properties) {
    for (const line of formatPropertyLines(prop, mapper, bindingTypeMap)) {
      lines.push(`  ${line}`);
    }
  }

  lines.push("}");
  return lines;
}

function emitBackboneInterface(
  bb: BackboneElementModel,
  mapper: TypeMapper,
  bindingTypeMap?: BindingTypeMap,
): string[] {
  const lines: string[] = [];
  lines.push(`export interface ${bb.name} extends BackboneElement {`);

  for (const prop of bb.properties) {
    for (const line of formatPropertyLines(prop, mapper, bindingTypeMap)) {
      lines.push(`  ${line}`);
    }
  }

  lines.push("}");
  return lines;
}

/**
 * Emits the property line plus, for primitive-typed properties, the
 * underscore-prefixed sibling that carries `id` and extensions per the
 * FHIR JSON representation rules.
 *
 *   birthDate?: FhirDate;
 *   _birthDate?: Element;
 *
 * Repeating primitives use a sparse array (`(Element | null)[]`) so
 * indices stay aligned with the value array, with `null` for entries
 * that have no extensions.
 */
function formatPropertyLines(prop: PropertyModel, mapper: TypeMapper, bindingTypeMap?: BindingTypeMap): string[] {
  const optional = prop.isRequired ? "" : "?";
  const tsType = formatPropertyType(prop, mapper, bindingTypeMap);
  const arraySuffix = prop.isArray ? "[]" : "";
  const lines = [`${prop.name}${optional}: ${tsType}${arraySuffix};`];
  if (isPrimitiveOnly(prop, mapper)) {
    const sibling = prop.isArray ? "(Element | null)[]" : "Element";
    lines.push(`_${prop.name}?: ${sibling};`);
  }
  return lines;
}

function isPrimitiveOnly(prop: PropertyModel, mapper: TypeMapper): boolean {
  if (prop.types.length === 0) return false;
  return prop.types.every((t) => mapper.isPrimitive(t.code));
}

function hasPrimitiveSibling(properties: PropertyModel[], mapper: TypeMapper): boolean {
  return properties.some((p) => isPrimitiveOnly(p, mapper));
}

function formatPropertyType(prop: PropertyModel, mapper: TypeMapper, bindingTypeMap?: BindingTypeMap): string {
  if (prop.types.length === 0) return "unknown";
  if (prop.types.length === 1) {
    return formatTypeRef(prop.types[0]!, mapper, prop, bindingTypeMap);
  }
  return prop.types.map((t) => formatTypeRef(t, mapper, prop, bindingTypeMap)).join(" | ");
}

function formatTypeRef(
  typeRef: TypeRef,
  mapper: TypeMapper,
  prop?: PropertyModel,
  bindingTypeMap?: BindingTypeMap,
): string {
  if (typeRef.code === "Reference" && typeRef.targetProfiles?.length) {
    const targets = typeRef.targetProfiles.map((t) => `"${t}"`).join(" | ");
    return `Reference<${targets}>`;
  }

  // Check if this property has a resolved terminology binding
  const boundTypeName = resolveBindingType(typeRef, prop, bindingTypeMap);
  if (boundTypeName) {
    return boundTypeName;
  }

  return mapper.fhirTypeToTs(typeRef.code);
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
  mapper: TypeMapper,
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
        const tsType = mapper.fhirTypeToTs(typeRef.code);
        if (mapper.isPrimitive(typeRef.code)) {
          primitives.add(tsType);
        } else if (mapper.isComplexType(typeRef.code)) {
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

      const tsType = mapper.fhirTypeToTs(typeRef.code);
      if (mapper.isPrimitive(typeRef.code)) {
        primitives.add(tsType);
      } else if (mapper.isComplexType(typeRef.code)) {
        datatypes.add(tsType);
      }
    }
  }
}

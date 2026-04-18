import { isComplexType, isPrimitive, toKebabCase } from "@fhir-dsl/utils";
import type { ProfileModel } from "../../model/profile-model.js";
import type { PropertyModel, TypeRef } from "../../model/resource-model.js";
import type { BindingTypeMap } from "../terminology-emitter.js";
import type { ObjectField, SchemaNode, ValidatorAdapter } from "./adapter.js";

const BINDABLE_TYPES = new Set(["code", "Coding", "CodeableConcept"]);

interface Ctx {
  bindingTypeMap?: BindingTypeMap | undefined;
  strictExtensible?: boolean | undefined;
  datatypeImports: Set<string>;
  terminologyImports: Set<string>;
  availableDatatypes?: ReadonlySet<string> | undefined;
}

function resolveBindingName(valueSet: string, map: BindingTypeMap): string | undefined {
  return map.get(valueSet) ?? map.get(valueSet.split("|")[0]!);
}

function bindingNode(prop: PropertyModel, t: TypeRef, ctx: Ctx): SchemaNode | undefined {
  if (!prop.binding || !ctx.bindingTypeMap || !BINDABLE_TYPES.has(t.code)) return undefined;
  const { strength, valueSet } = prop.binding;
  if (strength !== "required" && strength !== "extensible") return undefined;
  const name = resolveBindingName(valueSet, ctx.bindingTypeMap);
  if (!name) return undefined;
  ctx.terminologyImports.add(name);
  const extensible = strength === "extensible" && !ctx.strictExtensible;
  const enumRef: SchemaNode = { kind: "ref", name: `${name}Schema` };
  if (t.code === "code") {
    return extensible ? { kind: "union", options: [enumRef, { kind: "primitive", fhirType: "string" }] } : enumRef;
  }
  return undefined;
}

function typeRefToNode(t: TypeRef, prop: PropertyModel, ctx: Ctx): SchemaNode {
  const bound = bindingNode(prop, t, ctx);
  if (bound) return bound;
  if (isPrimitive(t.code)) return { kind: "primitive", fhirType: t.code };
  if (ctx.availableDatatypes?.has(t.code)) {
    ctx.datatypeImports.add(t.code);
    return { kind: "ref", name: `${t.code}Schema` };
  }
  // Fallback for abstract or unparsed complex types (Element, BackboneElement, …)
  if (isComplexType(t.code)) return { kind: "unknown" };
  return { kind: "unknown" };
}

function propertyToNode(prop: PropertyModel, ctx: Ctx): SchemaNode {
  if (prop.types.length === 0) return { kind: "unknown" };
  const typeNodes = prop.types.map((t) => typeRefToNode(t, prop, ctx));
  let node: SchemaNode = typeNodes.length === 1 ? typeNodes[0]! : { kind: "union", options: typeNodes };
  if (prop.isArray) {
    node = prop.isRequired ? { kind: "array", inner: node, minItems: 1 } : { kind: "array", inner: node };
  }
  return node;
}

export function emitProfileSchema(
  profile: ProfileModel,
  adapter: ValidatorAdapter,
  options: {
    bindingTypeMap?: BindingTypeMap | undefined;
    strictExtensible?: boolean | undefined;
    availableDatatypes?: ReadonlySet<string> | undefined;
    runtimePath?: string | undefined;
  },
): string {
  const ctx: Ctx = {
    bindingTypeMap: options.bindingTypeMap,
    strictExtensible: options.strictExtensible,
    datatypeImports: new Set(),
    terminologyImports: new Set(),
    availableDatatypes: options.availableDatatypes,
  };

  const fields: ObjectField[] = profile.constrainedProperties.map((prop) => ({
    name: prop.name,
    schema: propertyToNode(prop, ctx),
    optional: !prop.isRequired,
  }));

  const baseName = `${profile.baseResourceType}Schema`;
  const profileSchemaName = `${profile.name}Schema`;
  const decl = adapter.declareExtend(profileSchemaName, baseName, fields);

  const header: string[] = [adapter.libImport({ runtimePath: options.runtimePath ?? "../__runtime.js" })];
  const baseFile = toKebabCase(profile.baseResourceType);
  header.push(`import { ${baseName} } from "../resources/${baseFile}.schema.js";`);
  if (ctx.datatypeImports.size > 0) {
    const names = [...ctx.datatypeImports].sort().map((n) => `${n}Schema`);
    header.push(`import { ${names.join(", ")} } from "../datatypes.js";`);
  }
  if (ctx.terminologyImports.size > 0) {
    const names = [...ctx.terminologyImports].sort().map((n) => `${n}Schema`);
    header.push(`import { ${names.join(", ")} } from "../terminology.js";`);
  }
  header.push("");

  return `${header.join("\n")}${decl}\n`;
}

export function emitProfileSchemaIndex(profiles: ProfileModel[]): string {
  const lines = [...profiles]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => `export * from "./${toKebabCase(p.name)}.schema.js";`);
  lines.push('export * from "./profile-schema-registry.js";');
  return `${lines.join("\n")}\n`;
}

/** Mirror of the type-level ProfileRegistry — values are Standard Schema instances. */
export function emitProfileSchemaRegistry(profiles: ProfileModel[]): string {
  const lines: string[] = [];

  for (const p of [...profiles].sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`import { ${p.name}Schema } from "./${toKebabCase(p.name)}.schema.js";`);
  }
  lines.push("");

  const byResource = new Map<string, ProfileModel[]>();
  for (const p of profiles) {
    const list = byResource.get(p.baseResourceType) ?? [];
    list.push(p);
    byResource.set(p.baseResourceType, list);
  }

  lines.push("export const ProfileSchemaRegistry = {");
  const sortedResources = [...byResource.keys()].sort();
  for (const resourceType of sortedResources) {
    const list = byResource.get(resourceType)!;
    lines.push(`  ${resourceType}: {`);
    for (const p of [...list].sort((a, b) => a.slug.localeCompare(b.slug))) {
      lines.push(`    "${p.slug}": ${p.name}Schema,`);
    }
    lines.push("  },");
  }
  lines.push("} as const;");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

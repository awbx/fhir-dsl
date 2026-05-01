import { toKebabCase } from "@fhir-dsl/utils";
import type { InvariantModel, PropertyModel, ResourceModel, TypeRef } from "../../model/resource-model.js";
import type { TypeMapper } from "../../spec/type-mapping.js";
import type { BindingTypeMap } from "../terminology-emitter.js";
import type { InvariantNode, ObjectField, SchemaNode, ValidatorAdapter } from "./adapter.js";

const BINDABLE_TYPES = new Set(["code", "Coding", "CodeableConcept"]);

interface EmitContext {
  adapter: ValidatorAdapter;
  mapper: TypeMapper;
  bindingTypeMap?: BindingTypeMap | undefined;
  /** Names of datatype schemas that live in the same datatypes.ts file. Refs to these need lazy wrapping. */
  sameFileDatatypes: ReadonlySet<string>;
  /** Names of datatype schemas that live in ../datatypes.ts (imported). No lazy needed. */
  importedDatatypes: ReadonlySet<string>;
  /** Names of backbone schemas in the same file (declared either earlier or later). */
  localBackbones: ReadonlySet<string>;
  /** Names of backbones already fully declared at the current emit point. Refs to backbones in `localBackbones` but not in `declaredBackbones` are forward refs and need lazy wrapping. */
  declaredBackbones: Set<string>;
  strictExtensible?: boolean | undefined;
  /** When false, drop ElementDefinition.constraint[*] invariants from emitted schemas. */
  emitInvariants: boolean;
  /** Mutated: names this file imports from ../datatypes.js. */
  datatypeImports: Set<string>;
  /** Mutated: names this file imports from ../terminology.js (no Schema suffix). */
  terminologyImports: Set<string>;
  /** Mutated: set when any schema in this file uses invariants and needs the FHIRPath import. */
  needsInvariantImport: { value: boolean };
  /** Mutated when emitting a backbone that has any forward ref to a sibling/self backbone; the const needs a type annotation to break TS inference cycles. */
  currentBackboneTracker?: { name: string; hadForwardRef: boolean } | undefined;
}

function resolveBindingName(valueSet: string, map: BindingTypeMap): string | undefined {
  return map.get(valueSet) ?? map.get(valueSet.split("|")[0]!);
}

function bindingNode(prop: PropertyModel, t: TypeRef, ctx: EmitContext): SchemaNode | undefined {
  if (!prop.binding || !ctx.bindingTypeMap || !BINDABLE_TYPES.has(t.code)) return undefined;
  const { strength, valueSet } = prop.binding;
  if (strength !== "required" && strength !== "extensible") return undefined;

  const name = resolveBindingName(valueSet, ctx.bindingTypeMap);
  if (!name) return undefined;

  const extensible = strength === "extensible" && !ctx.strictExtensible;
  ctx.terminologyImports.add(name);
  const enumRef: SchemaNode = { kind: "ref", name: `${name}Schema` };

  if (t.code === "code") {
    return extensible ? { kind: "union", options: [enumRef, { kind: "primitive", fhirType: "string" }] } : enumRef;
  }

  if (t.code === "Coding") {
    return {
      kind: "object",
      fields: [
        { name: "system", schema: { kind: "primitive", fhirType: "uri" }, optional: true },
        { name: "version", schema: { kind: "primitive", fhirType: "string" }, optional: true },
        {
          name: "code",
          schema: extensible ? { kind: "union", options: [enumRef, { kind: "primitive", fhirType: "code" }] } : enumRef,
          optional: true,
        },
        { name: "display", schema: { kind: "primitive", fhirType: "string" }, optional: true },
        { name: "userSelected", schema: { kind: "primitive", fhirType: "boolean" }, optional: true },
      ],
    };
  }

  if (t.code === "CodeableConcept") {
    const codingSchema: SchemaNode = {
      kind: "object",
      fields: [
        { name: "system", schema: { kind: "primitive", fhirType: "uri" }, optional: true },
        {
          name: "code",
          schema: extensible ? { kind: "union", options: [enumRef, { kind: "primitive", fhirType: "code" }] } : enumRef,
          optional: true,
        },
        { name: "display", schema: { kind: "primitive", fhirType: "string" }, optional: true },
      ],
    };
    return {
      kind: "object",
      fields: [
        { name: "coding", schema: { kind: "array", inner: codingSchema }, optional: true },
        { name: "text", schema: { kind: "primitive", fhirType: "string" }, optional: true },
      ],
    };
  }

  return undefined;
}

function makeRef(name: string, needsLazy: boolean): SchemaNode {
  return needsLazy ? { kind: "lazy", ref: name } : { kind: "ref", name };
}

function typeRefToNode(t: TypeRef, prop: PropertyModel, ctx: EmitContext): SchemaNode {
  const bound = bindingNode(prop, t, ctx);
  if (bound) return bound;

  if (ctx.mapper.isPrimitive(t.code)) return { kind: "primitive", fhirType: t.code };

  if (ctx.localBackbones.has(t.code)) {
    // Forward refs (incl. self-refs in recursive backbones like CodeSystem.concept) need lazy wrapping
    // to avoid TDZ violations on the generated `const X = s.object({ ...refs to X... })` declarations.
    const isForward = !ctx.declaredBackbones.has(t.code);
    if (isForward && ctx.currentBackboneTracker) {
      ctx.currentBackboneTracker.hadForwardRef = true;
    }
    return makeRef(`${t.code}Schema`, isForward);
  }

  if (ctx.sameFileDatatypes.has(t.code)) {
    // Forward refs inside datatypes file — wrap in lazy to handle cycles.
    return makeRef(`${t.code}Schema`, true);
  }

  if (ctx.importedDatatypes.has(t.code)) {
    ctx.datatypeImports.add(t.code);
    return makeRef(`${t.code}Schema`, false);
  }

  // Known FHIR complex type not in our generated datatypes (likely abstract — e.g. Element,
  // BackboneElement, Resource). Emit as permissive unknown rather than a dangling ref.
  if (ctx.mapper.isComplexType(t.code)) {
    return { kind: "unknown" };
  }

  return { kind: "unknown" };
}

function propertyToNode(prop: PropertyModel, ctx: EmitContext): SchemaNode {
  if (prop.types.length === 0) return { kind: "unknown" };
  const typeNodes = prop.types.map((t) => typeRefToNode(t, prop, ctx));
  let node: SchemaNode = typeNodes.length === 1 ? typeNodes[0]! : { kind: "union", options: typeNodes };
  if (prop.isArray) {
    node = prop.isRequired ? { kind: "array", inner: node, minItems: 1 } : { kind: "array", inner: node };
  }
  // Per-property invariants — wrap with a `refine` node so the predicate
  // evaluates against the property value (not the parent resource).
  const invariants = toInvariantNodes(prop.invariants, ctx);
  if (invariants) {
    node = { kind: "refine", inner: node, invariants };
  }
  return node;
}

function propertiesToFields(properties: PropertyModel[], ctx: EmitContext): ObjectField[] {
  return properties.map((prop) => ({
    name: prop.name,
    schema: propertyToNode(prop, ctx),
    optional: !prop.isRequired,
  }));
}

function toInvariantNodes(invariants: InvariantModel[] | undefined, ctx: EmitContext): InvariantNode[] | undefined {
  if (!ctx.emitInvariants || !invariants?.length) return undefined;
  ctx.needsInvariantImport.value = true;
  return invariants.map((i) => ({
    key: i.key,
    severity: i.severity,
    human: i.human,
    expression: i.expression,
  }));
}

export interface EmitOptions {
  bindingTypeMap?: BindingTypeMap | undefined;
  /** Names of datatypes available in ../datatypes.js (imported). */
  importedDatatypes: ReadonlySet<string>;
  strictExtensible?: boolean | undefined;
  /** Relative path from the emitted file to the native runtime helper. */
  runtimePath?: string | undefined;
  mapper: TypeMapper;
  /** When false, drop ElementDefinition.constraint[*] invariants from schemas. Default: true. */
  invariants?: boolean | undefined;
}

export function emitResourceSchema(model: ResourceModel, adapter: ValidatorAdapter, options: EmitOptions): string {
  const ctx: EmitContext = {
    adapter,
    mapper: options.mapper,
    bindingTypeMap: options.bindingTypeMap,
    sameFileDatatypes: new Set(),
    importedDatatypes: options.importedDatatypes,
    localBackbones: new Set(model.backboneElements.map((bb) => bb.name)),
    declaredBackbones: new Set(),
    strictExtensible: options.strictExtensible,
    emitInvariants: options.invariants !== false,
    datatypeImports: new Set(),
    terminologyImports: new Set(),
    needsInvariantImport: { value: false },
  };

  const runtimePath = options.runtimePath ?? "../__runtime.js";
  const annotation = adapter.datatypeAnnotation?.(runtimePath);
  let needsAnnotationImport = false;

  const body: string[] = [];
  for (const bb of model.backboneElements) {
    const tracker = { name: bb.name, hadForwardRef: false };
    ctx.currentBackboneTracker = tracker;
    const fields = propertiesToFields(bb.properties, ctx);
    ctx.currentBackboneTracker = undefined;
    const decl = adapter.declareConst(`${bb.name}Schema`, {
      kind: "object",
      fields,
      invariants: toInvariantNodes(bb.invariants, ctx),
    });
    if (tracker.hadForwardRef && annotation) {
      // Recursive backbones (self-ref like CodeSystem.concept, or mutual like
      // GraphDefinition.link ↔ link.target) need an explicit type annotation
      // so TS can resolve the lazy thunks' return types — otherwise TS7022 / TS7024.
      needsAnnotationImport = true;
      body.push(
        decl.replace(`export const ${bb.name}Schema =`, `export const ${bb.name}Schema: ${annotation.annotation} =`),
      );
    } else {
      body.push(decl);
    }
    body.push("");
    ctx.declaredBackbones.add(bb.name);
  }

  const mainFields: ObjectField[] = [];
  if (model.kind === "resource") {
    mainFields.push({ name: "resourceType", schema: { kind: "literal", value: model.name }, optional: false });
  }
  mainFields.push(...propertiesToFields(model.properties, ctx));
  body.push(
    adapter.declareConst(`${model.name}Schema`, {
      kind: "object",
      fields: mainFields,
      invariants: toInvariantNodes(model.invariants, ctx),
    }),
  );

  const header: string[] = [adapter.libImport({ runtimePath })];
  if (ctx.needsInvariantImport.value) {
    header.push('import { validateInvariants } from "@fhir-dsl/fhirpath";');
  }
  if (needsAnnotationImport && annotation?.importStatement) {
    header.push(annotation.importStatement);
  }
  if (ctx.datatypeImports.size > 0) {
    const names = [...ctx.datatypeImports].sort().map((n) => `${n}Schema`);
    header.push(`import { ${names.join(", ")} } from "../datatypes.js";`);
  }
  if (ctx.terminologyImports.size > 0) {
    const names = [...ctx.terminologyImports].sort().map((n) => `${n}Schema`);
    header.push(`import { ${names.join(", ")} } from "../terminology.js";`);
  }
  header.push("");

  return `${header.join("\n")}${body.join("\n")}\n`;
}

/**
 * Emit a single `datatypes.ts` file with schemas for all complex types.
 * Cross-type references are wrapped in `lazy` so declaration order doesn't matter.
 */
export function emitDatatypeSchemas(
  models: ResourceModel[],
  adapter: ValidatorAdapter,
  options: Omit<EmitOptions, "importedDatatypes">,
): string {
  const sameFile = new Set(models.map((m) => m.name));

  const ctx: EmitContext = {
    adapter,
    mapper: options.mapper,
    bindingTypeMap: options.bindingTypeMap,
    sameFileDatatypes: sameFile,
    importedDatatypes: new Set(),
    localBackbones: new Set(),
    declaredBackbones: new Set(),
    strictExtensible: options.strictExtensible,
    emitInvariants: options.invariants !== false,
    datatypeImports: new Set(),
    terminologyImports: new Set(),
    needsInvariantImport: { value: false },
  };

  const runtimePath = options.runtimePath ?? "./__runtime.js";
  const annotation = adapter.datatypeAnnotation?.(runtimePath);
  const body: string[] = [];
  const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name));

  for (const model of sorted) {
    // Backbone schemas first (local to this model within the file).
    ctx.localBackbones = new Set(model.backboneElements.map((bb) => bb.name));
    ctx.declaredBackbones = new Set();
    for (const bb of model.backboneElements) {
      const fields = propertiesToFields(bb.properties, ctx);
      const bbNode: SchemaNode = { kind: "object", fields, invariants: toInvariantNodes(bb.invariants, ctx) };
      body.push(renderDatatypeConst(adapter, `${bb.name}Schema`, bbNode, annotation?.annotation));
      body.push("");
      ctx.declaredBackbones.add(bb.name);
    }
    // Datatype main schema — fields use lazy() for cross-datatype refs (handled by makeRef).
    const fields = propertiesToFields(model.properties, ctx);
    const mainNode: SchemaNode = { kind: "object", fields, invariants: toInvariantNodes(model.invariants, ctx) };
    body.push(renderDatatypeConst(adapter, `${model.name}Schema`, mainNode, annotation?.annotation));
    body.push("");
  }
  ctx.localBackbones = new Set();

  const header: string[] = [adapter.libImport({ runtimePath })];
  if (ctx.needsInvariantImport.value) {
    header.push('import { validateInvariants } from "@fhir-dsl/fhirpath";');
  }
  if (annotation?.importStatement) {
    header.push(annotation.importStatement);
  }
  if (ctx.terminologyImports.size > 0) {
    const names = [...ctx.terminologyImports].sort().map((n) => `${n}Schema`);
    header.push(`import { ${names.join(", ")} } from "./terminology.js";`);
  }
  header.push("");

  return `${header.join("\n")}${body.join("\n")}\n`;
}

/**
 * Datatype schemas frequently form cycles (self: Extension.extension,
 * mutual: Identifier ↔ Reference). Adapters whose library can't infer through
 * cycles (e.g. native) opt into a type annotation via `adapter.datatypeAnnotation()`.
 */
function renderDatatypeConst(
  adapter: ValidatorAdapter,
  name: string,
  node: SchemaNode,
  annotation: string | undefined,
): string {
  const decl = adapter.declareConst(name, node);
  if (!annotation) return decl;
  return decl.replace(`export const ${name} =`, `export const ${name}: ${annotation} =`);
}

/** Emit `schemas/resources/index.ts` re-export list.
 *
 * Re-exports only the top-level resource schema from each file (not backbones).
 * Backbone schema names (e.g. `SpecimenCollectionSchema`) can collide with
 * terminology binding constants generated from ValueSets — using `export *`
 * surfaces those collisions to downstream consumers as TS2308 errors. Backbones
 * are still importable directly from `./X.schema.js` if needed. */
export function emitResourceSchemaIndex(resources: ResourceModel[]): string {
  const lines = [...resources]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => `export { ${r.name}Schema } from "./${toKebabCase(r.name)}.schema.js";`);
  return `${lines.join("\n")}\n`;
}

/** Top-level schemas/index.ts.
 *
 * Terminology binding constants are intentionally NOT re-exported at the root —
 * ValueSet binding names (e.g. `PractitionerRole` from a SNOMED expansion) can
 * collide with top-level FHIR resource schema names. Consumers can still import
 * from `./schemas/terminology.js` directly when needed. */
export function emitSchemaRootIndex(_hasTerminology: boolean, hasProfiles: boolean): string {
  const lines = ['export * from "./datatypes.js";', 'export * from "./resources/index.js";'];
  if (hasProfiles) lines.push('export * from "./profiles/index.js";');
  lines.push('export * from "./schema-registry.js";');
  return `${lines.join("\n")}\n`;
}

/**
 * Emit `schemas/schema-registry.ts` — a `SchemaRegistry` const that matches
 * `@fhir-dsl/core`'s `SchemaRegistry` shape, so the generated client can wire it
 * into `createFhirClient({ schemas })` and enable `.validate().execute()`.
 */
export function emitSchemaRegistry(resources: ResourceModel[], hasProfiles: boolean): string {
  const sorted = [...resources].sort((a, b) => a.name.localeCompare(b.name));

  const lines: string[] = [];
  for (const r of sorted) {
    lines.push(`import { ${r.name}Schema } from "./resources/${toKebabCase(r.name)}.schema.js";`);
  }
  if (hasProfiles) {
    lines.push('import { ProfileSchemaRegistry } from "./profiles/profile-schema-registry.js";');
  }
  lines.push("");

  lines.push("export const SchemaRegistry = {");
  lines.push("  resources: {");
  for (const r of sorted) {
    lines.push(`    ${r.name}: ${r.name}Schema,`);
  }
  lines.push("  },");
  if (hasProfiles) {
    lines.push("  profiles: ProfileSchemaRegistry,");
  }
  lines.push("} as const;");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

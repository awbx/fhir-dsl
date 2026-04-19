import type { PrimitiveEntry, SpecCatalog } from "../spec/catalog.js";

const PRIMITIVE_TS_TYPE: Record<string, string> = {
  boolean: "boolean",
  integer: "number",
  number: "number",
  string: "string",
};

/** Emit per-primitive TS aliases from the catalog. `FhirCode` is parameterized to support narrowed code bindings. */
export function emitPrimitives(catalog: SpecCatalog): string {
  const lines: string[] = [];
  const primitives = [...catalog.primitives.values()].sort((a, b) => a.name.localeCompare(b.name));

  for (const p of primitives) {
    lines.push(aliasFor(p));
  }

  return `${lines.join("\n")}\n`;
}

function aliasFor(p: PrimitiveEntry): string {
  const jsType = PRIMITIVE_TS_TYPE[p.rule.kind] ?? "string";
  if (p.name === "code") {
    return `export type ${p.tsType}<T extends string = string> = T;`;
  }
  return `export type ${p.tsType} = ${jsType};`;
}

const ALWAYS_EXPORT_BASE_TYPES = ["Element", "BackboneElement", "Resource", "DomainResource"] as const;

/** Datatypes known to be exported from `@fhir-dsl/types`. Complex types outside this set get a minimal Element-based fallback. */
const DATATYPES_FROM_TYPES_PACKAGE = new Set([
  "Address",
  "Age",
  "Annotation",
  "Attachment",
  "BackboneElement",
  "CodeableConcept",
  "Coding",
  "ContactDetail",
  "ContactPoint",
  "Contributor",
  "Count",
  "DataRequirement",
  "Distance",
  "DomainResource",
  "Dosage",
  "Duration",
  "Element",
  "ElementDefinition",
  "Expression",
  "Extension",
  "HumanName",
  "Identifier",
  "MarketingStatus",
  "Meta",
  "Money",
  "Narrative",
  "ParameterDefinition",
  "Period",
  "Population",
  "ProdCharacteristic",
  "ProductShelfLife",
  "Quantity",
  "Range",
  "Ratio",
  "Reference",
  "RelatedArtifact",
  "Resource",
  "SampledData",
  "Signature",
  "SimpleQuantity",
  "SubstanceAmount",
  "Timing",
  "TriggerDefinition",
  "UsageContext",
]);

/**
 * Emit the datatypes barrel — re-exports FHIR complex types from `@fhir-dsl/types` for the ones we ship
 * and declares minimal `interface Foo extends Element {}` stubs for anything in the catalog we don't.
 * Bundle/BundleEntry/BundleLink are not re-exported here; they come from generated resources.
 */
export function emitDatatypes(catalog: SpecCatalog): string {
  // Base types (`Resource`, `DomainResource`) are `kind: "resource"` abstracts, not complex-types,
  // but every generated resource imports them — so we always re-export them alongside the catalog's complex types.
  const names = new Set<string>([...catalog.complexTypes.keys(), ...ALWAYS_EXPORT_BASE_TYPES]);
  const reexport: string[] = [];
  const stub: string[] = [];

  for (const name of [...names].sort()) {
    if (DATATYPES_FROM_TYPES_PACKAGE.has(name)) {
      reexport.push(name);
    } else {
      stub.push(name);
    }
  }

  const lines: string[] = [];
  lines.push("// Re-exports base FHIR datatypes from @fhir-dsl/types");
  lines.push("// Bundle/BundleEntry/BundleLink are omitted here — they come from the generated resources/bundle.ts");
  if (reexport.length > 0) {
    const typeList = reexport.map((n) => `type ${n}`).join(", ");
    lines.push(`export { ${typeList} } from "@fhir-dsl/types";`);
  }
  if (stub.length > 0) {
    lines.push("");
    lines.push('import type { Element } from "@fhir-dsl/types";');
    lines.push("");
    for (const name of stub) {
      lines.push(`export interface ${name} extends Element {}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

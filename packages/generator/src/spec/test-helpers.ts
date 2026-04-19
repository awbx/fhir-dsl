import type { PrimitiveEntry, PrimitiveKind, SpecCatalog } from "./catalog.js";
import { makeTypeMapper, type TypeMapper } from "./type-mapping.js";

const INTEGER_KIND_NAMES = new Set(["integer", "integer64", "positiveInt", "unsignedInt"]);

function kindFor(name: string): PrimitiveKind {
  if (name === "boolean") return "boolean";
  if (name === "decimal") return "number";
  if (INTEGER_KIND_NAMES.has(name)) return "integer";
  return "string";
}

const TEST_PRIMITIVES: Array<{ name: string; tsType: string }> = [
  { name: "base64Binary", tsType: "FhirBase64Binary" },
  { name: "boolean", tsType: "FhirBoolean" },
  { name: "canonical", tsType: "FhirCanonical" },
  { name: "code", tsType: "FhirCode" },
  { name: "date", tsType: "FhirDate" },
  { name: "dateTime", tsType: "FhirDateTime" },
  { name: "decimal", tsType: "FhirDecimal" },
  { name: "id", tsType: "FhirId" },
  { name: "instant", tsType: "FhirInstant" },
  { name: "integer", tsType: "FhirInteger" },
  { name: "integer64", tsType: "integer64" },
  { name: "markdown", tsType: "FhirMarkdown" },
  { name: "oid", tsType: "FhirOid" },
  { name: "positiveInt", tsType: "FhirPositiveInt" },
  { name: "string", tsType: "FhirString" },
  { name: "time", tsType: "FhirTime" },
  { name: "unsignedInt", tsType: "FhirUnsignedInt" },
  { name: "uri", tsType: "FhirUri" },
  { name: "url", tsType: "FhirUrl" },
  { name: "uuid", tsType: "FhirUuid" },
  { name: "xhtml", tsType: "FhirXhtml" },
];

const TEST_COMPLEX_TYPES = [
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
  "Dosage",
  "Duration",
  "Element",
  "ElementDefinition",
  "Expression",
  "Extension",
  "HumanName",
  "Identifier",
  "Meta",
  "Money",
  "MoneyQuantity",
  "Narrative",
  "ParameterDefinition",
  "Period",
  "Quantity",
  "Range",
  "Ratio",
  "Reference",
  "RelatedArtifact",
  "SampledData",
  "Signature",
  "SimpleQuantity",
  "Timing",
  "TriggerDefinition",
  "UsageContext",
];

/**
 * Catalog containing the R4-era base-property sets, FHIRPath system-type map,
 * and a representative list of primitives/complex types. Used by parser unit
 * tests so they don't have to construct a full catalog every time.
 */
export function makeFallbackCatalog(): SpecCatalog {
  const primitives = new Map<string, PrimitiveEntry>();
  for (const { name, tsType } of TEST_PRIMITIVES) {
    primitives.set(name, { name, tsType, rule: { kind: kindFor(name) } });
  }

  return {
    version: "test",
    primitives,
    complexTypes: new Map(TEST_COMPLEX_TYPES.map((name) => [name, { name, isAbstract: false }])),
    baseProperties: new Map([
      ["Resource", new Set(["id", "meta", "implicitRules", "language"])],
      [
        "DomainResource",
        new Set(["id", "meta", "implicitRules", "language", "text", "contained", "extension", "modifierExtension"]),
      ],
      ["Element", new Set(["id", "extension"])],
      ["BackboneElement", new Set(["id", "extension", "modifierExtension"])],
    ]),
    commonSearchParams: [],
    fhirpathSystemTypes: new Map([
      ["http://hl7.org/fhirpath/System.String", "string"],
      ["http://hl7.org/fhirpath/System.Boolean", "boolean"],
      ["http://hl7.org/fhirpath/System.Date", "date"],
      ["http://hl7.org/fhirpath/System.DateTime", "dateTime"],
      ["http://hl7.org/fhirpath/System.Decimal", "decimal"],
      ["http://hl7.org/fhirpath/System.Integer", "integer"],
      ["http://hl7.org/fhirpath/System.Time", "time"],
    ]),
  };
}

export function makeFallbackMapper(): TypeMapper {
  return makeTypeMapper(makeFallbackCatalog());
}

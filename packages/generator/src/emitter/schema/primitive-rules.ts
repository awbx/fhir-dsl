/**
 * Adapter-agnostic validation rules for FHIR primitive types.
 * Regexes follow http://hl7.org/fhir/R4/datatypes.html (FHIR R4 §2.24).
 */

export interface PrimitiveRule {
  kind: "string" | "number" | "integer" | "boolean";
  /** Optional JS regex literal — kept as RegExp so adapters can serialize it. */
  regex?: RegExp;
  /** Inclusive minimum for numeric types. */
  min?: number;
  /** Maximum string length, if defined. */
  maxLength?: number;
}

export const FHIR_PRIMITIVE_RULES: Record<string, PrimitiveRule> = {
  boolean: { kind: "boolean" },
  integer: { kind: "integer" },
  integer64: { kind: "integer" },
  decimal: { kind: "number" },
  positiveInt: { kind: "integer", min: 1 },
  unsignedInt: { kind: "integer", min: 0 },

  string: { kind: "string", maxLength: 1048576 },
  code: { kind: "string", regex: /^[^\s]+(\s[^\s]+)*$/ },
  id: { kind: "string", regex: /^[A-Za-z0-9\-.]{1,64}$/ },
  uri: { kind: "string" },
  url: { kind: "string" },
  canonical: { kind: "string" },
  oid: { kind: "string", regex: /^urn:oid:[0-2](\.(0|[1-9][0-9]*))+$/ },
  uuid: { kind: "string", regex: /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ },
  markdown: { kind: "string" },
  base64Binary: { kind: "string", regex: /^(\s*([0-9a-zA-Z+/=]){4}\s*)*$/ },
  xhtml: { kind: "string" },

  date: { kind: "string", regex: /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/ },
  dateTime: {
    kind: "string",
    regex:
      /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d))?)?)?$/,
  },
  instant: {
    kind: "string",
    regex:
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/,
  },
  time: { kind: "string", regex: /^([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?$/ },
};

export function isKnownPrimitive(fhirType: string): boolean {
  return fhirType in FHIR_PRIMITIVE_RULES;
}

/** Serialize a RegExp as a JS literal suitable for pasting into emitted source. */
export function regexLiteral(re: RegExp): string {
  return re.toString();
}

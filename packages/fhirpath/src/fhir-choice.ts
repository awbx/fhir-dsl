// FHIR choice-type (`[x]`) knowledge shared by both FHIRPath engines (the
// op-based evaluator in `eval/` and the invariant evaluator in `invariant/`).
// Neither has a SpecCatalog at runtime, so `value` reaching `valueQuantity`,
// `valueString`, ... is decided from these tables alone.
//
// A key `<base><Suffix>` is a choice variant only when `base` is a known `[x]`
// base AND `Suffix` is a FHIR type name. Both checks matter: real elements
// such as `referenceRange` and `dateTime` would otherwise collide with
// `reference` / `date`. Callers try direct lookup first; this module only
// answers the fallback.

export // `[x]` element bases across FHIR R4, R4B, R5 and R6 (from the spec's snapshots).
const CHOICE_BASES: ReadonlySet<string> = new Set([
  "abatement",
  "actor",
  "additive",
  "age",
  "allowed",
  "amount",
  "answer",
  "artifact",
  "asNeeded",
  "author",
  "born",
  "bounds",
  "characteristic",
  "chargeItem",
  "citeAs",
  "code",
  "collected",
  "concentration",
  "content",
  "cost",
  "coverage",
  "created",
  "date",
  "deceased",
  "defaultValue",
  "definingSubstance",
  "definition",
  "deliveryDevice",
  "detail",
  "device",
  "diagnosis",
  "dose",
  "doseNumber",
  "due",
  "duration",
  "effect",
  "effective",
  "effectiveTiming",
  "endpoint",
  "entity",
  "event",
  "example",
  "fastingStatus",
  "fixed",
  "generatedBy",
  "identified",
  "indication",
  "instance",
  "instances",
  "instantiates",
  "instruction",
  "item",
  "legallyBinding",
  "link",
  "location",
  "manufacturer",
  "maxValue",
  "measureScore",
  "medication",
  "minValue",
  "minimumVolume",
  "module",
  "multipleBirth",
  "name",
  "network",
  "occurence",
  "occurred",
  "occurrence",
  "offset",
  "onset",
  "parameterFocus",
  "participantEffective",
  "pattern",
  "performed",
  "period",
  "presentation",
  "probability",
  "procedure",
  "product",
  "quantity",
  "rate",
  "relatedDevice",
  "reported",
  "scheduled",
  "sequence",
  "seriesDoses",
  "serviced",
  "source",
  "sourceScope",
  "start",
  "statusReason",
  "strength",
  "structureProfile",
  "studyEffective",
  "subject",
  "substance",
  "substanceDefinition",
  "target",
  "targetItem",
  "targetScope",
  "time",
  "timing",
  "topic",
  "used",
  "value",
  "versionAlgorithm",
  "when",
]);

const COMPLEX_TYPES = [
  "Address",
  "Age",
  "Annotation",
  "Attachment",
  "Availability",
  "CodeableConcept",
  "CodeableReference",
  "Coding",
  "ContactDetail",
  "ContactPoint",
  "Contributor",
  "Count",
  "DataRequirement",
  "Distance",
  "Dosage",
  "Duration",
  "Expression",
  "ExtendedContactDetail",
  "Extension",
  "HumanName",
  "Identifier",
  "Meta",
  "MonetaryComponent",
  "Money",
  "ParameterDefinition",
  "Period",
  "Quantity",
  "Range",
  "Ratio",
  "RatioRange",
  "Reference",
  "RelatedArtifact",
  "SampledData",
  "Signature",
  "Timing",
  "TriggerDefinition",
  "UsageContext",
  "VirtualServiceDetail",
];

// Choice-key suffixes: primitives capitalised (`valueDateTime`) plus complex types.
export const CHOICE_SUFFIXES: ReadonlyMap<string, string> = new Map([
  ...[
    "Base64Binary",
    "Boolean",
    "Canonical",
    "Code",
    "Date",
    "DateTime",
    "Decimal",
    "Id",
    "Instant",
    "Integer",
    "Integer64",
    "Markdown",
    "Oid",
    "PositiveInt",
    "String",
    "Time",
    "UnsignedInt",
    "Uri",
    "Url",
    "Uuid",
  ].map((s): [string, string] => [s, s.charAt(0).toLowerCase() + s.slice(1)]),
  ...COMPLEX_TYPES.map((s): [string, string] => [s, s]),
]);

export interface ChoiceVariant {
  /** The JSON key that matched (`valueQuantity`). */
  key: string;
  /** The FHIR type named by the key's suffix (`Quantity`, `dateTime`). */
  type: string;
  /** `item[key]` as stored (may be an array or `null`). */
  value: unknown;
}

/**
 * Find the `name[x]` choice variant present on `item`, e.g. `value` →
 * `{ key: "valueQuantity", type: "Quantity", value: … }`. Returns `undefined`
 * when `name` is not a choice base or no `<name><FhirType>` key is present.
 * Does not consult `item[name]` itself — direct lookup is the caller's job.
 */
export function findChoiceVariant(item: Record<string, unknown>, name: string): ChoiceVariant | undefined {
  if (!CHOICE_BASES.has(name)) return undefined;
  for (const key of Object.keys(item)) {
    if (key.length <= name.length || !key.startsWith(name)) continue;
    const type = CHOICE_SUFFIXES.get(key.slice(name.length));
    if (type === undefined) continue;
    const value = item[key];
    if (value === undefined) continue;
    return { key, type, value };
  }
  return undefined;
}

/** The FHIR type of objects reached through a choice key (`valueQuantity` → `Quantity`). */
const choiceTypes = new WeakMap<object, string>();

/** Remember the choice type of each object in `value` (scalar or array). */
export function recordChoiceType(value: unknown, type: string): void {
  for (const v of Array.isArray(value) ? value : [value]) {
    if (v != null && typeof v === "object") choiceTypes.set(v, type);
  }
}

/** The type recorded by `recordChoiceType` for `value`, if any. */
export function choiceTypeOf(value: unknown): string | undefined {
  if (value == null || typeof value !== "object") return undefined;
  return choiceTypes.get(value);
}

// Specialisations of Quantity (FHIR R4 §2.24.0.15 Quantity profiles / types).
const QUANTITY_SUBTYPES: ReadonlySet<string> = new Set([
  "Age",
  "Count",
  "Distance",
  "Duration",
  "MoneyQuantity",
  "SimpleQuantity",
]);

/** Is the FHIR type `actual` the type `wanted` or a specialisation of it? */
export function choiceTypeSatisfies(actual: string, wanted: string): boolean {
  if (actual === wanted) return true;
  return wanted === "Quantity" && QUANTITY_SUBTYPES.has(actual);
}

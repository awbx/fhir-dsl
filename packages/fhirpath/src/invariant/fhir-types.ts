// FHIR type knowledge for the invariant evaluator, which has no SpecCatalog at
// runtime. Two jobs:
//
// 1. Choice-type navigation: `value` must reach `valueQuantity`, `valueString`, …
//    A key matches only when its base is a known choice base AND its suffix is a
//    FHIR type name, so `reference` never lands on `referenceRange` and `date`
//    never lands on an unrelated `dateTime` field. Direct lookup always wins.
//
// 2. Type tests (`is`, `as`, `ofType`): answered only when the JSON value makes
//    the answer certain. JSON can't tell `code` from `uri`, so ambiguous cases
//    throw, which surfaces the invariant as indeterminate rather than guessing.

// `[x]` element bases across FHIR R4, R4B, R5 and R6 (from the spec's snapshots).
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

const STRING_PRIMITIVES = new Set([
  "string",
  "code",
  "id",
  "uri",
  "url",
  "canonical",
  "oid",
  "uuid",
  "markdown",
  "base64binary",
  "date",
  "datetime",
  "instant",
  "time",
  "xhtml",
]);
const INTEGER_PRIMITIVES = new Set(["integer", "integer64", "positiveint", "unsignedint"]);
const PRIMITIVES = new Set([...STRING_PRIMITIVES, ...INTEGER_PRIMITIVES, "boolean", "decimal"]);

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
const CHOICE_SUFFIXES: ReadonlyMap<string, string> = new Map([
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

/** The FHIR type of objects reached through a choice key (`valueQuantity` → `Quantity`). */
const choiceTypeOf = new WeakMap<object, string>();

/** Resolve `item[name]`, falling back to the `name[x]` choice variant present on `item`. */
export function lookupProperty(item: Record<string, unknown>, name: string): unknown {
  const direct = item[name];
  if (direct !== undefined || !CHOICE_BASES.has(name)) return direct;
  for (const key of Object.keys(item)) {
    if (key.length <= name.length || !key.startsWith(name)) continue;
    const type = CHOICE_SUFFIXES.get(key.slice(name.length));
    if (type === undefined) continue;
    const value = item[key];
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v != null && typeof v === "object") choiceTypeOf.set(v, type);
    }
    return value;
  }
  return undefined;
}

/** `FHIR.Quantity` / `System.String` / `Quantity` → bare type name. */
export function normaliseTypeName(name: string): string {
  return name.replace(/^(FHIR|System)\./, "");
}

/**
 * Is `value` of FHIR/System type `type`? Returns `undefined` when the JSON
 * shape can't settle it; callers treat that as an evaluation error.
 */
export function isOfType(value: unknown, type: string): boolean | undefined {
  const lower = type.toLowerCase();
  const primitive = PRIMITIVES.has(lower);
  if (typeof value === "boolean") return lower === "boolean";
  if (typeof value === "number") {
    if (lower === "decimal") return true;
    if (INTEGER_PRIMITIVES.has(lower)) return Number.isInteger(value);
    return false;
  }
  if (typeof value === "string") {
    if (!STRING_PRIMITIVES.has(lower)) return false;
    // `string` vs `code` vs `uri` is not visible in JSON.
    return undefined;
  }
  if (value == null || typeof value !== "object") return undefined;
  if (primitive) return false;
  const resourceType = (value as Record<string, unknown>).resourceType;
  if (typeof resourceType === "string") {
    if (type === "Resource") return true;
    if (type === "DomainResource") return !["Bundle", "Binary", "Parameters"].includes(resourceType);
    return resourceType === type;
  }
  const known = choiceTypeOf.get(value);
  if (known !== undefined) return known === type;
  return undefined;
}

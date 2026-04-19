import { capitalizeFirst } from "@fhir-dsl/utils";
import type { DownloadedSpec } from "../downloader.js";
import type {
  BaseTypeName,
  CommonSearchParamEntry,
  ComplexTypeEntry,
  PrimitiveEntry,
  PrimitiveKind,
  PrimitiveRule,
  SpecCatalog,
} from "./catalog.js";

const REGEX_EXTENSION_URL = "http://hl7.org/fhir/StructureDefinition/regex";
const FHIRPATH_SYSTEM_PREFIX = "http://hl7.org/fhirpath/System.";

const INTEGER_PRIMITIVE_NAMES = new Set(["integer", "integer64", "positiveInt", "unsignedInt"]);
const DECIMAL_PRIMITIVE_NAMES = new Set(["decimal"]);
const BOOLEAN_PRIMITIVE_NAMES = new Set(["boolean"]);

// Non-derivable numeric minimums for primitives whose spec expresses the bound as regex only.
const PRIMITIVE_NUMERIC_MIN_OVERRIDES: Record<string, number> = {
  positiveInt: 1,
  unsignedInt: 0,
};

const BASE_TYPE_NAMES: readonly BaseTypeName[] = ["Resource", "DomainResource", "Element", "BackboneElement"];

interface FhirElement {
  id?: string;
  path: string;
  type?: Array<{
    code?: string;
    extension?: Array<{ url?: string; valueString?: string }>;
  }>;
  maxLength?: number;
  minValueInteger?: number;
  maxValueInteger?: number;
}

interface FhirStructureDefinition {
  resourceType: "StructureDefinition";
  name: string;
  kind: string;
  abstract?: boolean;
  type: string;
  snapshot?: { element: FhirElement[] };
  differential?: { element: FhirElement[] };
}

interface FhirSearchParameter {
  resourceType: "SearchParameter";
  code: string;
  type: string;
  base: string[];
}

function isStructureDefinition(value: unknown): value is FhirStructureDefinition {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    r.resourceType === "StructureDefinition" &&
    typeof r.name === "string" &&
    typeof r.kind === "string" &&
    typeof r.type === "string"
  );
}

function isSearchParameter(value: unknown): value is FhirSearchParameter {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    r.resourceType === "SearchParameter" &&
    typeof r.code === "string" &&
    typeof r.type === "string" &&
    Array.isArray(r.base)
  );
}

export function primitiveToTsName(name: string): string {
  if (name === "integer64") return "integer64";
  return `Fhir${capitalizeFirst(name)}`;
}

function classifyPrimitiveKind(name: string): PrimitiveKind {
  if (BOOLEAN_PRIMITIVE_NAMES.has(name)) return "boolean";
  if (INTEGER_PRIMITIVE_NAMES.has(name)) return "integer";
  if (DECIMAL_PRIMITIVE_NAMES.has(name)) return "number";
  return "string";
}

function anchorRegex(pattern: string): RegExp {
  return new RegExp(`^(?:${pattern})$`);
}

function buildPrimitiveRule(name: string, valueElement: FhirElement | undefined): PrimitiveRule {
  const kind = classifyPrimitiveKind(name);
  const rule: PrimitiveRule = { kind };

  if (!valueElement) return rule;

  const primaryType = valueElement.type?.[0];
  const regexExt = primaryType?.extension?.find((x) => x.url === REGEX_EXTENSION_URL);
  if (kind === "string" && regexExt?.valueString) {
    rule.regex = anchorRegex(regexExt.valueString);
  }

  if (kind === "string" && typeof valueElement.maxLength === "number") {
    rule.maxLength = valueElement.maxLength;
  }

  if (kind === "integer" || kind === "number") {
    if (typeof valueElement.minValueInteger === "number") rule.min = valueElement.minValueInteger;
    if (typeof valueElement.maxValueInteger === "number") rule.max = valueElement.maxValueInteger;
    const override = PRIMITIVE_NUMERIC_MIN_OVERRIDES[name];
    if (rule.min === undefined && override !== undefined) rule.min = override;
  }

  return rule;
}

function buildPrimitiveEntry(sd: FhirStructureDefinition): PrimitiveEntry {
  const name = sd.name;
  const valueElement = sd.snapshot?.element.find((el) => el.id === `${name}.value` || el.path === `${name}.value`);
  const rule = buildPrimitiveRule(name, valueElement);
  const systemUrl = valueElement?.type?.[0]?.code?.startsWith(FHIRPATH_SYSTEM_PREFIX)
    ? valueElement.type[0].code
    : undefined;
  const entry: PrimitiveEntry = {
    name,
    tsType: primitiveToTsName(name),
    rule,
  };
  if (systemUrl) entry.fhirpathSystemUrl = systemUrl;
  return entry;
}

function collectDirectChildPaths(sd: FhirStructureDefinition): string[] {
  const elements = sd.snapshot?.element ?? sd.differential?.element ?? [];
  const root = sd.type;
  const out: string[] = [];
  for (const el of elements) {
    if (el.path === root) continue;
    const suffix = el.path.slice(root.length + 1);
    if (!suffix || suffix.includes(".") || suffix.includes(":")) continue;
    out.push(suffix);
  }
  return out;
}

function buildFhirpathSystemTypes(primitives: PrimitiveEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of primitives) {
    if (!p.fhirpathSystemUrl) continue;
    if (map.has(p.fhirpathSystemUrl)) continue;
    const suffix = p.fhirpathSystemUrl.slice(FHIRPATH_SYSTEM_PREFIX.length);
    const primitiveWithMatchingName =
      primitives.find((x) => x.name.toLowerCase() === suffix.toLowerCase())?.name ?? suffix.toLowerCase();
    map.set(p.fhirpathSystemUrl, primitiveWithMatchingName);
  }
  return map;
}

function buildCommonSearchParams(searchParameters: unknown[]): CommonSearchParamEntry[] {
  const seen = new Map<string, CommonSearchParamEntry>();
  for (const raw of searchParameters) {
    if (!isSearchParameter(raw)) continue;
    for (const base of raw.base) {
      if (base !== "Resource" && base !== "DomainResource") continue;
      const key = `${base}:${raw.code}`;
      if (seen.has(key)) continue;
      seen.set(key, { code: raw.code, type: raw.type, scope: base });
    }
  }
  // Dedupe by code: DomainResource-scoped wins over Resource-scoped when both exist,
  // since every resource is-a Resource but the narrower scope is more specific.
  const byCode = new Map<string, CommonSearchParamEntry>();
  for (const entry of seen.values()) {
    const existing = byCode.get(entry.code);
    if (!existing) {
      byCode.set(entry.code, entry);
      continue;
    }
    if (existing.scope === "Resource" && entry.scope === "DomainResource") {
      byCode.set(entry.code, entry);
    }
  }
  return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function buildSpecCatalog(spec: DownloadedSpec, version: string): SpecCatalog {
  const primitives = new Map<string, PrimitiveEntry>();
  const complexTypes = new Map<string, ComplexTypeEntry>();
  const baseProperties = new Map<BaseTypeName, Set<string>>();

  const sdByName = new Map<string, FhirStructureDefinition>();
  for (const raw of spec.resourceDefinitions) {
    if (!isStructureDefinition(raw)) continue;
    sdByName.set(raw.name, raw);

    if (raw.kind === "primitive-type") {
      primitives.set(raw.name, buildPrimitiveEntry(raw));
    } else if (raw.kind === "complex-type") {
      complexTypes.set(raw.name, { name: raw.name, isAbstract: Boolean(raw.abstract) });
    }
  }

  for (const baseName of BASE_TYPE_NAMES) {
    const sd = sdByName.get(baseName);
    if (!sd) continue;
    baseProperties.set(baseName, new Set(collectDirectChildPaths(sd)));
  }

  // Fallbacks for specs that don't include primitive/complex/abstract type SDs
  // (e.g. minimal local fixtures). Keeps generation working with just resource SDs.
  if (primitives.size === 0) {
    for (const [name, tsType] of Object.entries(FALLBACK_PRIMITIVES)) {
      primitives.set(name, { name, tsType, rule: { kind: classifyPrimitiveKind(name) } });
    }
  }
  if (complexTypes.size === 0) {
    for (const name of FALLBACK_COMPLEX_TYPES) {
      complexTypes.set(name, { name, isAbstract: false });
    }
  }
  for (const [baseName, props] of Object.entries(FALLBACK_BASE_PROPERTIES) as [BaseTypeName, string[]][]) {
    if (!baseProperties.has(baseName)) baseProperties.set(baseName, new Set(props));
  }

  const fhirpathSystemTypes = buildFhirpathSystemTypes([...primitives.values()]);
  if (fhirpathSystemTypes.size === 0) {
    for (const [url, name] of Object.entries(FALLBACK_FHIRPATH_SYSTEM_TYPES)) {
      fhirpathSystemTypes.set(url, name);
    }
  }
  let commonSearchParams = buildCommonSearchParams(spec.searchParameters);
  if (commonSearchParams.length === 0) {
    commonSearchParams = [...FALLBACK_COMMON_SEARCH_PARAMS];
  }

  return {
    version,
    primitives,
    complexTypes,
    baseProperties,
    commonSearchParams,
    fhirpathSystemTypes,
  };
}

const FALLBACK_PRIMITIVES: Record<string, string> = {
  base64Binary: "FhirBase64Binary",
  boolean: "FhirBoolean",
  canonical: "FhirCanonical",
  code: "FhirCode",
  date: "FhirDate",
  dateTime: "FhirDateTime",
  decimal: "FhirDecimal",
  id: "FhirId",
  instant: "FhirInstant",
  integer: "FhirInteger",
  markdown: "FhirMarkdown",
  oid: "FhirOid",
  positiveInt: "FhirPositiveInt",
  string: "FhirString",
  time: "FhirTime",
  unsignedInt: "FhirUnsignedInt",
  uri: "FhirUri",
  url: "FhirUrl",
  uuid: "FhirUuid",
  xhtml: "FhirXhtml",
};

const FALLBACK_COMPLEX_TYPES: readonly string[] = [
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
  "SampledData",
  "Signature",
  "SimpleQuantity",
  "SubstanceAmount",
  "Timing",
  "TriggerDefinition",
  "UsageContext",
];

const FALLBACK_BASE_PROPERTIES: Record<BaseTypeName, readonly string[]> = {
  Resource: ["id", "meta", "implicitRules", "language"],
  DomainResource: ["id", "meta", "implicitRules", "language", "text", "contained", "extension", "modifierExtension"],
  Element: ["id", "extension"],
  BackboneElement: ["id", "extension", "modifierExtension"],
};

const FALLBACK_COMMON_SEARCH_PARAMS: readonly CommonSearchParamEntry[] = [
  { code: "_id", type: "token", scope: "Resource" },
  { code: "_lastUpdated", type: "date", scope: "Resource" },
  { code: "_tag", type: "token", scope: "Resource" },
  { code: "_security", type: "token", scope: "Resource" },
  { code: "_source", type: "uri", scope: "Resource" },
  { code: "_profile", type: "uri", scope: "Resource" },
  { code: "_filter", type: "string", scope: "Resource" },
  { code: "_content", type: "string", scope: "Resource" },
  { code: "_list", type: "string", scope: "Resource" },
  { code: "_text", type: "string", scope: "DomainResource" },
];

const FALLBACK_FHIRPATH_SYSTEM_TYPES: Record<string, string> = {
  "http://hl7.org/fhirpath/System.String": "string",
  "http://hl7.org/fhirpath/System.Boolean": "boolean",
  "http://hl7.org/fhirpath/System.Date": "date",
  "http://hl7.org/fhirpath/System.DateTime": "dateTime",
  "http://hl7.org/fhirpath/System.Decimal": "decimal",
  "http://hl7.org/fhirpath/System.Integer": "integer",
  "http://hl7.org/fhirpath/System.Time": "time",
};

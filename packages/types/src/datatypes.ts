import type {
  FhirBase64Binary,
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirDecimal,
  FhirId,
  FhirInstant,
  FhirInteger,
  FhirMarkdown,
  FhirPositiveInt,
  FhirString,
  FhirTime,
  FhirUnsignedInt,
  FhirUri,
  FhirUrl,
  FhirXhtml,
} from "./primitives.js";

// --- Base Element ---

export interface Element {
  id?: FhirString;
  extension?: Extension[];
}

export interface Extension extends Element {
  url: FhirUri;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueDecimal?: FhirDecimal;
  valueDateTime?: FhirDateTime;
  valueCode?: FhirCode;
  valueCoding?: Coding;
  valueCodeableConcept?: CodeableConcept;
  valueReference?: Reference;
  valueQuantity?: Quantity;
  valuePeriod?: Period;
  valueIdentifier?: Identifier;
}

// --- Complex Datatypes ---

export interface Coding<T extends string = string> extends Element {
  system?: FhirUri;
  version?: FhirString;
  code?: FhirCode<T>;
  display?: FhirString;
  userSelected?: FhirBoolean;
}

export interface CodeableConcept<T extends string = string> extends Element {
  coding?: Coding<T>[];
  text?: FhirString;
}

export interface Identifier extends Element {
  use?: FhirCode<"usual" | "official" | "temp" | "secondary" | "old">;
  type?: CodeableConcept;
  system?: FhirUri;
  value?: FhirString;
  period?: Period;
  assigner?: Reference<"Organization">;
}

export interface Period extends Element {
  start?: FhirDateTime;
  end?: FhirDateTime;
}

export interface HumanName extends Element {
  use?: FhirCode<"usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden">;
  text?: FhirString;
  family?: FhirString;
  given?: FhirString[];
  prefix?: FhirString[];
  suffix?: FhirString[];
  period?: Period;
}

export interface Address extends Element {
  use?: FhirCode<"home" | "work" | "temp" | "old" | "billing">;
  type?: FhirCode<"postal" | "physical" | "both">;
  text?: FhirString;
  line?: FhirString[];
  city?: FhirString;
  district?: FhirString;
  state?: FhirString;
  postalCode?: FhirString;
  country?: FhirString;
  period?: Period;
}

export interface ContactPoint extends Element {
  system?: FhirCode<"phone" | "fax" | "email" | "pager" | "url" | "sms" | "other">;
  value?: FhirString;
  use?: FhirCode<"home" | "work" | "temp" | "old" | "mobile">;
  rank?: FhirPositiveInt;
  period?: Period;
}

export interface Quantity extends Element {
  value?: FhirDecimal;
  comparator?: FhirCode<"<" | "<=" | ">=" | ">">;
  unit?: FhirString;
  system?: FhirUri;
  code?: FhirCode;
}

export interface Range extends Element {
  low?: Quantity;
  high?: Quantity;
}

export interface Ratio extends Element {
  numerator?: Quantity;
  denominator?: Quantity;
}

export interface Attachment extends Element {
  contentType?: FhirCode;
  language?: FhirCode;
  data?: FhirBase64Binary;
  url?: FhirUrl;
  size?: FhirUnsignedInt;
  hash?: FhirBase64Binary;
  title?: FhirString;
  creation?: FhirDateTime;
}

export interface Annotation extends Element {
  authorReference?: Reference<"Practitioner" | "Patient" | "RelatedPerson" | "Organization">;
  authorString?: FhirString;
  time?: FhirDateTime;
  text: FhirMarkdown;
}

export interface SampledData extends Element {
  origin: Quantity;
  period: FhirDecimal;
  factor?: FhirDecimal;
  lowerLimit?: FhirDecimal;
  upperLimit?: FhirDecimal;
  dimensions: FhirPositiveInt;
  data?: FhirString;
}

export interface Duration extends Quantity {}
export interface Age extends Quantity {}
export interface SimpleQuantity extends Quantity {}
export interface Money extends Element {
  value?: FhirDecimal;
  currency?: FhirCode;
}
export interface ContactDetail extends Element {
  name?: FhirString;
  telecom?: ContactPoint[];
}
export interface UsageContext extends Element {
  code: Coding;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueReference?: Reference;
}
export interface RelatedArtifact extends Element {
  type: FhirCode;
  label?: FhirString;
  display?: FhirString;
  citation?: FhirMarkdown;
  url?: FhirUrl;
  document?: Attachment;
  resource?: FhirCanonical;
}
export interface Expression extends Element {
  description?: FhirString;
  name?: FhirId;
  language: FhirCode;
  expression?: FhirString;
  reference?: FhirUri;
}
export interface TriggerDefinition extends Element {
  type: FhirCode;
  name?: FhirString;
  timingTiming?: Timing;
  timingReference?: Reference;
  timingDate?: FhirString;
  timingDateTime?: FhirDateTime;
  data?: DataRequirement[];
  condition?: Expression;
}
export interface DataRequirement extends Element {
  type: FhirCode;
  profile?: FhirCanonical[];
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference;
  mustSupport?: FhirString[];
}

// --- Reference ---

// The generic `T` records the allowed target resource type(s). It's used to
// narrow the `type` field: e.g. `Reference<"Patient">` only accepts `type`
// values that satisfy `"Patient"`, making cross-assignment between
// differently-parameterized references a type error. Plain `Reference` (no
// generic) falls back to any string, preserving spec-permissiveness.
export interface Reference<T extends string = string> extends Element {
  reference?: FhirString;
  type?: T;
  identifier?: Identifier;
  display?: FhirString;
}

// --- Narrative ---

export interface Narrative extends Element {
  status: FhirCode<"generated" | "extensions" | "additional" | "empty">;
  div: FhirXhtml;
}

// --- Meta ---

export interface Meta extends Element {
  versionId?: FhirId;
  lastUpdated?: FhirInstant;
  source?: FhirUri;
  profile?: FhirCanonical[];
  security?: Coding[];
  tag?: Coding[];
}

// --- Base Resource ---

export interface Resource {
  resourceType: string;
  id?: FhirId;
  meta?: Meta;
  implicitRules?: FhirUri;
  language?: FhirCode;
}

export interface DomainResource extends Resource {
  text?: Narrative;
  contained?: Resource[];
  extension?: Extension[];
  modifierExtension?: Extension[];
}

// --- Bundle (infrastructure type used by transactions, search results, etc.) ---

export interface Bundle extends Resource {
  resourceType: "Bundle";
  type: string;
  total?: number;
  link?: BundleLink[];
  entry?: BundleEntry[];
}

export interface BundleLink {
  relation: string;
  url: string;
}

export interface BundleEntry {
  fullUrl?: string;
  resource?: Resource;
  search?: { mode?: string; score?: number };
  request?: { method: string; url: string };
  response?: { status: string; location?: string; etag?: string; lastModified?: string };
}

// --- BackboneElement ---

export interface BackboneElement extends Element {
  modifierExtension?: Extension[];
}

// --- Timing ---

export interface Timing extends BackboneElement {
  event?: FhirDateTime[];
  repeat?: TimingRepeat;
  code?: CodeableConcept;
}

export interface TimingRepeat extends Element {
  boundsDuration?: Duration;
  boundsPeriod?: Period;
  boundsRange?: Range;
  count?: FhirPositiveInt;
  countMax?: FhirPositiveInt;
  duration?: FhirDecimal;
  durationMax?: FhirDecimal;
  durationUnit?: FhirCode<"s" | "min" | "h" | "d" | "wk" | "mo" | "a">;
  frequency?: FhirPositiveInt;
  frequencyMax?: FhirPositiveInt;
  period?: FhirDecimal;
  periodMax?: FhirDecimal;
  periodUnit?: FhirCode<"s" | "min" | "h" | "d" | "wk" | "mo" | "a">;
  dayOfWeek?: FhirCode<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">[];
  timeOfDay?: FhirTime[];
  when?: FhirCode[];
  offset?: FhirUnsignedInt;
}

// --- Dosage ---

export interface Dosage extends BackboneElement {
  sequence?: FhirInteger;
  text?: FhirString;
  additionalInstruction?: CodeableConcept[];
  patientInstruction?: FhirString;
  timing?: Timing;
  asNeededBoolean?: FhirBoolean;
  asNeededCodeableConcept?: CodeableConcept;
  site?: CodeableConcept;
  route?: CodeableConcept;
  method?: CodeableConcept;
  doseAndRate?: DosageDoseAndRate[];
  maxDosePerPeriod?: Ratio;
  maxDosePerAdministration?: Quantity;
  maxDosePerLifetime?: Quantity;
}

export interface DosageDoseAndRate extends Element {
  type?: CodeableConcept;
  doseRange?: Range;
  doseQuantity?: Quantity;
  rateRatio?: Ratio;
  rateRange?: Range;
  rateQuantity?: Quantity;
}

// --- Signature ---

export interface Signature extends Element {
  type: Coding[];
  when: FhirInstant;
  who: Reference<"Practitioner" | "PractitionerRole" | "RelatedPerson" | "Patient" | "Device" | "Organization">;
  onBehalfOf?: Reference<"Practitioner" | "PractitionerRole" | "RelatedPerson" | "Patient" | "Device" | "Organization">;
  targetFormat?: FhirCode;
  sigFormat?: FhirCode;
  data?: FhirBase64Binary;
}

// --- Additional Complex Datatypes ---

export interface Distance extends Quantity {}
export interface Count extends Quantity {}

export interface SubstanceAmount extends BackboneElement {
  amountQuantity?: Quantity;
  amountRange?: Range;
  amountString?: FhirString;
  amountType?: CodeableConcept;
  amountText?: FhirString;
  referenceRange?: Element;
}

export interface Contributor extends Element {
  type: FhirCode<"author" | "editor" | "reviewer" | "endorser">;
  name: FhirString;
  contact?: ContactDetail[];
}

export interface ParameterDefinition extends Element {
  name?: FhirCode;
  use: FhirCode;
  min?: FhirInteger;
  max?: FhirString;
  documentation?: FhirString;
  type: FhirCode;
  profile?: FhirCanonical;
}

export interface Population extends BackboneElement {
  ageRange?: Range;
  ageCodeableConcept?: CodeableConcept;
  gender?: CodeableConcept;
  race?: CodeableConcept;
  physiologicalCondition?: CodeableConcept;
}

export interface ProdCharacteristic extends BackboneElement {
  height?: Quantity;
  width?: Quantity;
  depth?: Quantity;
  weight?: Quantity;
  nominalVolume?: Quantity;
  externalDiameter?: Quantity;
  shape?: FhirString;
  color?: FhirString[];
  imprint?: FhirString[];
  image?: Attachment[];
  scoring?: CodeableConcept;
}

export interface ProductShelfLife extends BackboneElement {
  identifier?: Identifier;
  type: CodeableConcept;
  period: Quantity;
  specialPrecautionsForStorage?: CodeableConcept[];
}

export interface MarketingStatus extends BackboneElement {
  country: CodeableConcept;
  jurisdiction?: CodeableConcept;
  status: CodeableConcept;
  dateRange: Period;
  restoreDate?: FhirDateTime;
}

export interface ElementDefinition extends BackboneElement {
  path: FhirString;
  representation?: FhirCode[];
  sliceName?: FhirString;
  sliceIsConstraining?: FhirBoolean;
  label?: FhirString;
  code?: Coding[];
  short?: FhirString;
  definition?: FhirMarkdown;
  comment?: FhirMarkdown;
  requirements?: FhirMarkdown;
  alias?: FhirString[];
  min?: FhirUnsignedInt;
  max?: FhirString;
  base?: Element;
  contentReference?: FhirUri;
  type?: Element[];
  meaningWhenMissing?: FhirMarkdown;
  orderMeaning?: FhirString;
  fixed?: Element;
  pattern?: Element;
  example?: Element[];
  minValue?: Element;
  maxValue?: Element;
  maxLength?: FhirInteger;
  condition?: FhirId[];
  constraint?: Element[];
  mustSupport?: FhirBoolean;
  isModifier?: FhirBoolean;
  isModifierReason?: FhirString;
  isSummary?: FhirBoolean;
  binding?: Element;
  mapping?: Element[];
}

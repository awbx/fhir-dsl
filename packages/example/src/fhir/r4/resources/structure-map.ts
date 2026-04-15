import type {
  Address,
  Age,
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  ContactPoint,
  Contributor,
  Count,
  DataRequirement,
  Distance,
  DomainResource,
  Dosage,
  Duration,
  Expression,
  HumanName,
  Identifier,
  Meta,
  Money,
  ParameterDefinition,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
  RelatedArtifact,
  SampledData,
  Signature,
  Timing,
  TriggerDefinition,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBase64Binary,
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirId,
  FhirInstant,
  FhirInteger,
  FhirMarkdown,
  FhirOid,
  FhirPositiveInt,
  FhirString,
  FhirTime,
  FhirUnsignedInt,
  FhirUri,
  FhirUrl,
  FhirUuid,
} from "../primitives.js";

export interface StructureMapStructure extends BackboneElement {
  url: FhirCanonical;
  mode: FhirCode;
  alias?: FhirString;
  documentation?: FhirString;
}

export interface StructureMapGroupInput extends BackboneElement {
  name: FhirId;
  type?: FhirString;
  mode: FhirCode;
  documentation?: FhirString;
}

export interface StructureMapGroupRuleSource extends BackboneElement {
  context: FhirId;
  min?: FhirInteger;
  max?: FhirString;
  type?: FhirString;
  defaultValueBase64Binary?: FhirBase64Binary;
  defaultValueBoolean?: FhirBoolean;
  defaultValueCanonical?: FhirCanonical;
  defaultValueCode?: FhirCode;
  defaultValueDate?: FhirDate;
  defaultValueDateTime?: FhirDateTime;
  defaultValueDecimal?: FhirDecimal;
  defaultValueId?: FhirId;
  defaultValueInstant?: FhirInstant;
  defaultValueInteger?: FhirInteger;
  defaultValueMarkdown?: FhirMarkdown;
  defaultValueOid?: FhirOid;
  defaultValuePositiveInt?: FhirPositiveInt;
  defaultValueString?: FhirString;
  defaultValueTime?: FhirTime;
  defaultValueUnsignedInt?: FhirUnsignedInt;
  defaultValueUri?: FhirUri;
  defaultValueUrl?: FhirUrl;
  defaultValueUuid?: FhirUuid;
  defaultValueAddress?: Address;
  defaultValueAge?: Age;
  defaultValueAnnotation?: Annotation;
  defaultValueAttachment?: Attachment;
  defaultValueCodeableConcept?: CodeableConcept;
  defaultValueCoding?: Coding;
  defaultValueContactPoint?: ContactPoint;
  defaultValueCount?: Count;
  defaultValueDistance?: Distance;
  defaultValueDuration?: Duration;
  defaultValueHumanName?: HumanName;
  defaultValueIdentifier?: Identifier;
  defaultValueMoney?: Money;
  defaultValuePeriod?: Period;
  defaultValueQuantity?: Quantity;
  defaultValueRange?: Range;
  defaultValueRatio?: Ratio;
  defaultValueReference?: Reference;
  defaultValueSampledData?: SampledData;
  defaultValueSignature?: Signature;
  defaultValueTiming?: Timing;
  defaultValueContactDetail?: ContactDetail;
  defaultValueContributor?: Contributor;
  defaultValueDataRequirement?: DataRequirement;
  defaultValueExpression?: Expression;
  defaultValueParameterDefinition?: ParameterDefinition;
  defaultValueRelatedArtifact?: RelatedArtifact;
  defaultValueTriggerDefinition?: TriggerDefinition;
  defaultValueUsageContext?: UsageContext;
  defaultValueDosage?: Dosage;
  defaultValueMeta?: Meta;
  element?: FhirString;
  listMode?: FhirCode;
  variable?: FhirId;
  condition?: FhirString;
  check?: FhirString;
  logMessage?: FhirString;
}

export interface StructureMapGroupRuleTargetParameter extends BackboneElement {
  valueId?: FhirId;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueDecimal?: FhirDecimal;
}

export interface StructureMapGroupRuleTarget extends BackboneElement {
  context?: FhirId;
  contextType?: FhirCode;
  element?: FhirString;
  variable?: FhirId;
  listMode?: FhirCode[];
  listRuleId?: FhirId;
  transform?: FhirCode;
  parameter?: StructureMapGroupRuleTargetParameter[];
}

export interface StructureMapGroupRuleDependent extends BackboneElement {
  name: FhirId;
  variable: FhirString[];
}

export interface StructureMapGroupRule extends BackboneElement {
  name: FhirId;
  source: StructureMapGroupRuleSource[];
  target?: StructureMapGroupRuleTarget[];
  rule?: StructureMapGroupRule[];
  dependent?: StructureMapGroupRuleDependent[];
  documentation?: FhirString;
}

export interface StructureMapGroup extends BackboneElement {
  name: FhirId;
  extends?: FhirId;
  typeMode: FhirCode;
  documentation?: FhirString;
  input: StructureMapGroupInput[];
  rule: StructureMapGroupRule[];
}

export interface StructureMap extends DomainResource {
  resourceType: "StructureMap";
  url: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name: FhirString;
  title?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  structure?: StructureMapStructure[];
  import?: FhirCanonical[];
  group: StructureMapGroup[];
}

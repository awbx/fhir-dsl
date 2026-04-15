import type {
  Address,
  Age,
  Annotation,
  Attachment,
  Availability,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  ContactDetail,
  ContactPoint,
  Count,
  DataRequirement,
  Distance,
  Dosage,
  Duration,
  Expression,
  ExtendedContactDetail,
  HumanName,
  Identifier,
  Meta,
  Money,
  ParameterDefinition,
  Period,
  Quantity,
  Range,
  Ratio,
  RatioRange,
  Reference,
  RelatedArtifact,
  Resource,
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
  integer64,
} from "../primitives.js";

export interface ParametersParameter extends BackboneElement {
  name: FhirString;
  valueBase64Binary?: FhirBase64Binary;
  valueBoolean?: FhirBoolean;
  valueCanonical?: FhirCanonical;
  valueCode?: FhirCode;
  valueDate?: FhirDate;
  valueDateTime?: FhirDateTime;
  valueDecimal?: FhirDecimal;
  valueId?: FhirId;
  valueInstant?: FhirInstant;
  valueInteger?: FhirInteger;
  valueInteger64?: integer64;
  valueMarkdown?: FhirMarkdown;
  valueOid?: FhirOid;
  valuePositiveInt?: FhirPositiveInt;
  valueString?: FhirString;
  valueTime?: FhirTime;
  valueUnsignedInt?: FhirUnsignedInt;
  valueUri?: FhirUri;
  valueUrl?: FhirUrl;
  valueUuid?: FhirUuid;
  valueAddress?: Address;
  valueAge?: Age;
  valueAnnotation?: Annotation;
  valueAttachment?: Attachment;
  valueCodeableConcept?: CodeableConcept;
  valueCodeableReference?: CodeableReference;
  valueCoding?: Coding;
  valueContactPoint?: ContactPoint;
  valueCount?: Count;
  valueDistance?: Distance;
  valueDuration?: Duration;
  valueHumanName?: HumanName;
  valueIdentifier?: Identifier;
  valueMoney?: Money;
  valuePeriod?: Period;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueRatioRange?: RatioRange;
  valueReference?: Reference;
  valueSampledData?: SampledData;
  valueSignature?: Signature;
  valueTiming?: Timing;
  valueContactDetail?: ContactDetail;
  valueDataRequirement?: DataRequirement;
  valueExpression?: Expression;
  valueParameterDefinition?: ParameterDefinition;
  valueRelatedArtifact?: RelatedArtifact;
  valueTriggerDefinition?: TriggerDefinition;
  valueUsageContext?: UsageContext;
  valueAvailability?: Availability;
  valueExtendedContactDetail?: ExtendedContactDetail;
  valueDosage?: Dosage;
  valueMeta?: Meta;
  resource?: Resource;
  part?: ParametersParameter[];
}

export interface Parameters extends Resource {
  resourceType: "Parameters";
  parameter?: ParametersParameter[];
}

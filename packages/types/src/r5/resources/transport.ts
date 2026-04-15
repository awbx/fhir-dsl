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
  DomainResource,
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

export interface TransportRestriction extends BackboneElement {
  repetitions?: FhirPositiveInt;
  period?: Period;
  recipient?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Group" | "Organization">[];
}

export interface TransportInput extends BackboneElement {
  type: CodeableConcept;
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
}

export interface TransportOutput extends BackboneElement {
  type: CodeableConcept;
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
}

export interface Transport extends DomainResource {
  resourceType: "Transport";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical;
  instantiatesUri?: FhirUri;
  basedOn?: Reference<"Resource">[];
  groupIdentifier?: Identifier;
  partOf?: Reference<"Transport">[];
  status?: FhirCode;
  statusReason?: CodeableConcept;
  intent: FhirCode;
  priority?: FhirCode;
  code?: CodeableConcept;
  description?: FhirString;
  focus?: Reference<"Resource">;
  for?: Reference<"Resource">;
  encounter?: Reference<"Encounter">;
  completionTime?: FhirDateTime;
  authoredOn?: FhirDateTime;
  lastModified?: FhirDateTime;
  requester?: Reference<"Device" | "Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  performerType?: CodeableConcept[];
  owner?: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "CareTeam"
    | "HealthcareService"
    | "Patient"
    | "Device"
    | "RelatedPerson"
  >;
  location?: Reference<"Location">;
  insurance?: Reference<"Coverage" | "ClaimResponse">[];
  note?: Annotation[];
  relevantHistory?: Reference<"Provenance">[];
  restriction?: TransportRestriction;
  input?: TransportInput[];
  output?: TransportOutput[];
  requestedLocation: Reference<"Location">;
  currentLocation: Reference<"Location">;
  reason?: CodeableReference;
  history?: Reference<"Transport">;
}

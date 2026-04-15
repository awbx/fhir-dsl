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

export interface TaskRestriction extends BackboneElement {
  repetitions?: FhirPositiveInt;
  period?: Period;
  recipient?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Group" | "Organization">[];
}

export interface TaskInput extends BackboneElement {
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
  valueReference?: Reference;
  valueSampledData?: SampledData;
  valueSignature?: Signature;
  valueTiming?: Timing;
  valueContactDetail?: ContactDetail;
  valueContributor?: Contributor;
  valueDataRequirement?: DataRequirement;
  valueExpression?: Expression;
  valueParameterDefinition?: ParameterDefinition;
  valueRelatedArtifact?: RelatedArtifact;
  valueTriggerDefinition?: TriggerDefinition;
  valueUsageContext?: UsageContext;
  valueDosage?: Dosage;
  valueMeta?: Meta;
}

export interface TaskOutput extends BackboneElement {
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
  valueReference?: Reference;
  valueSampledData?: SampledData;
  valueSignature?: Signature;
  valueTiming?: Timing;
  valueContactDetail?: ContactDetail;
  valueContributor?: Contributor;
  valueDataRequirement?: DataRequirement;
  valueExpression?: Expression;
  valueParameterDefinition?: ParameterDefinition;
  valueRelatedArtifact?: RelatedArtifact;
  valueTriggerDefinition?: TriggerDefinition;
  valueUsageContext?: UsageContext;
  valueDosage?: Dosage;
  valueMeta?: Meta;
}

export interface Task extends DomainResource {
  resourceType: "Task";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical;
  instantiatesUri?: FhirUri;
  basedOn?: Reference<"Resource">[];
  groupIdentifier?: Identifier;
  partOf?: Reference<"Task">[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  businessStatus?: CodeableConcept;
  intent: FhirCode;
  priority?: FhirCode;
  code?: CodeableConcept;
  description?: FhirString;
  focus?: Reference<"Resource">;
  for?: Reference<"Resource">;
  encounter?: Reference<"Encounter">;
  executionPeriod?: Period;
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
  reasonCode?: CodeableConcept;
  reasonReference?: Reference<"Resource">;
  insurance?: Reference<"Coverage" | "ClaimResponse">[];
  note?: Annotation[];
  relevantHistory?: Reference<"Provenance">[];
  restriction?: TaskRestriction;
  input?: TaskInput[];
  output?: TaskOutput[];
}

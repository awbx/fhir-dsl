import type {
  Age,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  ContactDetail,
  DataRequirement,
  DomainResource,
  Duration,
  Expression,
  Identifier,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
  RelatedArtifact,
  Timing,
  TriggerDefinition,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirId,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface PlanDefinitionGoalTarget extends BackboneElement {
  measure?: CodeableConcept;
  detailQuantity?: Quantity;
  detailRange?: Range;
  detailCodeableConcept?: CodeableConcept;
  detailString?: FhirString;
  detailBoolean?: FhirBoolean;
  detailInteger?: FhirInteger;
  detailRatio?: Ratio;
  due?: Duration;
}

export interface PlanDefinitionGoal extends BackboneElement {
  category?: CodeableConcept;
  description: CodeableConcept;
  priority?: CodeableConcept;
  start?: CodeableConcept;
  addresses?: CodeableConcept[];
  documentation?: RelatedArtifact[];
  target?: PlanDefinitionGoalTarget[];
}

export interface PlanDefinitionActorOption extends BackboneElement {
  type?: FhirCode;
  typeCanonical?: FhirCanonical;
  typeReference?: Reference<
    | "CareTeam"
    | "Device"
    | "DeviceDefinition"
    | "Endpoint"
    | "Group"
    | "HealthcareService"
    | "Location"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
  >;
  role?: CodeableConcept;
}

export interface PlanDefinitionActor extends BackboneElement {
  title?: FhirString;
  description?: FhirMarkdown;
  option: PlanDefinitionActorOption[];
}

export interface PlanDefinitionActionCondition extends BackboneElement {
  kind: FhirCode;
  expression?: Expression;
}

export interface PlanDefinitionActionInput extends BackboneElement {
  title?: FhirString;
  requirement?: DataRequirement;
  relatedData?: FhirId;
}

export interface PlanDefinitionActionOutput extends BackboneElement {
  title?: FhirString;
  requirement?: DataRequirement;
  relatedData?: FhirString;
}

export interface PlanDefinitionActionRelatedAction extends BackboneElement {
  targetId: FhirId;
  relationship: FhirCode;
  endRelationship?: FhirCode;
  offsetDuration?: Duration;
  offsetRange?: Range;
}

export interface PlanDefinitionActionParticipant extends BackboneElement {
  actorId?: FhirString;
  type?: FhirCode;
  typeCanonical?: FhirCanonical;
  typeReference?: Reference<
    | "CareTeam"
    | "Device"
    | "DeviceDefinition"
    | "Endpoint"
    | "Group"
    | "HealthcareService"
    | "Location"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
  >;
  role?: CodeableConcept;
  function?: CodeableConcept;
}

export interface PlanDefinitionActionDynamicValue extends BackboneElement {
  path?: FhirString;
  expression?: Expression;
}

export interface PlanDefinitionAction extends BackboneElement {
  linkId?: FhirString;
  prefix?: FhirString;
  title?: FhirString;
  description?: FhirMarkdown;
  textEquivalent?: FhirMarkdown;
  priority?: FhirCode;
  code?: CodeableConcept;
  reason?: CodeableConcept[];
  documentation?: RelatedArtifact[];
  goalId?: FhirId[];
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  subjectCanonical?: FhirCanonical;
  trigger?: TriggerDefinition[];
  condition?: PlanDefinitionActionCondition[];
  input?: PlanDefinitionActionInput[];
  output?: PlanDefinitionActionOutput[];
  relatedAction?: PlanDefinitionActionRelatedAction[];
  timingAge?: Age;
  timingDuration?: Duration;
  timingRange?: Range;
  timingTiming?: Timing;
  location?: CodeableReference;
  participant?: PlanDefinitionActionParticipant[];
  type?: CodeableConcept;
  groupingBehavior?: FhirCode;
  selectionBehavior?: FhirCode;
  requiredBehavior?: FhirCode;
  precheckBehavior?: FhirCode;
  cardinalityBehavior?: FhirCode;
  definitionCanonical?: FhirCanonical;
  definitionUri?: FhirUri;
  transform?: FhirCanonical;
  dynamicValue?: PlanDefinitionActionDynamicValue[];
  action?: PlanDefinitionAction[];
}

export interface PlanDefinition extends DomainResource {
  resourceType: "PlanDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  type?: CodeableConcept;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<
    | "Group"
    | "MedicinalProductDefinition"
    | "SubstanceDefinition"
    | "AdministrableProductDefinition"
    | "ManufacturedItemDefinition"
    | "PackagedProductDefinition"
  >;
  subjectCanonical?: FhirCanonical;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  topic?: CodeableConcept[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  library?: FhirCanonical[];
  goal?: PlanDefinitionGoal[];
  actor?: PlanDefinitionActor[];
  action?: PlanDefinitionAction[];
  asNeededBoolean?: FhirBoolean;
  asNeededCodeableConcept?: CodeableConcept;
}

import type {
  Age,
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DataRequirement,
  DomainResource,
  Duration,
  Expression,
  Identifier,
  Period,
  Range,
  Reference,
  RelatedArtifact,
  Timing,
} from "../datatypes.js";
import type {
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirId,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface RequestOrchestrationActionCondition extends BackboneElement {
  kind: FhirCode;
  expression?: Expression;
}

export interface RequestOrchestrationActionInput extends BackboneElement {
  title?: FhirString;
  requirement?: DataRequirement;
  relatedData?: FhirId;
}

export interface RequestOrchestrationActionOutput extends BackboneElement {
  title?: FhirString;
  requirement?: DataRequirement;
  relatedData?: FhirString;
}

export interface RequestOrchestrationActionRelatedAction extends BackboneElement {
  targetId: FhirId;
  relationship: FhirCode;
  endRelationship?: FhirCode;
  offsetDuration?: Duration;
  offsetRange?: Range;
}

export interface RequestOrchestrationActionParticipant extends BackboneElement {
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
  actorCanonical?: FhirCanonical;
  actorReference?: Reference<
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
}

export interface RequestOrchestrationActionDynamicValue extends BackboneElement {
  path?: FhirString;
  expression?: Expression;
}

export interface RequestOrchestrationAction extends BackboneElement {
  linkId?: FhirString;
  prefix?: FhirString;
  title?: FhirString;
  description?: FhirMarkdown;
  textEquivalent?: FhirMarkdown;
  priority?: FhirCode;
  code?: CodeableConcept[];
  documentation?: RelatedArtifact[];
  goal?: Reference<"Goal">[];
  condition?: RequestOrchestrationActionCondition[];
  input?: RequestOrchestrationActionInput[];
  output?: RequestOrchestrationActionOutput[];
  relatedAction?: RequestOrchestrationActionRelatedAction[];
  timingDateTime?: FhirDateTime;
  timingAge?: Age;
  timingPeriod?: Period;
  timingDuration?: Duration;
  timingRange?: Range;
  timingTiming?: Timing;
  location?: CodeableReference;
  participant?: RequestOrchestrationActionParticipant[];
  type?: CodeableConcept;
  groupingBehavior?: FhirCode;
  selectionBehavior?: FhirCode;
  requiredBehavior?: FhirCode;
  precheckBehavior?: FhirCode;
  cardinalityBehavior?: FhirCode;
  resource?: Reference<"Resource">;
  definitionCanonical?: FhirCanonical;
  definitionUri?: FhirUri;
  transform?: FhirCanonical;
  dynamicValue?: RequestOrchestrationActionDynamicValue[];
  action?: RequestOrchestrationAction[];
}

export interface RequestOrchestration extends DomainResource {
  resourceType: "RequestOrchestration";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"Resource">[];
  replaces?: Reference<"Resource">[];
  groupIdentifier?: Identifier;
  status: FhirCode;
  intent: FhirCode;
  priority?: FhirCode;
  code?: CodeableConcept;
  subject?: Reference<
    | "CareTeam"
    | "Device"
    | "Group"
    | "HealthcareService"
    | "Location"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
  >;
  encounter?: Reference<"Encounter">;
  authoredOn?: FhirDateTime;
  author?: Reference<"Device" | "Practitioner" | "PractitionerRole">;
  reason?: CodeableReference[];
  goal?: Reference<"Goal">[];
  note?: Annotation[];
  action?: RequestOrchestrationAction[];
}

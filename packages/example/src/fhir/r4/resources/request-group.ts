import type {
  Age,
  Annotation,
  BackboneElement,
  CodeableConcept,
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
import type { FhirCanonical, FhirCode, FhirDateTime, FhirId, FhirString, FhirUri } from "../primitives.js";

export interface RequestGroupActionCondition extends BackboneElement {
  kind: FhirCode;
  expression?: Expression;
}

export interface RequestGroupActionRelatedAction extends BackboneElement {
  actionId: FhirId;
  relationship: FhirCode;
  offsetDuration?: Duration;
  offsetRange?: Range;
}

export interface RequestGroupAction extends BackboneElement {
  prefix?: FhirString;
  title?: FhirString;
  description?: FhirString;
  textEquivalent?: FhirString;
  priority?: FhirCode;
  code?: CodeableConcept[];
  documentation?: RelatedArtifact[];
  condition?: RequestGroupActionCondition[];
  relatedAction?: RequestGroupActionRelatedAction[];
  timingDateTime?: FhirDateTime;
  timingAge?: Age;
  timingPeriod?: Period;
  timingDuration?: Duration;
  timingRange?: Range;
  timingTiming?: Timing;
  participant?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Device">[];
  type?: CodeableConcept;
  groupingBehavior?: FhirCode;
  selectionBehavior?: FhirCode;
  requiredBehavior?: FhirCode;
  precheckBehavior?: FhirCode;
  cardinalityBehavior?: FhirCode;
  resource?: Reference<"Resource">;
  action?: RequestGroupAction[];
}

export interface RequestGroup extends DomainResource {
  resourceType: "RequestGroup";
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
  subject?: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  authoredOn?: FhirDateTime;
  author?: Reference<"Device" | "Practitioner" | "PractitionerRole">;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference">[];
  note?: Annotation[];
  action?: RequestGroupAction[];
}

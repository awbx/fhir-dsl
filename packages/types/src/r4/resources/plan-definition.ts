import type { FhirBoolean, FhirCanonical, FhirCode, FhirDate, FhirDateTime, FhirId, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { Age, BackboneElement, CodeableConcept, ContactDetail, DataRequirement, DomainResource, Duration, Expression, Identifier, Period, Quantity, Range, Reference, RelatedArtifact, Timing, TriggerDefinition, UsageContext } from "../datatypes.js";

export interface PlanDefinitionGoalTarget extends BackboneElement {
  measure?: CodeableConcept;
  detailQuantity?: Quantity;
  detailRange?: Range;
  detailCodeableConcept?: CodeableConcept;
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

export interface PlanDefinitionActionCondition extends BackboneElement {
  kind: FhirCode;
  expression?: Expression;
}

export interface PlanDefinitionActionRelatedAction extends BackboneElement {
  actionId: FhirId;
  relationship: FhirCode;
  offsetDuration?: Duration;
  offsetRange?: Range;
}

export interface PlanDefinitionActionParticipant extends BackboneElement {
  type: FhirCode;
  role?: CodeableConcept;
}

export interface PlanDefinitionActionDynamicValue extends BackboneElement {
  path?: FhirString;
  expression?: Expression;
}

export interface PlanDefinitionAction extends BackboneElement {
  prefix?: FhirString;
  title?: FhirString;
  description?: FhirString;
  textEquivalent?: FhirString;
  priority?: FhirCode;
  code?: CodeableConcept[];
  reason?: CodeableConcept[];
  documentation?: RelatedArtifact[];
  goalId?: FhirId[];
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  trigger?: TriggerDefinition[];
  condition?: PlanDefinitionActionCondition[];
  input?: DataRequirement[];
  output?: DataRequirement[];
  relatedAction?: PlanDefinitionActionRelatedAction[];
  timingDateTime?: FhirDateTime;
  timingAge?: Age;
  timingPeriod?: Period;
  timingDuration?: Duration;
  timingRange?: Range;
  timingTiming?: Timing;
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
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  type?: CodeableConcept;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirString;
  copyright?: FhirMarkdown;
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
  action?: PlanDefinitionAction[];
}

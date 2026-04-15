import type { FhirBoolean, FhirCode, FhirDate, FhirInteger, FhirString } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Duration, Identifier, Quantity, Range, Ratio, Reference } from "../datatypes.js";

export interface GoalTarget extends BackboneElement {
  measure?: CodeableConcept;
  detailQuantity?: Quantity;
  detailRange?: Range;
  detailCodeableConcept?: CodeableConcept;
  detailString?: FhirString;
  detailBoolean?: FhirBoolean;
  detailInteger?: FhirInteger;
  detailRatio?: Ratio;
  dueDate?: FhirDate;
  dueDuration?: Duration;
}

export interface Goal extends DomainResource {
  resourceType: "Goal";
  identifier?: Identifier[];
  lifecycleStatus: FhirCode;
  achievementStatus?: CodeableConcept;
  category?: CodeableConcept[];
  priority?: CodeableConcept;
  description: CodeableConcept;
  subject: Reference<"Patient" | "Group" | "Organization">;
  startDate?: FhirDate;
  startCodeableConcept?: CodeableConcept;
  target?: GoalTarget[];
  statusDate?: FhirDate;
  statusReason?: FhirString;
  expressedBy?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  addresses?: Reference<"Condition" | "Observation" | "MedicationStatement" | "NutritionOrder" | "ServiceRequest" | "RiskAssessment">[];
  note?: Annotation[];
  outcomeCode?: CodeableConcept[];
  outcomeReference?: Reference<"Observation">[];
}

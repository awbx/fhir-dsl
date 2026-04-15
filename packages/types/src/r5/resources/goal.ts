import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Duration,
  Identifier,
  Quantity,
  Range,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirInteger, FhirString } from "../primitives.js";

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
  continuous?: FhirBoolean;
  priority?: CodeableConcept;
  description: CodeableConcept;
  subject: Reference<"Patient" | "Group" | "Organization">;
  startDate?: FhirDate;
  startCodeableConcept?: CodeableConcept;
  target?: GoalTarget[];
  statusDate?: FhirDate;
  statusReason?: FhirString;
  source?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "CareTeam">;
  addresses?: Reference<
    | "Condition"
    | "Observation"
    | "MedicationStatement"
    | "MedicationRequest"
    | "NutritionOrder"
    | "ServiceRequest"
    | "RiskAssessment"
    | "Procedure"
  >[];
  note?: Annotation[];
  outcome?: CodeableReference[];
}

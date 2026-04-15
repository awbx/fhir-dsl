import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Ratio,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface MedicationAdministrationPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: CodeableReference;
}

export interface MedicationAdministrationDosage extends BackboneElement {
  text?: FhirString;
  site?: CodeableConcept;
  route?: CodeableConcept;
  method?: CodeableConcept;
  dose?: Quantity;
  rateRatio?: Ratio;
  rateQuantity?: Quantity;
}

export interface MedicationAdministration extends DomainResource {
  resourceType: "MedicationAdministration";
  identifier?: Identifier[];
  basedOn?: Reference<"CarePlan">[];
  partOf?: Reference<"MedicationAdministration" | "Procedure" | "MedicationDispense">[];
  status: FhirCode;
  statusReason?: CodeableConcept[];
  category?: CodeableConcept[];
  medication: CodeableReference;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  supportingInformation?: Reference<"Resource">[];
  occurenceDateTime?: FhirDateTime;
  occurencePeriod?: Period;
  occurenceTiming?: Timing;
  recorded?: FhirDateTime;
  isSubPotent?: FhirBoolean;
  subPotentReason?: CodeableConcept[];
  performer?: MedicationAdministrationPerformer[];
  reason?: CodeableReference[];
  request?: Reference<"MedicationRequest">;
  device?: CodeableReference[];
  note?: Annotation[];
  dosage?: MedicationAdministrationDosage;
  eventHistory?: Reference<"Provenance">[];
}

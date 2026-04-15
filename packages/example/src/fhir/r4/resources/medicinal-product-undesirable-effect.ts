import type { CodeableConcept, DomainResource, Population, Reference } from "../datatypes.js";

export interface MedicinalProductUndesirableEffect extends DomainResource {
  resourceType: "MedicinalProductUndesirableEffect";
  subject?: Reference<"MedicinalProduct" | "Medication">[];
  symptomConditionEffect?: CodeableConcept;
  classification?: CodeableConcept;
  frequencyOfOccurrence?: CodeableConcept;
  population?: Population[];
}

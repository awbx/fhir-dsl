import type { BackboneElement, CodeableConcept, DomainResource, Population, Quantity, Reference } from "../datatypes.js";

export interface MedicinalProductIndicationOtherTherapy extends BackboneElement {
  therapyRelationshipType: CodeableConcept;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"MedicinalProduct" | "Medication" | "Substance" | "SubstanceSpecification">;
}

export interface MedicinalProductIndication extends DomainResource {
  resourceType: "MedicinalProductIndication";
  subject?: Reference<"MedicinalProduct" | "Medication">[];
  diseaseSymptomProcedure?: CodeableConcept;
  diseaseStatus?: CodeableConcept;
  comorbidity?: CodeableConcept[];
  intendedEffect?: CodeableConcept;
  duration?: Quantity;
  otherTherapy?: MedicinalProductIndicationOtherTherapy[];
  undesirableEffect?: Reference<"MedicinalProductUndesirableEffect">[];
  population?: Population[];
}

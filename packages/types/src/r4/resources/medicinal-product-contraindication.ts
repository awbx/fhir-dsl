import type { BackboneElement, CodeableConcept, DomainResource, Population, Reference } from "../datatypes.js";

export interface MedicinalProductContraindicationOtherTherapy extends BackboneElement {
  therapyRelationshipType: CodeableConcept;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"MedicinalProduct" | "Medication" | "Substance" | "SubstanceSpecification">;
}

export interface MedicinalProductContraindication extends DomainResource {
  resourceType: "MedicinalProductContraindication";
  subject?: Reference<"MedicinalProduct" | "Medication">[];
  disease?: CodeableConcept;
  diseaseStatus?: CodeableConcept;
  comorbidity?: CodeableConcept[];
  therapeuticIndication?: Reference<"MedicinalProductIndication">[];
  otherTherapy?: MedicinalProductContraindicationOtherTherapy[];
  population?: Population[];
}

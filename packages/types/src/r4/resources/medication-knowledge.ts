import type { FhirBase64Binary, FhirBoolean, FhirCode, FhirMarkdown, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Dosage, Duration, Money, Quantity, Ratio, Reference } from "../datatypes.js";

export interface MedicationKnowledgeRelatedMedicationKnowledge extends BackboneElement {
  type: CodeableConcept;
  reference: Reference<"MedicationKnowledge">[];
}

export interface MedicationKnowledgeMonograph extends BackboneElement {
  type?: CodeableConcept;
  source?: Reference<"DocumentReference" | "Media">;
}

export interface MedicationKnowledgeIngredient extends BackboneElement {
  itemCodeableConcept?: CodeableConcept;
  itemReference?: Reference<"Substance">;
  isActive?: FhirBoolean;
  strength?: Ratio;
}

export interface MedicationKnowledgeCost extends BackboneElement {
  type: CodeableConcept;
  source?: FhirString;
  cost: Money;
}

export interface MedicationKnowledgeMonitoringProgram extends BackboneElement {
  type?: CodeableConcept;
  name?: FhirString;
}

export interface MedicationKnowledgeAdministrationGuidelinesDosage extends BackboneElement {
  type: CodeableConcept;
  dosage: Dosage[];
}

export interface MedicationKnowledgeAdministrationGuidelinesPatientCharacteristics extends BackboneElement {
  characteristicCodeableConcept?: CodeableConcept;
  characteristicQuantity?: Quantity;
  value?: FhirString[];
}

export interface MedicationKnowledgeAdministrationGuidelines extends BackboneElement {
  dosage?: MedicationKnowledgeAdministrationGuidelinesDosage[];
  indicationCodeableConcept?: CodeableConcept;
  indicationReference?: Reference<"ObservationDefinition">;
  patientCharacteristics?: MedicationKnowledgeAdministrationGuidelinesPatientCharacteristics[];
}

export interface MedicationKnowledgeMedicineClassification extends BackboneElement {
  type: CodeableConcept;
  classification?: CodeableConcept[];
}

export interface MedicationKnowledgePackaging extends BackboneElement {
  type?: CodeableConcept;
  quantity?: Quantity;
}

export interface MedicationKnowledgeDrugCharacteristic extends BackboneElement {
  type?: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valueQuantity?: Quantity;
  valueBase64Binary?: FhirBase64Binary;
}

export interface MedicationKnowledgeRegulatorySubstitution extends BackboneElement {
  type: CodeableConcept;
  allowed: FhirBoolean;
}

export interface MedicationKnowledgeRegulatorySchedule extends BackboneElement {
  schedule: CodeableConcept;
}

export interface MedicationKnowledgeRegulatoryMaxDispense extends BackboneElement {
  quantity: Quantity;
  period?: Duration;
}

export interface MedicationKnowledgeRegulatory extends BackboneElement {
  regulatoryAuthority: Reference<"Organization">;
  substitution?: MedicationKnowledgeRegulatorySubstitution[];
  schedule?: MedicationKnowledgeRegulatorySchedule[];
  maxDispense?: MedicationKnowledgeRegulatoryMaxDispense;
}

export interface MedicationKnowledgeKinetics extends BackboneElement {
  areaUnderCurve?: Quantity[];
  lethalDose50?: Quantity[];
  halfLifePeriod?: Duration;
}

export interface MedicationKnowledge extends DomainResource {
  resourceType: "MedicationKnowledge";
  code?: CodeableConcept;
  status?: FhirCode;
  manufacturer?: Reference<"Organization">;
  doseForm?: CodeableConcept;
  amount?: Quantity;
  synonym?: FhirString[];
  relatedMedicationKnowledge?: MedicationKnowledgeRelatedMedicationKnowledge[];
  associatedMedication?: Reference<"Medication">[];
  productType?: CodeableConcept[];
  monograph?: MedicationKnowledgeMonograph[];
  ingredient?: MedicationKnowledgeIngredient[];
  preparationInstruction?: FhirMarkdown;
  intendedRoute?: CodeableConcept[];
  cost?: MedicationKnowledgeCost[];
  monitoringProgram?: MedicationKnowledgeMonitoringProgram[];
  administrationGuidelines?: MedicationKnowledgeAdministrationGuidelines[];
  medicineClassification?: MedicationKnowledgeMedicineClassification[];
  packaging?: MedicationKnowledgePackaging;
  drugCharacteristic?: MedicationKnowledgeDrugCharacteristic[];
  contraindication?: Reference<"DetectedIssue">[];
  regulatory?: MedicationKnowledgeRegulatory[];
  kinetics?: MedicationKnowledgeKinetics[];
}

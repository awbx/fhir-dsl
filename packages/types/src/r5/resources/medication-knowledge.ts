import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Dosage,
  Duration,
  Identifier,
  Money,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBase64Binary, FhirBoolean, FhirCode, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";

export interface MedicationKnowledgeRelatedMedicationKnowledge extends BackboneElement {
  type: CodeableConcept;
  reference: Reference<"MedicationKnowledge">[];
}

export interface MedicationKnowledgeMonograph extends BackboneElement {
  type?: CodeableConcept;
  source?: Reference<"DocumentReference">;
}

export interface MedicationKnowledgeCost extends BackboneElement {
  effectiveDate?: Period[];
  type: CodeableConcept;
  source?: FhirString;
  costMoney?: Money;
  costCodeableConcept?: CodeableConcept;
}

export interface MedicationKnowledgeMonitoringProgram extends BackboneElement {
  type?: CodeableConcept;
  name?: FhirString;
}

export interface MedicationKnowledgeIndicationGuidelineDosingGuidelineDosage extends BackboneElement {
  type: CodeableConcept;
  dosage: Dosage[];
}

export interface MedicationKnowledgeIndicationGuidelineDosingGuidelinePatientCharacteristic extends BackboneElement {
  type: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: Range;
}

export interface MedicationKnowledgeIndicationGuidelineDosingGuideline extends BackboneElement {
  treatmentIntent?: CodeableConcept;
  dosage?: MedicationKnowledgeIndicationGuidelineDosingGuidelineDosage[];
  administrationTreatment?: CodeableConcept;
  patientCharacteristic?: MedicationKnowledgeIndicationGuidelineDosingGuidelinePatientCharacteristic[];
}

export interface MedicationKnowledgeIndicationGuideline extends BackboneElement {
  indication?: CodeableReference[];
  dosingGuideline?: MedicationKnowledgeIndicationGuidelineDosingGuideline[];
}

export interface MedicationKnowledgeMedicineClassification extends BackboneElement {
  type: CodeableConcept;
  sourceString?: FhirString;
  sourceUri?: FhirUri;
  classification?: CodeableConcept[];
}

export interface MedicationKnowledgePackaging extends BackboneElement {
  cost?: MedicationKnowledgeCost[];
  packagedProduct?: Reference<"PackagedProductDefinition">;
}

export interface MedicationKnowledgeStorageGuidelineEnvironmentalSetting extends BackboneElement {
  type: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueCodeableConcept?: CodeableConcept;
}

export interface MedicationKnowledgeStorageGuideline extends BackboneElement {
  reference?: FhirUri;
  note?: Annotation[];
  stabilityDuration?: Duration;
  environmentalSetting?: MedicationKnowledgeStorageGuidelineEnvironmentalSetting[];
}

export interface MedicationKnowledgeRegulatorySubstitution extends BackboneElement {
  type: CodeableConcept;
  allowed: FhirBoolean;
}

export interface MedicationKnowledgeRegulatoryMaxDispense extends BackboneElement {
  quantity: Quantity;
  period?: Duration;
}

export interface MedicationKnowledgeRegulatory extends BackboneElement {
  regulatoryAuthority: Reference<"Organization">;
  substitution?: MedicationKnowledgeRegulatorySubstitution[];
  schedule?: CodeableConcept[];
  maxDispense?: MedicationKnowledgeRegulatoryMaxDispense;
}

export interface MedicationKnowledgeDefinitionalIngredient extends BackboneElement {
  item: CodeableReference;
  type?: CodeableConcept;
  strengthRatio?: Ratio;
  strengthCodeableConcept?: CodeableConcept;
  strengthQuantity?: Quantity;
}

export interface MedicationKnowledgeDefinitionalDrugCharacteristic extends BackboneElement {
  type?: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valueQuantity?: Quantity;
  valueBase64Binary?: FhirBase64Binary;
  valueAttachment?: Attachment;
}

export interface MedicationKnowledgeDefinitional extends BackboneElement {
  definition?: Reference<"MedicinalProductDefinition">[];
  doseForm?: CodeableConcept;
  intendedRoute?: CodeableConcept[];
  ingredient?: MedicationKnowledgeDefinitionalIngredient[];
  drugCharacteristic?: MedicationKnowledgeDefinitionalDrugCharacteristic[];
}

export interface MedicationKnowledge extends DomainResource {
  resourceType: "MedicationKnowledge";
  identifier?: Identifier[];
  code?: CodeableConcept;
  status?: FhirCode;
  author?: Reference<"Organization">;
  intendedJurisdiction?: CodeableConcept[];
  name?: FhirString[];
  relatedMedicationKnowledge?: MedicationKnowledgeRelatedMedicationKnowledge[];
  associatedMedication?: Reference<"Medication">[];
  productType?: CodeableConcept[];
  monograph?: MedicationKnowledgeMonograph[];
  preparationInstruction?: FhirMarkdown;
  cost?: MedicationKnowledgeCost[];
  monitoringProgram?: MedicationKnowledgeMonitoringProgram[];
  indicationGuideline?: MedicationKnowledgeIndicationGuideline[];
  medicineClassification?: MedicationKnowledgeMedicineClassification[];
  packaging?: MedicationKnowledgePackaging[];
  clinicalUseIssue?: Reference<"ClinicalUseDefinition">[];
  storageGuideline?: MedicationKnowledgeStorageGuideline[];
  regulatory?: MedicationKnowledgeRegulatory[];
  definitional?: MedicationKnowledgeDefinitional;
}

import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Expression,
  Identifier,
  Range,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirMarkdown, FhirString } from "../primitives.js";

export interface ClinicalUseDefinitionContraindicationOtherTherapy extends BackboneElement {
  relationshipType: CodeableConcept;
  treatment: CodeableReference;
}

export interface ClinicalUseDefinitionContraindication extends BackboneElement {
  diseaseSymptomProcedure?: CodeableReference;
  diseaseStatus?: CodeableReference;
  comorbidity?: CodeableReference[];
  indication?: Reference<"ClinicalUseDefinition">[];
  applicability?: Expression;
  otherTherapy?: ClinicalUseDefinitionContraindicationOtherTherapy[];
}

export interface ClinicalUseDefinitionIndication extends BackboneElement {
  diseaseSymptomProcedure?: CodeableReference;
  diseaseStatus?: CodeableReference;
  comorbidity?: CodeableReference[];
  intendedEffect?: CodeableReference;
  durationRange?: Range;
  durationString?: FhirString;
  undesirableEffect?: Reference<"ClinicalUseDefinition">[];
  applicability?: Expression;
  otherTherapy?: ClinicalUseDefinitionContraindicationOtherTherapy[];
}

export interface ClinicalUseDefinitionInteractionInteractant extends BackboneElement {
  itemReference?: Reference<
    | "MedicinalProductDefinition"
    | "Medication"
    | "Substance"
    | "NutritionProduct"
    | "BiologicallyDerivedProduct"
    | "ObservationDefinition"
  >;
  itemCodeableConcept?: CodeableConcept;
}

export interface ClinicalUseDefinitionInteraction extends BackboneElement {
  interactant?: ClinicalUseDefinitionInteractionInteractant[];
  type?: CodeableConcept;
  effect?: CodeableReference;
  incidence?: CodeableConcept;
  management?: CodeableConcept[];
}

export interface ClinicalUseDefinitionUndesirableEffect extends BackboneElement {
  symptomConditionEffect?: CodeableReference;
  classification?: CodeableConcept;
  frequencyOfOccurrence?: CodeableConcept;
}

export interface ClinicalUseDefinitionWarning extends BackboneElement {
  description?: FhirMarkdown;
  code?: CodeableConcept;
}

export interface ClinicalUseDefinition extends DomainResource {
  resourceType: "ClinicalUseDefinition";
  identifier?: Identifier[];
  type: FhirCode;
  category?: CodeableConcept[];
  subject?: Reference<
    | "MedicinalProductDefinition"
    | "Medication"
    | "ActivityDefinition"
    | "PlanDefinition"
    | "Device"
    | "DeviceDefinition"
    | "Substance"
    | "NutritionProduct"
    | "BiologicallyDerivedProduct"
  >[];
  status?: CodeableConcept;
  contraindication?: ClinicalUseDefinitionContraindication;
  indication?: ClinicalUseDefinitionIndication;
  interaction?: ClinicalUseDefinitionInteraction;
  population?: Reference<"Group">[];
  library?: FhirCanonical[];
  undesirableEffect?: ClinicalUseDefinitionUndesirableEffect;
  warning?: ClinicalUseDefinitionWarning;
}

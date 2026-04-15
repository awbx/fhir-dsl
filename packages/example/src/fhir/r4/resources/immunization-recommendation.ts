import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";
import type { FhirDateTime, FhirPositiveInt, FhirString } from "../primitives.js";

export interface ImmunizationRecommendationRecommendationDateCriterion extends BackboneElement {
  code: CodeableConcept;
  value: FhirDateTime;
}

export interface ImmunizationRecommendationRecommendation extends BackboneElement {
  vaccineCode?: CodeableConcept[];
  targetDisease?: CodeableConcept;
  contraindicatedVaccineCode?: CodeableConcept[];
  forecastStatus: CodeableConcept;
  forecastReason?: CodeableConcept[];
  dateCriterion?: ImmunizationRecommendationRecommendationDateCriterion[];
  description?: FhirString;
  series?: FhirString;
  doseNumberPositiveInt?: FhirPositiveInt;
  doseNumberString?: FhirString;
  seriesDosesPositiveInt?: FhirPositiveInt;
  seriesDosesString?: FhirString;
  supportingImmunization?: Reference<"Immunization" | "ImmunizationEvaluation">[];
  supportingPatientInformation?: Reference<"Resource">[];
}

export interface ImmunizationRecommendation extends DomainResource {
  resourceType: "ImmunizationRecommendation";
  identifier?: Identifier[];
  patient: Reference<"Patient">;
  date: FhirDateTime;
  authority?: Reference<"Organization">;
  recommendation: ImmunizationRecommendationRecommendation[];
}

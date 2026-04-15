import type { USCoreAllergyIntolerance } from "./uscore-allergy-intolerance.js";
import type { USCoreBloodPressureProfile } from "./uscore-blood-pressure-profile.js";
import type { USCoreBMIProfile } from "./uscore-bmiprofile.js";
import type { USCoreBodyHeightProfile } from "./uscore-body-height-profile.js";
import type { USCoreBodyTemperatureProfile } from "./uscore-body-temperature-profile.js";
import type { USCoreBodyWeightProfile } from "./uscore-body-weight-profile.js";
import type { USCoreCarePlanProfile } from "./uscore-care-plan-profile.js";
import type { USCoreCareTeam } from "./uscore-care-team.js";
import type { USCoreConditionEncounterDiagnosisProfile } from "./uscore-condition-encounter-diagnosis-profile.js";
import type { USCoreConditionProblemsHealthConcernsProfile } from "./uscore-condition-problems-health-concerns-profile.js";
import type { USCoreCoverageProfile } from "./uscore-coverage-profile.js";
import type { USCoreDiagnosticReportProfileLaboratoryReporting } from "./uscore-diagnostic-report-profile-laboratory-reporting.js";
import type { USCoreDiagnosticReportProfileNoteExchange } from "./uscore-diagnostic-report-profile-note-exchange.js";
import type { USCoreDocumentReferenceProfile } from "./uscore-document-reference-profile.js";
import type { USCoreEncounterProfile } from "./uscore-encounter-profile.js";
import type { USCoreGoalProfile } from "./uscore-goal-profile.js";
import type { USCoreHeadCircumferenceProfile } from "./uscore-head-circumference-profile.js";
import type { USCoreHeartRateProfile } from "./uscore-heart-rate-profile.js";
import type { USCoreImmunizationProfile } from "./uscore-immunization-profile.js";
import type { USCoreImplantableDeviceProfile } from "./uscore-implantable-device-profile.js";
import type { USCoreLaboratoryResultObservationProfile } from "./uscore-laboratory-result-observation-profile.js";
import type { USCoreLocation } from "./uscore-location.js";
import type { USCoreMedicationDispenseProfile } from "./uscore-medication-dispense-profile.js";
import type { USCoreMedicationProfile } from "./uscore-medication-profile.js";
import type { USCoreMedicationRequestProfile } from "./uscore-medication-request-profile.js";
import type { USCoreObservationClinicalResultProfile } from "./uscore-observation-clinical-result-profile.js";
import type { USCoreObservationOccupationProfile } from "./uscore-observation-occupation-profile.js";
import type { USCoreObservationPregnancyIntentProfile } from "./uscore-observation-pregnancy-intent-profile.js";
import type { USCoreObservationPregnancyStatusProfile } from "./uscore-observation-pregnancy-status-profile.js";
import type { USCoreObservationScreeningAssessmentProfile } from "./uscore-observation-screening-assessment-profile.js";
import type { USCoreObservationSexualOrientationProfile } from "./uscore-observation-sexual-orientation-profile.js";
import type { USCoreOrganizationProfile } from "./uscore-organization-profile.js";
import type { USCorePatientProfile } from "./uscore-patient-profile.js";
import type { USCorePediatricBMIforAgeObservationProfile } from "./uscore-pediatric-bmifor-age-observation-profile.js";
import type { USCorePediatricHeadOccipitalFrontalCircumferencePercentileProfile } from "./uscore-pediatric-head-occipital-frontal-circumference-percentile-profile.js";
import type { USCorePediatricWeightForHeightObservationProfile } from "./uscore-pediatric-weight-for-height-observation-profile.js";
import type { USCorePractitionerProfile } from "./uscore-practitioner-profile.js";
import type { USCorePractitionerRoleProfile } from "./uscore-practitioner-role-profile.js";
import type { USCoreProcedureProfile } from "./uscore-procedure-profile.js";
import type { USCoreProvenance } from "./uscore-provenance.js";
import type { USCorePulseOximetryProfile } from "./uscore-pulse-oximetry-profile.js";
import type { USCoreQuestionnaireResponseProfile } from "./uscore-questionnaire-response-profile.js";
import type { USCoreRelatedPersonProfile } from "./uscore-related-person-profile.js";
import type { USCoreRespiratoryRateProfile } from "./uscore-respiratory-rate-profile.js";
import type { USCoreServiceRequestProfile } from "./uscore-service-request-profile.js";
import type { USCoreSimpleObservationProfile } from "./uscore-simple-observation-profile.js";
import type { USCoreSmokingStatusProfile } from "./uscore-smoking-status-profile.js";
import type { USCoreSpecimenProfile } from "./uscore-specimen-profile.js";
import type { USCoreVitalSignsProfile } from "./uscore-vital-signs-profile.js";

export interface ProfileRegistry {
  AllergyIntolerance: {
    "us-core-allergyintolerance": USCoreAllergyIntolerance;
  };
  CarePlan: {
    "us-core-careplan": USCoreCarePlanProfile;
  };
  CareTeam: {
    "us-core-careteam": USCoreCareTeam;
  };
  Condition: {
    "us-core-condition-encounter-diagnosis": USCoreConditionEncounterDiagnosisProfile;
    "us-core-condition-problems-health-concerns": USCoreConditionProblemsHealthConcernsProfile;
  };
  Coverage: {
    "us-core-coverage": USCoreCoverageProfile;
  };
  Device: {
    "us-core-implantable-device": USCoreImplantableDeviceProfile;
  };
  DiagnosticReport: {
    "us-core-diagnosticreport-lab": USCoreDiagnosticReportProfileLaboratoryReporting;
    "us-core-diagnosticreport-note": USCoreDiagnosticReportProfileNoteExchange;
  };
  DocumentReference: {
    "us-core-documentreference": USCoreDocumentReferenceProfile;
  };
  Encounter: {
    "us-core-encounter": USCoreEncounterProfile;
  };
  Goal: {
    "us-core-goal": USCoreGoalProfile;
  };
  Immunization: {
    "us-core-immunization": USCoreImmunizationProfile;
  };
  Location: {
    "us-core-location": USCoreLocation;
  };
  Medication: {
    "us-core-medication": USCoreMedicationProfile;
  };
  MedicationDispense: {
    "us-core-medicationdispense": USCoreMedicationDispenseProfile;
  };
  MedicationRequest: {
    "us-core-medicationrequest": USCoreMedicationRequestProfile;
  };
  Observation: {
    "us-core-observation-clinical-result": USCoreObservationClinicalResultProfile;
    "us-core-observation-occupation": USCoreObservationOccupationProfile;
    "us-core-observation-pregnancyintent": USCoreObservationPregnancyIntentProfile;
    "us-core-observation-pregnancystatus": USCoreObservationPregnancyStatusProfile;
    "us-core-observation-screening-assessment": USCoreObservationScreeningAssessmentProfile;
    "us-core-observation-sexual-orientation": USCoreObservationSexualOrientationProfile;
    "us-core-simple-observation": USCoreSimpleObservationProfile;
    "us-core-smokingstatus": USCoreSmokingStatusProfile;
  };
  Organization: {
    "us-core-organization": USCoreOrganizationProfile;
  };
  Patient: {
    "us-core-patient": USCorePatientProfile;
  };
  Practitioner: {
    "us-core-practitioner": USCorePractitionerProfile;
  };
  PractitionerRole: {
    "us-core-practitionerrole": USCorePractitionerRoleProfile;
  };
  Procedure: {
    "us-core-procedure": USCoreProcedureProfile;
  };
  Provenance: {
    "us-core-provenance": USCoreProvenance;
  };
  RelatedPerson: {
    "us-core-relatedperson": USCoreRelatedPersonProfile;
  };
  ServiceRequest: {
    "us-core-servicerequest": USCoreServiceRequestProfile;
  };
  Specimen: {
    "us-core-specimen": USCoreSpecimenProfile;
  };
  sdc-questionnaireresponse: {
    "us-core-questionnaireresponse": USCoreQuestionnaireResponseProfile;
  };
  us-core-observation-clinical-result: {
    "us-core-observation-lab": USCoreLaboratoryResultObservationProfile;
  };
  us-core-vital-signs: {
    "head-occipital-frontal-circumference-percentile": USCorePediatricHeadOccipitalFrontalCircumferencePercentileProfile;
    "pediatric-bmi-for-age": USCorePediatricBMIforAgeObservationProfile;
    "pediatric-weight-for-height": USCorePediatricWeightForHeightObservationProfile;
    "us-core-blood-pressure": USCoreBloodPressureProfile;
    "us-core-bmi": USCoreBMIProfile;
    "us-core-body-height": USCoreBodyHeightProfile;
    "us-core-body-temperature": USCoreBodyTemperatureProfile;
    "us-core-body-weight": USCoreBodyWeightProfile;
    "us-core-head-circumference": USCoreHeadCircumferenceProfile;
    "us-core-heart-rate": USCoreHeartRateProfile;
    "us-core-pulse-oximetry": USCorePulseOximetryProfile;
    "us-core-respiratory-rate": USCoreRespiratoryRateProfile;
  };
  vitalsigns: {
    "us-core-vital-signs": USCoreVitalSignsProfile;
  };
}


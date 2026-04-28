import type { Condition } from "./resources/condition.js";
import type { Encounter } from "./resources/encounter.js";
import type { MedicationRequest } from "./resources/medication-request.js";
import type { Observation } from "./resources/observation.js";
import type { Patient } from "./resources/patient.js";
import type { Specimen } from "./resources/specimen.js";

import type { ObservationSearchParams, PatientSearchParams } from "./search-params.js";

export interface FhirResourceMap {
  Condition: Condition;
  Encounter: Encounter;
  MedicationRequest: MedicationRequest;
  Observation: Observation;
  Patient: Patient;
  Specimen: Specimen;
}

export type ResourceType = keyof FhirResourceMap;

export interface SearchParamRegistry {
  Observation: ObservationSearchParams;
  Patient: PatientSearchParams;
}

export interface IncludeRegistry {
  Observation: {
    "subject": "Patient";
  };
}

export interface RevIncludeRegistry {
  Patient: {
    Observation: "subject";
  };
}

export interface ProfileRegistry {}

export interface IncludeExpressions {
  Observation: {
    "subject": "subject";
  };
}

export const includeExpressions: Record<string, Record<string, string | string[]>> = {
  Observation: {
    "subject": "subject",
  },
};


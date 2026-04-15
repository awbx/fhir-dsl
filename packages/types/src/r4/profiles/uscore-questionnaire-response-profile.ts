import type { Reference } from "../datatypes.js";
import type { QuestionnaireResponse } from "../resources/questionnaire-response.js";

/**
 * US Core QuestionnaireResponse Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-questionnaireresponse
 */
export interface USCoreQuestionnaireResponseProfile extends QuestionnaireResponse {
  subject: Reference<"us-core-patient">;
  author?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-patient" | "PractitionerRole" | "Device" | "us-core-relatedperson">;
}


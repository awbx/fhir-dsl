import type { Reference } from "../datatypes.js";
import type { sdc-questionnaireresponse } from "../resources/sdc-questionnaireresponse.js";

/**
 * US Core QuestionnaireResponse Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-questionnaireresponse
 */
export interface USCoreQuestionnaireResponseProfile extends sdc-questionnaireresponse {
  questionnaire?: unknown;
  status?: unknown;
  subject: Reference<"us-core-patient">;
  authored?: unknown;
  author?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-patient" | "PractitionerRole" | "Device" | "us-core-relatedperson">;
  item?: unknown;
}


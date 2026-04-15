import type {
  Attachment,
  BackboneElement,
  Coding,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirInteger,
  FhirString,
  FhirTime,
  FhirUri,
} from "../primitives.js";

export interface QuestionnaireResponseItemAnswer extends BackboneElement {
  valueBoolean?: FhirBoolean;
  valueDecimal?: FhirDecimal;
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueDateTime?: FhirDateTime;
  valueTime?: FhirTime;
  valueString?: FhirString;
  valueUri?: FhirUri;
  valueAttachment?: Attachment;
  valueCoding?: Coding;
  valueQuantity?: Quantity;
  valueReference?: Reference<"Resource">;
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseItem extends BackboneElement {
  linkId: FhirString;
  definition?: FhirUri;
  text?: FhirString;
  answer?: QuestionnaireResponseItemAnswer[];
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponse extends DomainResource {
  resourceType: "QuestionnaireResponse";
  identifier?: Identifier[];
  basedOn?: Reference<"CarePlan" | "ServiceRequest">[];
  partOf?: Reference<"Observation" | "Procedure">[];
  questionnaire: FhirCanonical;
  status: FhirCode;
  subject?: Reference<"Resource">;
  encounter?: Reference<"Encounter">;
  authored?: FhirDateTime;
  author?: Reference<"Device" | "Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "Organization">;
  source?: Reference<"Device" | "Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  item?: QuestionnaireResponseItem[];
}

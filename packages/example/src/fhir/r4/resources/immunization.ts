import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime, FhirPositiveInt, FhirString, FhirUri } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Quantity, Reference } from "../datatypes.js";

export interface ImmunizationPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
}

export interface ImmunizationEducation extends BackboneElement {
  documentType?: FhirString;
  reference?: FhirUri;
  publicationDate?: FhirDateTime;
  presentationDate?: FhirDateTime;
}

export interface ImmunizationReaction extends BackboneElement {
  date?: FhirDateTime;
  detail?: Reference<"Observation">;
  reported?: FhirBoolean;
}

export interface ImmunizationProtocolApplied extends BackboneElement {
  series?: FhirString;
  authority?: Reference<"Organization">;
  targetDisease?: CodeableConcept[];
  doseNumberPositiveInt?: FhirPositiveInt;
  doseNumberString?: FhirString;
  seriesDosesPositiveInt?: FhirPositiveInt;
  seriesDosesString?: FhirString;
}

export interface Immunization extends DomainResource {
  resourceType: "Immunization";
  identifier?: Identifier[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  vaccineCode: CodeableConcept;
  patient: Reference<"Patient">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrenceString?: FhirString;
  recorded?: FhirDateTime;
  primarySource?: FhirBoolean;
  reportOrigin?: CodeableConcept;
  location?: Reference<"Location">;
  manufacturer?: Reference<"Organization">;
  lotNumber?: FhirString;
  expirationDate?: FhirDate;
  site?: CodeableConcept;
  route?: CodeableConcept;
  doseQuantity?: Quantity;
  performer?: ImmunizationPerformer[];
  note?: Annotation[];
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport">[];
  isSubpotent?: FhirBoolean;
  subpotentReason?: CodeableConcept[];
  education?: ImmunizationEducation[];
  programEligibility?: CodeableConcept[];
  fundingSource?: CodeableConcept;
  reaction?: ImmunizationReaction[];
  protocolApplied?: ImmunizationProtocolApplied[];
}

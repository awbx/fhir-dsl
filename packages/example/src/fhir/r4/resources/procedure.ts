import type { FhirCanonical, FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";
import type { Age, Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Range, Reference } from "../datatypes.js";

export interface ProcedurePerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson" | "Device">;
  onBehalfOf?: Reference<"Organization">;
}

export interface ProcedureFocalDevice extends BackboneElement {
  action?: CodeableConcept;
  manipulated: Reference<"Device">;
}

export interface Procedure extends DomainResource {
  resourceType: "Procedure";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"CarePlan" | "ServiceRequest">[];
  partOf?: Reference<"Procedure" | "Observation" | "MedicationAdministration">[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  category?: CodeableConcept;
  code?: CodeableConcept;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  performedDateTime?: FhirDateTime;
  performedPeriod?: Period;
  performedString?: FhirString;
  performedAge?: Age;
  performedRange?: Range;
  recorder?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole">;
  asserter?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole">;
  performer?: ProcedurePerformer[];
  location?: Reference<"Location">;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "Procedure" | "DiagnosticReport" | "DocumentReference">[];
  bodySite?: CodeableConcept[];
  outcome?: CodeableConcept;
  report?: Reference<"DiagnosticReport" | "DocumentReference" | "Composition">[];
  complication?: CodeableConcept[];
  complicationDetail?: Reference<"Condition">[];
  followUp?: CodeableConcept[];
  note?: Annotation[];
  focalDevice?: ProcedureFocalDevice[];
  usedReference?: Reference<"Device" | "Medication" | "Substance">[];
  usedCode?: CodeableConcept[];
}

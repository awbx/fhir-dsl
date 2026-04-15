import type {
  Age,
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Range,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface ProcedurePerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "Patient"
    | "RelatedPerson"
    | "Device"
    | "CareTeam"
    | "HealthcareService"
  >;
  onBehalfOf?: Reference<"Organization">;
  period?: Period;
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
  category?: CodeableConcept[];
  code?: CodeableConcept;
  subject: Reference<"Patient" | "Group" | "Device" | "Practitioner" | "Organization" | "Location">;
  focus?: Reference<
    | "Patient"
    | "Group"
    | "RelatedPerson"
    | "Practitioner"
    | "Organization"
    | "CareTeam"
    | "PractitionerRole"
    | "Specimen"
  >;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceString?: FhirString;
  occurrenceAge?: Age;
  occurrenceRange?: Range;
  occurrenceTiming?: Timing;
  recorded?: FhirDateTime;
  recorder?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole">;
  reportedBoolean?: FhirBoolean;
  reportedReference?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Organization">;
  performer?: ProcedurePerformer[];
  location?: Reference<"Location">;
  reason?: CodeableReference[];
  bodySite?: CodeableConcept[];
  outcome?: CodeableConcept;
  report?: Reference<"DiagnosticReport" | "DocumentReference" | "Composition">[];
  complication?: CodeableReference[];
  followUp?: CodeableConcept[];
  note?: Annotation[];
  focalDevice?: ProcedureFocalDevice[];
  used?: CodeableReference[];
  supportingInfo?: Reference<"Resource">[];
}

import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirId, FhirString, FhirUnsignedInt } from "../primitives.js";

export interface ImagingStudySeriesPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "CareTeam"
    | "Patient"
    | "Device"
    | "RelatedPerson"
    | "HealthcareService"
  >;
}

export interface ImagingStudySeriesInstance extends BackboneElement {
  uid: FhirId;
  sopClass: Coding;
  number?: FhirUnsignedInt;
  title?: FhirString;
}

export interface ImagingStudySeries extends BackboneElement {
  uid: FhirId;
  number?: FhirUnsignedInt;
  modality: CodeableConcept;
  description?: FhirString;
  numberOfInstances?: FhirUnsignedInt;
  endpoint?: Reference<"Endpoint">[];
  bodySite?: CodeableReference;
  laterality?: CodeableConcept;
  specimen?: Reference<"Specimen">[];
  started?: FhirDateTime;
  performer?: ImagingStudySeriesPerformer[];
  instance?: ImagingStudySeriesInstance[];
}

export interface ImagingStudy extends DomainResource {
  resourceType: "ImagingStudy";
  identifier?: Identifier[];
  status: FhirCode;
  modality?: CodeableConcept[];
  subject: Reference<"Patient" | "Device" | "Group">;
  encounter?: Reference<"Encounter">;
  started?: FhirDateTime;
  basedOn?: Reference<"CarePlan" | "ServiceRequest" | "Appointment" | "AppointmentResponse" | "Task">[];
  partOf?: Reference<"Procedure">[];
  referrer?: Reference<"Practitioner" | "PractitionerRole">;
  endpoint?: Reference<"Endpoint">[];
  numberOfSeries?: FhirUnsignedInt;
  numberOfInstances?: FhirUnsignedInt;
  procedure?: CodeableReference[];
  location?: Reference<"Location">;
  reason?: CodeableReference[];
  note?: Annotation[];
  description?: FhirString;
  series?: ImagingStudySeries[];
}

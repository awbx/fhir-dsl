import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirId, FhirString, FhirUnsignedInt } from "../primitives.js";

export interface ImagingStudySeriesPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "Device" | "RelatedPerson"
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
  modality: Coding;
  description?: FhirString;
  numberOfInstances?: FhirUnsignedInt;
  endpoint?: Reference<"Endpoint">[];
  bodySite?: Coding;
  laterality?: Coding;
  specimen?: Reference<"Specimen">[];
  started?: FhirDateTime;
  performer?: ImagingStudySeriesPerformer[];
  instance?: ImagingStudySeriesInstance[];
}

export interface ImagingStudy extends DomainResource {
  resourceType: "ImagingStudy";
  identifier?: Identifier[];
  status: FhirCode;
  modality?: Coding[];
  subject: Reference<"Patient" | "Device" | "Group">;
  encounter?: Reference<"Encounter">;
  started?: FhirDateTime;
  basedOn?: Reference<"CarePlan" | "ServiceRequest" | "Appointment" | "AppointmentResponse" | "Task">[];
  referrer?: Reference<"Practitioner" | "PractitionerRole">;
  interpreter?: Reference<"Practitioner" | "PractitionerRole">[];
  endpoint?: Reference<"Endpoint">[];
  numberOfSeries?: FhirUnsignedInt;
  numberOfInstances?: FhirUnsignedInt;
  procedureReference?: Reference<"Procedure">;
  procedureCode?: CodeableConcept[];
  location?: Reference<"Location">;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "Media" | "DiagnosticReport" | "DocumentReference">[];
  note?: Annotation[];
  description?: FhirString;
  series?: ImagingStudySeries[];
}

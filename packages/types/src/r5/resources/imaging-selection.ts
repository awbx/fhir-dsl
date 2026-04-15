import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDecimal, FhirId, FhirInstant, FhirString, FhirUnsignedInt } from "../primitives.js";

export interface ImagingSelectionPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor?: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Device"
    | "Organization"
    | "CareTeam"
    | "Patient"
    | "RelatedPerson"
    | "HealthcareService"
  >;
}

export interface ImagingSelectionInstanceImageRegion2D extends BackboneElement {
  regionType: FhirCode;
  coordinate: FhirDecimal[];
}

export interface ImagingSelectionInstanceImageRegion3D extends BackboneElement {
  regionType: FhirCode;
  coordinate: FhirDecimal[];
}

export interface ImagingSelectionInstance extends BackboneElement {
  uid: FhirId;
  number?: FhirUnsignedInt;
  sopClass?: Coding;
  subset?: FhirString[];
  imageRegion2D?: ImagingSelectionInstanceImageRegion2D[];
  imageRegion3D?: ImagingSelectionInstanceImageRegion3D[];
}

export interface ImagingSelection extends DomainResource {
  resourceType: "ImagingSelection";
  identifier?: Identifier[];
  status: FhirCode;
  subject?: Reference<
    | "Patient"
    | "Group"
    | "Device"
    | "Location"
    | "Organization"
    | "Procedure"
    | "Practitioner"
    | "Medication"
    | "Substance"
    | "Specimen"
  >;
  issued?: FhirInstant;
  performer?: ImagingSelectionPerformer[];
  basedOn?: Reference<"CarePlan" | "ServiceRequest" | "Appointment" | "AppointmentResponse" | "Task">[];
  category?: CodeableConcept[];
  code: CodeableConcept;
  studyUid?: FhirId;
  derivedFrom?: Reference<"ImagingStudy" | "DocumentReference">[];
  endpoint?: Reference<"Endpoint">[];
  seriesUid?: FhirId;
  seriesNumber?: FhirUnsignedInt;
  frameOfReferenceUid?: FhirId;
  bodySite?: CodeableReference;
  focus?: Reference<"ImagingSelection">[];
  instance?: ImagingSelectionInstance[];
}

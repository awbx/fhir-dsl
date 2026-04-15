import type {
  Annotation,
  Attachment,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirDecimal, FhirInstant, FhirPositiveInt, FhirString } from "../primitives.js";

export interface Media extends DomainResource {
  resourceType: "Media";
  identifier?: Identifier[];
  basedOn?: Reference<"ServiceRequest" | "CarePlan">[];
  partOf?: Reference<"Resource">[];
  status: FhirCode;
  type?: CodeableConcept;
  modality?: CodeableConcept;
  view?: CodeableConcept;
  subject?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "Group" | "Device" | "Specimen" | "Location">;
  encounter?: Reference<"Encounter">;
  createdDateTime?: FhirDateTime;
  createdPeriod?: Period;
  issued?: FhirInstant;
  operator?: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "Device" | "RelatedPerson"
  >;
  reasonCode?: CodeableConcept[];
  bodySite?: CodeableConcept;
  deviceName?: FhirString;
  device?: Reference<"Device" | "DeviceMetric" | "Device">;
  height?: FhirPositiveInt;
  width?: FhirPositiveInt;
  frames?: FhirPositiveInt;
  duration?: FhirDecimal;
  content: Attachment;
  note?: Annotation[];
}

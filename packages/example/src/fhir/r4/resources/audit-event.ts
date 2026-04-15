import type { BackboneElement, CodeableConcept, Coding, DomainResource, Period, Reference } from "../datatypes.js";
import type { FhirBase64Binary, FhirBoolean, FhirCode, FhirInstant, FhirString, FhirUri } from "../primitives.js";

export interface AuditEventAgentNetwork extends BackboneElement {
  address?: FhirString;
  type?: FhirCode;
}

export interface AuditEventAgent extends BackboneElement {
  type?: CodeableConcept;
  role?: CodeableConcept[];
  who?: Reference<"PractitionerRole" | "Practitioner" | "Organization" | "Device" | "Patient" | "RelatedPerson">;
  altId?: FhirString;
  name?: FhirString;
  requestor: FhirBoolean;
  location?: Reference<"Location">;
  policy?: FhirUri[];
  media?: Coding;
  network?: AuditEventAgentNetwork;
  purposeOfUse?: CodeableConcept[];
}

export interface AuditEventSource extends BackboneElement {
  site?: FhirString;
  observer: Reference<"PractitionerRole" | "Practitioner" | "Organization" | "Device" | "Patient" | "RelatedPerson">;
  type?: Coding[];
}

export interface AuditEventEntityDetail extends BackboneElement {
  type: FhirString;
  valueString?: FhirString;
  valueBase64Binary?: FhirBase64Binary;
}

export interface AuditEventEntity extends BackboneElement {
  what?: Reference<"Resource">;
  type?: Coding;
  role?: Coding;
  lifecycle?: Coding;
  securityLabel?: Coding[];
  name?: FhirString;
  description?: FhirString;
  query?: FhirBase64Binary;
  detail?: AuditEventEntityDetail[];
}

export interface AuditEvent extends DomainResource {
  resourceType: "AuditEvent";
  type: Coding;
  subtype?: Coding[];
  action?: FhirCode;
  period?: Period;
  recorded: FhirInstant;
  outcome?: FhirCode;
  outcomeDesc?: FhirString;
  purposeOfEvent?: CodeableConcept[];
  agent: AuditEventAgent[];
  source: AuditEventSource;
  entity?: AuditEventEntity[];
}

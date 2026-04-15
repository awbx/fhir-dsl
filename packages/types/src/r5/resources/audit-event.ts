import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
} from "../datatypes.js";
import type {
  FhirBase64Binary,
  FhirBoolean,
  FhirCode,
  FhirDateTime,
  FhirInstant,
  FhirInteger,
  FhirString,
  FhirTime,
  FhirUri,
} from "../primitives.js";

export interface AuditEventOutcome extends BackboneElement {
  code: Coding;
  detail?: CodeableConcept[];
}

export interface AuditEventAgent extends BackboneElement {
  type?: CodeableConcept;
  role?: CodeableConcept[];
  who: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "Device" | "RelatedPerson"
  >;
  requestor?: FhirBoolean;
  location?: Reference<"Location">;
  policy?: FhirUri[];
  networkReference?: Reference<"Endpoint">;
  networkUri?: FhirUri;
  networkString?: FhirString;
  authorization?: CodeableConcept[];
}

export interface AuditEventSource extends BackboneElement {
  site?: Reference<"Location">;
  observer: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "Device" | "RelatedPerson"
  >;
  type?: CodeableConcept[];
}

export interface AuditEventEntityDetail extends BackboneElement {
  type: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueTime?: FhirTime;
  valueDateTime?: FhirDateTime;
  valuePeriod?: Period;
  valueBase64Binary?: FhirBase64Binary;
}

export interface AuditEventEntity extends BackboneElement {
  what?: Reference<"Resource">;
  role?: CodeableConcept;
  securityLabel?: CodeableConcept[];
  query?: FhirBase64Binary;
  detail?: AuditEventEntityDetail[];
  agent?: AuditEventAgent[];
}

export interface AuditEvent extends DomainResource {
  resourceType: "AuditEvent";
  category?: CodeableConcept[];
  code: CodeableConcept;
  action?: FhirCode;
  severity?: FhirCode;
  occurredPeriod?: Period;
  occurredDateTime?: FhirDateTime;
  recorded: FhirInstant;
  outcome?: AuditEventOutcome;
  authorization?: CodeableConcept[];
  basedOn?: Reference<
    | "CarePlan"
    | "DeviceRequest"
    | "ImmunizationRecommendation"
    | "MedicationRequest"
    | "NutritionOrder"
    | "ServiceRequest"
    | "Task"
  >[];
  patient?: Reference<"Patient">;
  encounter?: Reference<"Encounter">;
  agent: AuditEventAgent[];
  source: AuditEventSource;
  entity?: AuditEventEntity[];
}

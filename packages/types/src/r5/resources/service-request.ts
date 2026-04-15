import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
  Timing,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ServiceRequestOrderDetailParameter extends BackboneElement {
  code: CodeableConcept;
  valueQuantity?: Quantity;
  valueRatio?: Ratio;
  valueRange?: Range;
  valueBoolean?: FhirBoolean;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valuePeriod?: Period;
}

export interface ServiceRequestOrderDetail extends BackboneElement {
  parameterFocus?: CodeableReference;
  parameter: ServiceRequestOrderDetailParameter[];
}

export interface ServiceRequestPatientInstruction extends BackboneElement {
  instructionMarkdown?: FhirMarkdown;
  instructionReference?: Reference<"DocumentReference">;
}

export interface ServiceRequest extends DomainResource {
  resourceType: "ServiceRequest";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"CarePlan" | "ServiceRequest" | "MedicationRequest">[];
  replaces?: Reference<"ServiceRequest">[];
  requisition?: Identifier;
  status: FhirCode;
  intent: FhirCode;
  category?: CodeableConcept[];
  priority?: FhirCode;
  doNotPerform?: FhirBoolean;
  code?: CodeableReference;
  orderDetail?: ServiceRequestOrderDetail[];
  quantityQuantity?: Quantity;
  quantityRatio?: Ratio;
  quantityRange?: Range;
  subject: Reference<"Patient" | "Group" | "Location" | "Device">;
  focus?: Reference<"Resource">[];
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  asNeededBoolean?: FhirBoolean;
  asNeededCodeableConcept?: CodeableConcept;
  authoredOn?: FhirDateTime;
  requester?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson" | "Device">;
  performerType?: CodeableConcept;
  performer?: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "CareTeam"
    | "HealthcareService"
    | "Patient"
    | "Device"
    | "RelatedPerson"
  >[];
  location?: CodeableReference[];
  reason?: CodeableReference[];
  insurance?: Reference<"Coverage" | "ClaimResponse">[];
  supportingInfo?: CodeableReference[];
  specimen?: Reference<"Specimen">[];
  bodySite?: CodeableConcept[];
  bodyStructure?: Reference<"BodyStructure">;
  note?: Annotation[];
  patientInstruction?: ServiceRequestPatientInstruction[];
  relevantHistory?: Reference<"Provenance">[];
}

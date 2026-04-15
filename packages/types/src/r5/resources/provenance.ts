import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Period,
  Reference,
  Signature,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirInstant, FhirUri } from "../primitives.js";

export interface ProvenanceAgent extends BackboneElement {
  type?: CodeableConcept;
  role?: CodeableConcept[];
  who: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "Device" | "RelatedPerson"
  >;
  onBehalfOf?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient">;
}

export interface ProvenanceEntity extends BackboneElement {
  role: FhirCode;
  what: Reference<"Resource">;
  agent?: ProvenanceAgent[];
}

export interface Provenance extends DomainResource {
  resourceType: "Provenance";
  target: Reference<"Resource">[];
  occurredPeriod?: Period;
  occurredDateTime?: FhirDateTime;
  recorded?: FhirInstant;
  policy?: FhirUri[];
  location?: Reference<"Location">;
  authorization?: CodeableReference[];
  activity?: CodeableConcept;
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
  agent: ProvenanceAgent[];
  entity?: ProvenanceEntity[];
  signature?: Signature[];
}

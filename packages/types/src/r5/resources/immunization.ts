import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime, FhirString } from "../primitives.js";

export interface ImmunizationPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson">;
}

export interface ImmunizationProgramEligibility extends BackboneElement {
  program: CodeableConcept;
  programStatus: CodeableConcept;
}

export interface ImmunizationReaction extends BackboneElement {
  date?: FhirDateTime;
  manifestation?: CodeableReference;
  reported?: FhirBoolean;
}

export interface ImmunizationProtocolApplied extends BackboneElement {
  series?: FhirString;
  authority?: Reference<"Organization">;
  targetDisease?: CodeableConcept[];
  doseNumber: FhirString;
  seriesDoses?: FhirString;
}

export interface Immunization extends DomainResource {
  resourceType: "Immunization";
  identifier?: Identifier[];
  basedOn?: Reference<"CarePlan" | "MedicationRequest" | "ServiceRequest" | "ImmunizationRecommendation">[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  vaccineCode: CodeableConcept;
  administeredProduct?: CodeableReference;
  manufacturer?: CodeableReference;
  lotNumber?: FhirString;
  expirationDate?: FhirDate;
  patient: Reference<"Patient">;
  encounter?: Reference<"Encounter">;
  supportingInformation?: Reference<"Resource">[];
  occurrenceDateTime?: FhirDateTime;
  occurrenceString?: FhirString;
  primarySource?: FhirBoolean;
  informationSource?: CodeableReference;
  location?: Reference<"Location">;
  site?: CodeableConcept;
  route?: CodeableConcept;
  doseQuantity?: Quantity;
  performer?: ImmunizationPerformer[];
  note?: Annotation[];
  reason?: CodeableReference[];
  isSubpotent?: FhirBoolean;
  subpotentReason?: CodeableConcept[];
  programEligibility?: ImmunizationProgramEligibility[];
  fundingSource?: CodeableConcept;
  reaction?: ImmunizationReaction[];
  protocolApplied?: ImmunizationProtocolApplied[];
}

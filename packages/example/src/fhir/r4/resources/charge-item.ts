import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Money,
  Period,
  Quantity,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirDecimal, FhirString, FhirUri } from "../primitives.js";

export interface ChargeItemPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "Device" | "RelatedPerson"
  >;
}

export interface ChargeItem extends DomainResource {
  resourceType: "ChargeItem";
  identifier?: Identifier[];
  definitionUri?: FhirUri[];
  definitionCanonical?: FhirCanonical[];
  status: FhirCode;
  partOf?: Reference<"ChargeItem">[];
  code: CodeableConcept;
  subject: Reference<"Patient" | "Group">;
  context?: Reference<"Encounter" | "EpisodeOfCare">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  performer?: ChargeItemPerformer[];
  performingOrganization?: Reference<"Organization">;
  requestingOrganization?: Reference<"Organization">;
  costCenter?: Reference<"Organization">;
  quantity?: Quantity;
  bodysite?: CodeableConcept[];
  factorOverride?: FhirDecimal;
  priceOverride?: Money;
  overrideReason?: FhirString;
  enterer?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "Device" | "RelatedPerson">;
  enteredDate?: FhirDateTime;
  reason?: CodeableConcept[];
  service?: Reference<
    | "DiagnosticReport"
    | "ImagingStudy"
    | "Immunization"
    | "MedicationAdministration"
    | "MedicationDispense"
    | "Observation"
    | "Procedure"
    | "SupplyDelivery"
  >[];
  productReference?: Reference<"Device" | "Medication" | "Substance">;
  productCodeableConcept?: CodeableConcept;
  account?: Reference<"Account">[];
  note?: Annotation[];
  supportingInformation?: Reference<"Resource">[];
}

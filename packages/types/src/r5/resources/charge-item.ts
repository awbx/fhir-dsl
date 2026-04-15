import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  MonetaryComponent,
  Period,
  Quantity,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirUri } from "../primitives.js";

export interface ChargeItemPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "HealthcareService"
    | "CareTeam"
    | "Patient"
    | "Device"
    | "RelatedPerson"
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
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  performer?: ChargeItemPerformer[];
  performingOrganization?: Reference<"Organization">;
  requestingOrganization?: Reference<"Organization">;
  costCenter?: Reference<"Organization">;
  quantity?: Quantity;
  bodysite?: CodeableConcept[];
  unitPriceComponent?: MonetaryComponent;
  totalPriceComponent?: MonetaryComponent;
  overrideReason?: CodeableConcept;
  enterer?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "Device" | "RelatedPerson">;
  enteredDate?: FhirDateTime;
  reason?: CodeableConcept[];
  service?: CodeableReference[];
  product?: CodeableReference[];
  account?: Reference<"Account">[];
  note?: Annotation[];
  supportingInformation?: Reference<"Resource">[];
}

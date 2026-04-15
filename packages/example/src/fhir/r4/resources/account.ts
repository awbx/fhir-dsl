import type { FhirBoolean, FhirCode, FhirPositiveInt, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface AccountCoverage extends BackboneElement {
  coverage: Reference<"Coverage">;
  priority?: FhirPositiveInt;
}

export interface AccountGuarantor extends BackboneElement {
  party: Reference<"Patient" | "RelatedPerson" | "Organization">;
  onHold?: FhirBoolean;
  period?: Period;
}

export interface Account extends DomainResource {
  resourceType: "Account";
  identifier?: Identifier[];
  status: FhirCode;
  type?: CodeableConcept;
  name?: FhirString;
  subject?: Reference<"Patient" | "Device" | "Practitioner" | "PractitionerRole" | "Location" | "HealthcareService" | "Organization">[];
  servicePeriod?: Period;
  coverage?: AccountCoverage[];
  owner?: Reference<"Organization">;
  description?: FhirString;
  guarantor?: AccountGuarantor[];
  partOf?: Reference<"Account">;
}

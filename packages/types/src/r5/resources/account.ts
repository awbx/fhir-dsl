import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Money,
  Period,
  Reference,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDateTime,
  FhirInstant,
  FhirMarkdown,
  FhirPositiveInt,
  FhirString,
} from "../primitives.js";

export interface AccountCoverage extends BackboneElement {
  coverage: Reference<"Coverage">;
  priority?: FhirPositiveInt;
}

export interface AccountGuarantor extends BackboneElement {
  party: Reference<"Patient" | "RelatedPerson" | "Organization">;
  onHold?: FhirBoolean;
  period?: Period;
}

export interface AccountDiagnosis extends BackboneElement {
  sequence?: FhirPositiveInt;
  condition: CodeableReference;
  dateOfDiagnosis?: FhirDateTime;
  type?: CodeableConcept[];
  onAdmission?: FhirBoolean;
  packageCode?: CodeableConcept[];
}

export interface AccountProcedure extends BackboneElement {
  sequence?: FhirPositiveInt;
  code: CodeableReference;
  dateOfService?: FhirDateTime;
  type?: CodeableConcept[];
  packageCode?: CodeableConcept[];
  device?: Reference<"Device">[];
}

export interface AccountRelatedAccount extends BackboneElement {
  relationship?: CodeableConcept;
  account: Reference<"Account">;
}

export interface AccountBalance extends BackboneElement {
  aggregate?: CodeableConcept;
  term?: CodeableConcept;
  estimate?: FhirBoolean;
  amount: Money;
}

export interface Account extends DomainResource {
  resourceType: "Account";
  identifier?: Identifier[];
  status: FhirCode;
  billingStatus?: CodeableConcept;
  type?: CodeableConcept;
  name?: FhirString;
  subject?: Reference<
    "Patient" | "Device" | "Practitioner" | "PractitionerRole" | "Location" | "HealthcareService" | "Organization"
  >[];
  servicePeriod?: Period;
  coverage?: AccountCoverage[];
  owner?: Reference<"Organization">;
  description?: FhirMarkdown;
  guarantor?: AccountGuarantor[];
  diagnosis?: AccountDiagnosis[];
  procedure?: AccountProcedure[];
  relatedAccount?: AccountRelatedAccount[];
  currency?: CodeableConcept;
  balance?: AccountBalance[];
  calculatedAt?: FhirInstant;
}

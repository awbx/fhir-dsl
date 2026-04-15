import type { FhirDateTime } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface MedicinalProductAuthorizationJurisdictionalAuthorization extends BackboneElement {
  identifier?: Identifier[];
  country?: CodeableConcept;
  jurisdiction?: CodeableConcept[];
  legalStatusOfSupply?: CodeableConcept;
  validityPeriod?: Period;
}

export interface MedicinalProductAuthorizationProcedure extends BackboneElement {
  identifier?: Identifier;
  type: CodeableConcept;
  datePeriod?: Period;
  dateDateTime?: FhirDateTime;
  application?: MedicinalProductAuthorizationProcedure[];
}

export interface MedicinalProductAuthorization extends DomainResource {
  resourceType: "MedicinalProductAuthorization";
  identifier?: Identifier[];
  subject?: Reference<"MedicinalProduct" | "MedicinalProductPackaged">;
  country?: CodeableConcept[];
  jurisdiction?: CodeableConcept[];
  status?: CodeableConcept;
  statusDate?: FhirDateTime;
  restoreDate?: FhirDateTime;
  validityPeriod?: Period;
  dataExclusivityPeriod?: Period;
  dateOfFirstAuthorization?: FhirDateTime;
  internationalBirthDate?: FhirDateTime;
  legalBasis?: CodeableConcept;
  jurisdictionalAuthorization?: MedicinalProductAuthorizationJurisdictionalAuthorization[];
  holder?: Reference<"Organization">;
  regulator?: Reference<"Organization">;
  procedure?: MedicinalProductAuthorizationProcedure;
}

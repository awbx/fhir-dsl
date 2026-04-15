import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Identifier,
  MarketingStatus,
  Reference,
} from "../datatypes.js";
import type { FhirDateTime, FhirString } from "../primitives.js";

export interface MedicinalProductNameNamePart extends BackboneElement {
  part: FhirString;
  type: Coding;
}

export interface MedicinalProductNameCountryLanguage extends BackboneElement {
  country: CodeableConcept;
  jurisdiction?: CodeableConcept;
  language: CodeableConcept;
}

export interface MedicinalProductName extends BackboneElement {
  productName: FhirString;
  namePart?: MedicinalProductNameNamePart[];
  countryLanguage?: MedicinalProductNameCountryLanguage[];
}

export interface MedicinalProductManufacturingBusinessOperation extends BackboneElement {
  operationType?: CodeableConcept;
  authorisationReferenceNumber?: Identifier;
  effectiveDate?: FhirDateTime;
  confidentialityIndicator?: CodeableConcept;
  manufacturer?: Reference<"Organization">[];
  regulator?: Reference<"Organization">;
}

export interface MedicinalProductSpecialDesignation extends BackboneElement {
  identifier?: Identifier[];
  type?: CodeableConcept;
  intendedUse?: CodeableConcept;
  indicationCodeableConcept?: CodeableConcept;
  indicationReference?: Reference<"MedicinalProductIndication">;
  status?: CodeableConcept;
  date?: FhirDateTime;
  species?: CodeableConcept;
}

export interface MedicinalProduct extends DomainResource {
  resourceType: "MedicinalProduct";
  identifier?: Identifier[];
  type?: CodeableConcept;
  domain?: Coding;
  combinedPharmaceuticalDoseForm?: CodeableConcept;
  legalStatusOfSupply?: CodeableConcept;
  additionalMonitoringIndicator?: CodeableConcept;
  specialMeasures?: FhirString[];
  paediatricUseIndicator?: CodeableConcept;
  productClassification?: CodeableConcept[];
  marketingStatus?: MarketingStatus[];
  pharmaceuticalProduct?: Reference<"MedicinalProductPharmaceutical">[];
  packagedMedicinalProduct?: Reference<"MedicinalProductPackaged">[];
  attachedDocument?: Reference<"DocumentReference">[];
  masterFile?: Reference<"DocumentReference">[];
  contact?: Reference<"Organization" | "PractitionerRole">[];
  clinicalTrial?: Reference<"ResearchStudy">[];
  name: MedicinalProductName[];
  crossReference?: Identifier[];
  manufacturingBusinessOperation?: MedicinalProductManufacturingBusinessOperation[];
  specialDesignation?: MedicinalProductSpecialDesignation[];
}

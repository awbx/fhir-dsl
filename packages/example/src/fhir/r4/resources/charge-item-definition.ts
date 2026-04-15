import type {
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  Money,
  Period,
  Reference,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ChargeItemDefinitionApplicability extends BackboneElement {
  description?: FhirString;
  language?: FhirString;
  expression?: FhirString;
}

export interface ChargeItemDefinitionPropertyGroupPriceComponent extends BackboneElement {
  type: FhirCode;
  code?: CodeableConcept;
  factor?: FhirDecimal;
  amount?: Money;
}

export interface ChargeItemDefinitionPropertyGroup extends BackboneElement {
  applicability?: ChargeItemDefinitionApplicability[];
  priceComponent?: ChargeItemDefinitionPropertyGroupPriceComponent[];
}

export interface ChargeItemDefinition extends DomainResource {
  resourceType: "ChargeItemDefinition";
  url: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  title?: FhirString;
  derivedFromUri?: FhirUri[];
  partOf?: FhirCanonical[];
  replaces?: FhirCanonical[];
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  copyright?: FhirMarkdown;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  code?: CodeableConcept;
  instance?: Reference<"Medication" | "Substance" | "Device">[];
  applicability?: ChargeItemDefinitionApplicability[];
  propertyGroup?: ChargeItemDefinitionPropertyGroup[];
}

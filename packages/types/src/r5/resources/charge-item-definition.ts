import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Expression,
  Identifier,
  MonetaryComponent,
  Period,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ChargeItemDefinitionApplicability extends BackboneElement {
  condition?: Expression;
  effectivePeriod?: Period;
  relatedArtifact?: RelatedArtifact;
}

export interface ChargeItemDefinitionPropertyGroup extends BackboneElement {
  applicability?: ChargeItemDefinitionApplicability[];
  priceComponent?: MonetaryComponent[];
}

export interface ChargeItemDefinition extends DomainResource {
  resourceType: "ChargeItemDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
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
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  code?: CodeableConcept;
  instance?: Reference<
    | "Medication"
    | "Substance"
    | "Device"
    | "DeviceDefinition"
    | "ActivityDefinition"
    | "PlanDefinition"
    | "HealthcareService"
  >[];
  applicability?: ChargeItemDefinitionApplicability[];
  propertyGroup?: ChargeItemDefinitionPropertyGroup[];
}

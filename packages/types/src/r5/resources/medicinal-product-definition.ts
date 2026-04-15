import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  DomainResource,
  Identifier,
  MarketingStatus,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirDate, FhirDateTime, FhirInteger, FhirMarkdown, FhirString } from "../primitives.js";

export interface MedicinalProductDefinitionContact extends BackboneElement {
  type?: CodeableConcept;
  contact: Reference<"Organization" | "PractitionerRole">;
}

export interface MedicinalProductDefinitionNamePart extends BackboneElement {
  part: FhirString;
  type: CodeableConcept;
}

export interface MedicinalProductDefinitionNameUsage extends BackboneElement {
  country: CodeableConcept;
  jurisdiction?: CodeableConcept;
  language: CodeableConcept;
}

export interface MedicinalProductDefinitionName extends BackboneElement {
  productName: FhirString;
  type?: CodeableConcept;
  part?: MedicinalProductDefinitionNamePart[];
  usage?: MedicinalProductDefinitionNameUsage[];
}

export interface MedicinalProductDefinitionCrossReference extends BackboneElement {
  product: CodeableReference;
  type?: CodeableConcept;
}

export interface MedicinalProductDefinitionOperation extends BackboneElement {
  type?: CodeableReference;
  effectiveDate?: Period;
  organization?: Reference<"Organization">[];
  confidentialityIndicator?: CodeableConcept;
}

export interface MedicinalProductDefinitionCharacteristic extends BackboneElement {
  type: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueMarkdown?: FhirMarkdown;
  valueQuantity?: Quantity;
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueBoolean?: FhirBoolean;
  valueAttachment?: Attachment;
}

export interface MedicinalProductDefinition extends DomainResource {
  resourceType: "MedicinalProductDefinition";
  identifier?: Identifier[];
  type?: CodeableConcept;
  domain?: CodeableConcept;
  version?: FhirString;
  status?: CodeableConcept;
  statusDate?: FhirDateTime;
  description?: FhirMarkdown;
  combinedPharmaceuticalDoseForm?: CodeableConcept;
  route?: CodeableConcept[];
  indication?: FhirMarkdown;
  legalStatusOfSupply?: CodeableConcept;
  additionalMonitoringIndicator?: CodeableConcept;
  specialMeasures?: CodeableConcept[];
  pediatricUseIndicator?: CodeableConcept;
  classification?: CodeableConcept[];
  marketingStatus?: MarketingStatus[];
  packagedMedicinalProduct?: CodeableConcept[];
  comprisedOf?: Reference<"ManufacturedItemDefinition" | "DeviceDefinition">[];
  ingredient?: CodeableConcept[];
  impurity?: CodeableReference[];
  attachedDocument?: Reference<"DocumentReference">[];
  masterFile?: Reference<"DocumentReference">[];
  contact?: MedicinalProductDefinitionContact[];
  clinicalTrial?: Reference<"ResearchStudy">[];
  code?: Coding[];
  name: MedicinalProductDefinitionName[];
  crossReference?: MedicinalProductDefinitionCrossReference[];
  operation?: MedicinalProductDefinitionOperation[];
  characteristic?: MedicinalProductDefinitionCharacteristic[];
}

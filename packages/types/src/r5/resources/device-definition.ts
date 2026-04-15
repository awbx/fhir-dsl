import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  ContactPoint,
  DomainResource,
  Identifier,
  Period,
  ProductShelfLife,
  Quantity,
  Range,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirInteger, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";

export interface DeviceDefinitionUdiDeviceIdentifierMarketDistribution extends BackboneElement {
  marketPeriod: Period;
  subJurisdiction: FhirUri;
}

export interface DeviceDefinitionUdiDeviceIdentifier extends BackboneElement {
  deviceIdentifier: FhirString;
  issuer: FhirUri;
  jurisdiction: FhirUri;
  marketDistribution?: DeviceDefinitionUdiDeviceIdentifierMarketDistribution[];
}

export interface DeviceDefinitionRegulatoryIdentifier extends BackboneElement {
  type: FhirCode;
  deviceIdentifier: FhirString;
  issuer: FhirUri;
  jurisdiction: FhirUri;
}

export interface DeviceDefinitionDeviceName extends BackboneElement {
  name: FhirString;
  type: FhirCode;
}

export interface DeviceDefinitionClassification extends BackboneElement {
  type: CodeableConcept;
  justification?: RelatedArtifact[];
}

export interface DeviceDefinitionConformsTo extends BackboneElement {
  category?: CodeableConcept;
  specification: CodeableConcept;
  version?: FhirString[];
  source?: RelatedArtifact[];
}

export interface DeviceDefinitionHasPart extends BackboneElement {
  reference: Reference<"DeviceDefinition">;
  count?: FhirInteger;
}

export interface DeviceDefinitionPackagingDistributor extends BackboneElement {
  name?: FhirString;
  organizationReference?: Reference<"Organization">[];
}

export interface DeviceDefinitionPackaging extends BackboneElement {
  identifier?: Identifier;
  type?: CodeableConcept;
  count?: FhirInteger;
  distributor?: DeviceDefinitionPackagingDistributor[];
  udiDeviceIdentifier?: DeviceDefinitionUdiDeviceIdentifier[];
  packaging?: DeviceDefinitionPackaging[];
}

export interface DeviceDefinitionVersion extends BackboneElement {
  type?: CodeableConcept;
  component?: Identifier;
  value: FhirString;
}

export interface DeviceDefinitionProperty extends BackboneElement {
  type: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueRange?: Range;
  valueAttachment?: Attachment;
}

export interface DeviceDefinitionLink extends BackboneElement {
  relation: Coding;
  relatedDevice: CodeableReference;
}

export interface DeviceDefinitionMaterial extends BackboneElement {
  substance: CodeableConcept;
  alternate?: FhirBoolean;
  allergenicIndicator?: FhirBoolean;
}

export interface DeviceDefinitionGuideline extends BackboneElement {
  useContext?: UsageContext[];
  usageInstruction?: FhirMarkdown;
  relatedArtifact?: RelatedArtifact[];
  indication?: CodeableConcept[];
  contraindication?: CodeableConcept[];
  warning?: CodeableConcept[];
  intendedUse?: FhirString;
}

export interface DeviceDefinitionCorrectiveAction extends BackboneElement {
  recall: FhirBoolean;
  scope?: FhirCode;
  period: Period;
}

export interface DeviceDefinitionChargeItem extends BackboneElement {
  chargeItemCode: CodeableReference;
  count: Quantity;
  effectivePeriod?: Period;
  useContext?: UsageContext[];
}

export interface DeviceDefinition extends DomainResource {
  resourceType: "DeviceDefinition";
  description?: FhirMarkdown;
  identifier?: Identifier[];
  udiDeviceIdentifier?: DeviceDefinitionUdiDeviceIdentifier[];
  regulatoryIdentifier?: DeviceDefinitionRegulatoryIdentifier[];
  partNumber?: FhirString;
  manufacturer?: Reference<"Organization">;
  deviceName?: DeviceDefinitionDeviceName[];
  modelNumber?: FhirString;
  classification?: DeviceDefinitionClassification[];
  conformsTo?: DeviceDefinitionConformsTo[];
  hasPart?: DeviceDefinitionHasPart[];
  packaging?: DeviceDefinitionPackaging[];
  version?: DeviceDefinitionVersion[];
  safety?: CodeableConcept[];
  shelfLifeStorage?: ProductShelfLife[];
  languageCode?: CodeableConcept[];
  property?: DeviceDefinitionProperty[];
  owner?: Reference<"Organization">;
  contact?: ContactPoint[];
  link?: DeviceDefinitionLink[];
  note?: Annotation[];
  material?: DeviceDefinitionMaterial[];
  productionIdentifierInUDI?: FhirCode[];
  guideline?: DeviceDefinitionGuideline;
  correctiveAction?: DeviceDefinitionCorrectiveAction;
  chargeItem?: DeviceDefinitionChargeItem[];
}

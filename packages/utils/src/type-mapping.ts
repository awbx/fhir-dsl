const FHIR_PRIMITIVE_TO_TS: Record<string, string> = {
  boolean: "FhirBoolean",
  integer: "FhirInteger",
  string: "FhirString",
  decimal: "FhirDecimal",
  uri: "FhirUri",
  url: "FhirUrl",
  canonical: "FhirCanonical",
  base64Binary: "FhirBase64Binary",
  instant: "FhirInstant",
  date: "FhirDate",
  dateTime: "FhirDateTime",
  time: "FhirTime",
  code: "FhirCode",
  oid: "FhirOid",
  id: "FhirId",
  markdown: "FhirMarkdown",
  unsignedInt: "FhirUnsignedInt",
  positiveInt: "FhirPositiveInt",
  uuid: "FhirUuid",
  xhtml: "FhirXhtml",
  integer64: "integer64",
};

const FHIR_COMPLEX_TO_TS: Record<string, string> = {
  HumanName: "HumanName",
  Address: "Address",
  ContactPoint: "ContactPoint",
  Identifier: "Identifier",
  CodeableConcept: "CodeableConcept",
  Coding: "Coding",
  Quantity: "Quantity",
  Range: "Range",
  Ratio: "Ratio",
  Period: "Period",
  Attachment: "Attachment",
  Annotation: "Annotation",
  Narrative: "Narrative",
  Meta: "Meta",
  Reference: "Reference",
  Extension: "Extension",
  Duration: "Duration",
  Age: "Age",
  SampledData: "SampledData",
  Timing: "Timing",
  Dosage: "Dosage",
  BackboneElement: "BackboneElement",
  Element: "Element",
  SimpleQuantity: "SimpleQuantity",
  Money: "Money",
  ContactDetail: "ContactDetail",
  UsageContext: "UsageContext",
  RelatedArtifact: "RelatedArtifact",
  Expression: "Expression",
  DataRequirement: "DataRequirement",
  TriggerDefinition: "TriggerDefinition",
  Signature: "Signature",
  Distance: "Distance",
  Contributor: "Contributor",
  ParameterDefinition: "ParameterDefinition",
  Population: "Population",
  ProdCharacteristic: "ProdCharacteristic",
  ProductShelfLife: "ProductShelfLife",
  MarketingStatus: "MarketingStatus",
  ElementDefinition: "ElementDefinition",
  Count: "Count",
  SubstanceAmount: "SubstanceAmount",
  CodeableReference: "CodeableReference",
  RatioRange: "RatioRange",
  Availability: "Availability",
  ExtendedContactDetail: "ExtendedContactDetail",
  VirtualServiceDetail: "VirtualServiceDetail",
  MonetaryComponent: "MonetaryComponent",
  RelativeTime: "RelativeTime",
  DosageDetails: "DosageDetails",
};

const FHIR_SEARCH_PARAM_TYPE_TO_TS: Record<string, string> = {
  string: "StringParam",
  token: "TokenParam",
  date: "DateParam",
  reference: "ReferenceParam",
  quantity: "QuantityParam",
  number: "NumberParam",
  uri: "UriParam",
  composite: "CompositeParam",
  special: "SpecialParam",
};

export function fhirPrimitiveToTs(fhirType: string): string | undefined {
  return FHIR_PRIMITIVE_TO_TS[fhirType];
}

export function fhirComplexToTs(fhirType: string): string | undefined {
  return FHIR_COMPLEX_TO_TS[fhirType];
}

export function fhirTypeToTs(fhirType: string): string {
  return FHIR_PRIMITIVE_TO_TS[fhirType] ?? FHIR_COMPLEX_TO_TS[fhirType] ?? fhirType;
}

export function isPrimitive(fhirType: string): boolean {
  return fhirType in FHIR_PRIMITIVE_TO_TS;
}

export function isComplexType(fhirType: string): boolean {
  return fhirType in FHIR_COMPLEX_TO_TS;
}

export function searchParamTypeToTs(paramType: string): string {
  return FHIR_SEARCH_PARAM_TYPE_TO_TS[paramType] ?? "SpecialParam";
}

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

export function searchParamTypeToTs(paramType: string): string {
  return FHIR_SEARCH_PARAM_TYPE_TO_TS[paramType] ?? "SpecialParam";
}

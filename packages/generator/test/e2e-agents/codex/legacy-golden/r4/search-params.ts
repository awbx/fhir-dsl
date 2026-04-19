import type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam } from "./search-param-types.js";
export type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam };

/** Search params common to every FHIR resource. */
export interface CommonSearchParams {
  "_id": TokenParam;
  "_lastUpdated": DateParam;
  "_tag": TokenParam;
  "_security": TokenParam;
  "_source": UriParam;
  "_profile": UriParam;
  "_filter": StringParam;
  "_text": StringParam;
  "_content": StringParam;
  "_list": StringParam;
}

export interface ObservationSearchParams extends CommonSearchParams {
  "status": TokenParam;
  "subject": ReferenceParam;
}

export interface PatientSearchParams extends CommonSearchParams {
  "gender": TokenParam;
  "name": StringParam;
}


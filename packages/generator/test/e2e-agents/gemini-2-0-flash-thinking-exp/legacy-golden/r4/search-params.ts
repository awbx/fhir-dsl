import type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam } from "./search-param-types.js";
export type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam };

export interface ObservationSearchParams {
  "status": TokenParam;
  "subject": ReferenceParam;
}

export interface PatientSearchParams {
  "gender": TokenParam;
  "name": StringParam;
}


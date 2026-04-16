import type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam } from "./search-param-types.js";
export type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam };
import type { AdministrativeGender, ObservationStatus } from "./terminology/valuesets.js";

export interface ObservationSearchParams {
  "status": TokenParam<ObservationStatus>;
  "subject": ReferenceParam;
}

export interface PatientSearchParams {
  "gender": TokenParam<AdministrativeGender>;
  "name": StringParam;
}


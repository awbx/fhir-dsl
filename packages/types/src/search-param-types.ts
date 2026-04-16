export interface StringParam {
  type: "string";
  value: string;
}

export interface TokenParam {
  type: "token";
  value: string;
}

export interface DateParam {
  type: "date";
  value: string;
}

export interface ReferenceParam {
  type: "reference";
  value: string;
}

export interface QuantityParam {
  type: "quantity";
  value: string;
}

export interface NumberParam {
  type: "number";
  value: number | string;
}

export interface UriParam {
  type: "uri";
  value: string;
}

export interface CompositeParam<
  C extends Record<string, { type: string; value: string | number }> = Record<
    string,
    { type: string; value: string | number }
  >,
> {
  type: "composite";
  value: string;
  components: C;
}

export interface SpecialParam {
  type: "special";
  value: string;
}

export type SearchParam =
  | StringParam
  | TokenParam
  | DateParam
  | ReferenceParam
  | QuantityParam
  | NumberParam
  | UriParam
  | CompositeParam
  | SpecialParam;

declare const __fhirBrand: unique symbol;
interface Marker<K extends string> { readonly [__fhirBrand]?: K; }

export type FhirBase64Binary = string & Marker<"base64Binary">;
export type FhirBoolean = boolean;
export type FhirCanonical = string & Marker<"canonical">;
export type FhirCode<T extends string = string> = T;
export type FhirDate = string & Marker<"date">;
export type FhirDateTime = string & Marker<"dateTime">;
export type FhirDecimal = number;
export type FhirId = string & Marker<"id">;
export type FhirInstant = string & Marker<"instant">;
export type FhirInteger = number;
export type FhirMarkdown = string & Marker<"markdown">;
export type FhirOid = string & Marker<"oid">;
export type FhirPositiveInt = number & Marker<"positiveInt">;
export type FhirString = string;
export type FhirTime = string & Marker<"time">;
export type FhirUnsignedInt = number & Marker<"unsignedInt">;
export type FhirUri = string & Marker<"uri">;
export type FhirUrl = string & Marker<"url">;
export type FhirUuid = string & Marker<"uuid">;
export type FhirXhtml = string & Marker<"xhtml">;

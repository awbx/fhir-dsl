// Branded FHIR primitives.
//
// Each primitive is `string` (or `number`) intersected with an optional
// brand carrying its FHIR primitive name. The brand is **advisory**:
//
// - String literals still assign to the typed field (no breaking change
//   for resource construction).
// - Hover/intellisense shows the FHIR intent (`FhirDate` not `string`).
// - Runtime validation lives in `./parse.ts` (`parseDate`, `parseUri`,
//   etc.) — opt in for verified-correct paths.
// - The brand symbol is intentionally optional so existing fixtures
//   keep type-checking; tooling that wants strict round-tripping can
//   strip the optional and require smart constructors.

declare const __fhirBrand: unique symbol;

interface Marker<K extends string> {
  readonly [__fhirBrand]?: K;
}

export type FhirString = string;
export type FhirBoolean = boolean;
export type FhirInteger = number;
export type FhirDecimal = number;

export type FhirDate = string & Marker<"date">;
export type FhirDateTime = string & Marker<"dateTime">;
export type FhirInstant = string & Marker<"instant">;
export type FhirTime = string & Marker<"time">;
export type FhirPositiveInt = number & Marker<"positiveInt">;
export type FhirUnsignedInt = number & Marker<"unsignedInt">;
export type FhirCode<T extends string = string> = T;
export type FhirUri = string & Marker<"uri">;
export type FhirUrl = string & Marker<"url">;
export type FhirCanonical = string & Marker<"canonical">;
export type FhirId = string & Marker<"id">;
export type FhirOid = string & Marker<"oid">;
export type FhirUuid = string & Marker<"uuid">;
export type FhirMarkdown = string & Marker<"markdown">;
export type FhirBase64Binary = string & Marker<"base64Binary">;
export type FhirXhtml = string & Marker<"xhtml">;

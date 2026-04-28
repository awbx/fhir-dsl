// Smart constructors for FHIR primitives.
//
// Each `parseX` validates the input against the FHIR spec's primitive
// regex (subset where useful — full regexes are quoted in comments) and
// returns the branded type on success, `undefined` on failure.
//
// Use these at boundaries where you receive untrusted strings (HTTP,
// disk, user input). For literal assignment in code, the optional brand
// in `primitives.ts` lets string literals through without a cast.

import type {
  FhirBase64Binary,
  FhirCanonical,
  FhirDate,
  FhirDateTime,
  FhirId,
  FhirInstant,
  FhirOid,
  FhirPositiveInt,
  FhirTime,
  FhirUnsignedInt,
  FhirUri,
  FhirUrl,
  FhirUuid,
} from "./primitives.js";

// FHIR `date` regex: YYYY | YYYY-MM | YYYY-MM-DD
const DATE_RE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2]\d|3[0-1]))?)?$/;

// FHIR `dateTime` regex: date | date'T'hh:mm:ss(.sss)?(Z|±hh:mm)
const DATETIME_RE =
  /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2]\d|3[0-1])(T([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d))?)?)?$/;

// FHIR `instant` regex: full datetime with seconds + tz, no partial dates
const INSTANT_RE =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])T([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;

// FHIR `time` regex: hh:mm:ss(.sss)?
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?$/;

// FHIR `id` regex: 1-64 chars of [A-Za-z0-9-.]
const ID_RE = /^[A-Za-z0-9\-.]{1,64}$/;

// FHIR `oid` URN form: urn:oid:1.2.3...
const OID_RE = /^urn:oid:[0-2](\.(0|[1-9]\d*))+$/;

// FHIR `uuid` URN form: urn:uuid:8-4-4-4-12 hex
const UUID_RE = /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Permissive base64 — FHIR allows whitespace; require valid alphabet plus
// optional padding.
const BASE64_RE = /^[A-Za-z0-9+/\s]*={0,2}$/;

// Minimal URI / URL — must contain a scheme separator. Full RFC 3986
// validation is intentionally avoided; we only catch obvious typos.
const URI_RE = /^[A-Za-z][A-Za-z0-9+.-]*:[\s\S]+$/;

const URL_RE = /^[A-Za-z][A-Za-z0-9+.-]*:\/\/[\s\S]+$/;

export function parseDate(value: string): FhirDate | undefined {
  return DATE_RE.test(value) ? (value as FhirDate) : undefined;
}

export function parseDateTime(value: string): FhirDateTime | undefined {
  return DATETIME_RE.test(value) ? (value as FhirDateTime) : undefined;
}

export function parseInstant(value: string): FhirInstant | undefined {
  return INSTANT_RE.test(value) ? (value as FhirInstant) : undefined;
}

export function parseTime(value: string): FhirTime | undefined {
  return TIME_RE.test(value) ? (value as FhirTime) : undefined;
}

export function parseId(value: string): FhirId | undefined {
  return ID_RE.test(value) ? (value as FhirId) : undefined;
}

export function parseOid(value: string): FhirOid | undefined {
  return OID_RE.test(value) ? (value as FhirOid) : undefined;
}

export function parseUuid(value: string): FhirUuid | undefined {
  return UUID_RE.test(value) ? (value as FhirUuid) : undefined;
}

export function parseUri(value: string): FhirUri | undefined {
  return URI_RE.test(value) ? (value as FhirUri) : undefined;
}

export function parseUrl(value: string): FhirUrl | undefined {
  return URL_RE.test(value) ? (value as FhirUrl) : undefined;
}

export function parseCanonical(value: string): FhirCanonical | undefined {
  // Canonical is a URI plus optional `|version` suffix.
  const head = value.split("|")[0] ?? value;
  return URI_RE.test(head) ? (value as FhirCanonical) : undefined;
}

export function parseBase64Binary(value: string): FhirBase64Binary | undefined {
  if (!BASE64_RE.test(value)) return undefined;
  const stripped = value.replace(/\s+/g, "");
  // Length without padding must be a multiple of 4.
  return stripped.length % 4 === 0 ? (value as FhirBase64Binary) : undefined;
}

export function parsePositiveInt(value: number): FhirPositiveInt | undefined {
  return Number.isInteger(value) && value > 0 ? (value as FhirPositiveInt) : undefined;
}

export function parseUnsignedInt(value: number): FhirUnsignedInt | undefined {
  return Number.isInteger(value) && value >= 0 ? (value as FhirUnsignedInt) : undefined;
}

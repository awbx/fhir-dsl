import type { BackboneElement, Identifier, Resource, Signature } from "../datatypes.js";
import type { FhirCode, FhirDecimal, FhirInstant, FhirString, FhirUnsignedInt, FhirUri } from "../primitives.js";

export interface BundleLink extends BackboneElement {
  relation: FhirString;
  url: FhirUri;
}

export interface BundleEntrySearch extends BackboneElement {
  mode?: FhirCode;
  score?: FhirDecimal;
}

export interface BundleEntryRequest extends BackboneElement {
  method: FhirCode;
  url: FhirUri;
  ifNoneMatch?: FhirString;
  ifModifiedSince?: FhirInstant;
  ifMatch?: FhirString;
  ifNoneExist?: FhirString;
}

export interface BundleEntryResponse extends BackboneElement {
  status: FhirString;
  location?: FhirUri;
  etag?: FhirString;
  lastModified?: FhirInstant;
  outcome?: Resource;
}

export interface BundleEntry extends BackboneElement {
  link?: BundleLink[];
  fullUrl?: FhirUri;
  resource?: Resource;
  search?: BundleEntrySearch;
  request?: BundleEntryRequest;
  response?: BundleEntryResponse;
}

export interface Bundle extends Resource {
  resourceType: "Bundle";
  identifier?: Identifier;
  type: FhirCode;
  timestamp?: FhirInstant;
  total?: FhirUnsignedInt;
  link?: BundleLink[];
  entry?: BundleEntry[];
  signature?: Signature;
}

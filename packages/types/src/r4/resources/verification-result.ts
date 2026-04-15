import type { FhirCode, FhirDate, FhirDateTime, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Reference, Signature, Timing } from "../datatypes.js";

export interface VerificationResultPrimarySource extends BackboneElement {
  who?: Reference<"Organization" | "Practitioner" | "PractitionerRole">;
  type?: CodeableConcept[];
  communicationMethod?: CodeableConcept[];
  validationStatus?: CodeableConcept;
  validationDate?: FhirDateTime;
  canPushUpdates?: CodeableConcept;
  pushTypeAvailable?: CodeableConcept[];
}

export interface VerificationResultAttestation extends BackboneElement {
  who?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  onBehalfOf?: Reference<"Organization" | "Practitioner" | "PractitionerRole">;
  communicationMethod?: CodeableConcept;
  date?: FhirDate;
  sourceIdentityCertificate?: FhirString;
  proxyIdentityCertificate?: FhirString;
  proxySignature?: Signature;
  sourceSignature?: Signature;
}

export interface VerificationResultValidator extends BackboneElement {
  organization: Reference<"Organization">;
  identityCertificate?: FhirString;
  attestationSignature?: Signature;
}

export interface VerificationResult extends DomainResource {
  resourceType: "VerificationResult";
  target?: Reference<"Resource">[];
  targetLocation?: FhirString[];
  need?: CodeableConcept;
  status: FhirCode;
  statusDate?: FhirDateTime;
  validationType?: CodeableConcept;
  validationProcess?: CodeableConcept[];
  frequency?: Timing;
  lastPerformed?: FhirDateTime;
  nextScheduled?: FhirDate;
  failureAction?: CodeableConcept;
  primarySource?: VerificationResultPrimarySource[];
  attestation?: VerificationResultAttestation;
  validator?: VerificationResultValidator[];
}

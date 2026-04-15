import type { Attachment, BackboneElement, CodeableConcept, DomainResource, Identifier } from "../datatypes.js";
import type { FhirInteger, FhirString } from "../primitives.js";

export interface SubstanceProteinSubunit extends BackboneElement {
  subunit?: FhirInteger;
  sequence?: FhirString;
  length?: FhirInteger;
  sequenceAttachment?: Attachment;
  nTerminalModificationId?: Identifier;
  nTerminalModification?: FhirString;
  cTerminalModificationId?: Identifier;
  cTerminalModification?: FhirString;
}

export interface SubstanceProtein extends DomainResource {
  resourceType: "SubstanceProtein";
  sequenceType?: CodeableConcept;
  numberOfSubunits?: FhirInteger;
  disulfideLinkage?: FhirString[];
  subunit?: SubstanceProteinSubunit[];
}

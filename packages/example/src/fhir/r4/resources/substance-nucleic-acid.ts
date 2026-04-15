import type { FhirInteger, FhirString } from "../primitives.js";
import type { Attachment, BackboneElement, CodeableConcept, DomainResource, Identifier } from "../datatypes.js";

export interface SubstanceNucleicAcidSubunitLinkage extends BackboneElement {
  connectivity?: FhirString;
  identifier?: Identifier;
  name?: FhirString;
  residueSite?: FhirString;
}

export interface SubstanceNucleicAcidSubunitSugar extends BackboneElement {
  identifier?: Identifier;
  name?: FhirString;
  residueSite?: FhirString;
}

export interface SubstanceNucleicAcidSubunit extends BackboneElement {
  subunit?: FhirInteger;
  sequence?: FhirString;
  length?: FhirInteger;
  sequenceAttachment?: Attachment;
  fivePrime?: CodeableConcept;
  threePrime?: CodeableConcept;
  linkage?: SubstanceNucleicAcidSubunitLinkage[];
  sugar?: SubstanceNucleicAcidSubunitSugar[];
}

export interface SubstanceNucleicAcid extends DomainResource {
  resourceType: "SubstanceNucleicAcid";
  sequenceType?: CodeableConcept;
  numberOfSubunits?: FhirInteger;
  areaOfHybridisation?: FhirString;
  oligoNucleotideType?: CodeableConcept;
  subunit?: SubstanceNucleicAcidSubunit[];
}

import type { FhirBoolean, FhirInteger, FhirString } from "../primitives.js";
import type { Attachment, BackboneElement, CodeableConcept, DomainResource, SubstanceAmount } from "../datatypes.js";

export interface SubstancePolymerMonomerSetStartingMaterial extends BackboneElement {
  material?: CodeableConcept;
  type?: CodeableConcept;
  isDefining?: FhirBoolean;
  amount?: SubstanceAmount;
}

export interface SubstancePolymerMonomerSet extends BackboneElement {
  ratioType?: CodeableConcept;
  startingMaterial?: SubstancePolymerMonomerSetStartingMaterial[];
}

export interface SubstancePolymerRepeatRepeatUnitDegreeOfPolymerisation extends BackboneElement {
  degree?: CodeableConcept;
  amount?: SubstanceAmount;
}

export interface SubstancePolymerRepeatRepeatUnitStructuralRepresentation extends BackboneElement {
  type?: CodeableConcept;
  representation?: FhirString;
  attachment?: Attachment;
}

export interface SubstancePolymerRepeatRepeatUnit extends BackboneElement {
  orientationOfPolymerisation?: CodeableConcept;
  repeatUnit?: FhirString;
  amount?: SubstanceAmount;
  degreeOfPolymerisation?: SubstancePolymerRepeatRepeatUnitDegreeOfPolymerisation[];
  structuralRepresentation?: SubstancePolymerRepeatRepeatUnitStructuralRepresentation[];
}

export interface SubstancePolymerRepeat extends BackboneElement {
  numberOfUnits?: FhirInteger;
  averageMolecularFormula?: FhirString;
  repeatUnitAmountType?: CodeableConcept;
  repeatUnit?: SubstancePolymerRepeatRepeatUnit[];
}

export interface SubstancePolymer extends DomainResource {
  resourceType: "SubstancePolymer";
  class?: CodeableConcept;
  geometry?: CodeableConcept;
  copolymerConnectivity?: CodeableConcept[];
  modification?: FhirString[];
  monomerSet?: SubstancePolymerMonomerSet[];
  repeat?: SubstancePolymerRepeat[];
}

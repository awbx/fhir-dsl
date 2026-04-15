import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Quantity,
} from "../datatypes.js";
import type { FhirBoolean, FhirInteger, FhirString } from "../primitives.js";

export interface SubstancePolymerMonomerSetStartingMaterial extends BackboneElement {
  code?: CodeableConcept;
  category?: CodeableConcept;
  isDefining?: FhirBoolean;
  amount?: Quantity;
}

export interface SubstancePolymerMonomerSet extends BackboneElement {
  ratioType?: CodeableConcept;
  startingMaterial?: SubstancePolymerMonomerSetStartingMaterial[];
}

export interface SubstancePolymerRepeatRepeatUnitDegreeOfPolymerisation extends BackboneElement {
  type?: CodeableConcept;
  average?: FhirInteger;
  low?: FhirInteger;
  high?: FhirInteger;
}

export interface SubstancePolymerRepeatRepeatUnitStructuralRepresentation extends BackboneElement {
  type?: CodeableConcept;
  representation?: FhirString;
  format?: CodeableConcept;
  attachment?: Attachment;
}

export interface SubstancePolymerRepeatRepeatUnit extends BackboneElement {
  unit?: FhirString;
  orientation?: CodeableConcept;
  amount?: FhirInteger;
  degreeOfPolymerisation?: SubstancePolymerRepeatRepeatUnitDegreeOfPolymerisation[];
  structuralRepresentation?: SubstancePolymerRepeatRepeatUnitStructuralRepresentation[];
}

export interface SubstancePolymerRepeat extends BackboneElement {
  averageMolecularFormula?: FhirString;
  repeatUnitAmountType?: CodeableConcept;
  repeatUnit?: SubstancePolymerRepeatRepeatUnit[];
}

export interface SubstancePolymer extends DomainResource {
  resourceType: "SubstancePolymer";
  identifier?: Identifier;
  class?: CodeableConcept;
  geometry?: CodeableConcept;
  copolymerConnectivity?: CodeableConcept[];
  modification?: FhirString;
  monomerSet?: SubstancePolymerMonomerSet[];
  repeat?: SubstancePolymerRepeat[];
}

import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Quantity,
  Range,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirDateTime, FhirString } from "../primitives.js";

export interface SubstanceSpecificationMoiety extends BackboneElement {
  role?: CodeableConcept;
  identifier?: Identifier;
  name?: FhirString;
  stereochemistry?: CodeableConcept;
  opticalActivity?: CodeableConcept;
  molecularFormula?: FhirString;
  amountQuantity?: Quantity;
  amountString?: FhirString;
}

export interface SubstanceSpecificationProperty extends BackboneElement {
  category?: CodeableConcept;
  code?: CodeableConcept;
  parameters?: FhirString;
  definingSubstanceReference?: Reference<"SubstanceSpecification" | "Substance">;
  definingSubstanceCodeableConcept?: CodeableConcept;
  amountQuantity?: Quantity;
  amountString?: FhirString;
}

export interface SubstanceSpecificationStructureIsotopeMolecularWeight extends BackboneElement {
  method?: CodeableConcept;
  type?: CodeableConcept;
  amount?: Quantity;
}

export interface SubstanceSpecificationStructureIsotope extends BackboneElement {
  identifier?: Identifier;
  name?: CodeableConcept;
  substitution?: CodeableConcept;
  halfLife?: Quantity;
  molecularWeight?: SubstanceSpecificationStructureIsotopeMolecularWeight;
}

export interface SubstanceSpecificationStructureRepresentation extends BackboneElement {
  type?: CodeableConcept;
  representation?: FhirString;
  attachment?: Attachment;
}

export interface SubstanceSpecificationStructure extends BackboneElement {
  stereochemistry?: CodeableConcept;
  opticalActivity?: CodeableConcept;
  molecularFormula?: FhirString;
  molecularFormulaByMoiety?: FhirString;
  isotope?: SubstanceSpecificationStructureIsotope[];
  molecularWeight?: SubstanceSpecificationStructureIsotopeMolecularWeight;
  source?: Reference<"DocumentReference">[];
  representation?: SubstanceSpecificationStructureRepresentation[];
}

export interface SubstanceSpecificationCode extends BackboneElement {
  code?: CodeableConcept;
  status?: CodeableConcept;
  statusDate?: FhirDateTime;
  comment?: FhirString;
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceSpecificationNameOfficial extends BackboneElement {
  authority?: CodeableConcept;
  status?: CodeableConcept;
  date?: FhirDateTime;
}

export interface SubstanceSpecificationName extends BackboneElement {
  name: FhirString;
  type?: CodeableConcept;
  status?: CodeableConcept;
  preferred?: FhirBoolean;
  language?: CodeableConcept[];
  domain?: CodeableConcept[];
  jurisdiction?: CodeableConcept[];
  synonym?: SubstanceSpecificationName[];
  translation?: SubstanceSpecificationName[];
  official?: SubstanceSpecificationNameOfficial[];
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceSpecificationRelationship extends BackboneElement {
  substanceReference?: Reference<"SubstanceSpecification">;
  substanceCodeableConcept?: CodeableConcept;
  relationship?: CodeableConcept;
  isDefining?: FhirBoolean;
  amountQuantity?: Quantity;
  amountRange?: Range;
  amountRatio?: Ratio;
  amountString?: FhirString;
  amountRatioLowLimit?: Ratio;
  amountType?: CodeableConcept;
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceSpecification extends DomainResource {
  resourceType: "SubstanceSpecification";
  identifier?: Identifier;
  type?: CodeableConcept;
  status?: CodeableConcept;
  domain?: CodeableConcept;
  description?: FhirString;
  source?: Reference<"DocumentReference">[];
  comment?: FhirString;
  moiety?: SubstanceSpecificationMoiety[];
  property?: SubstanceSpecificationProperty[];
  referenceInformation?: Reference<"SubstanceReferenceInformation">;
  structure?: SubstanceSpecificationStructure;
  code?: SubstanceSpecificationCode[];
  name?: SubstanceSpecificationName[];
  molecularWeight?: SubstanceSpecificationStructureIsotopeMolecularWeight[];
  relationship?: SubstanceSpecificationRelationship[];
  nucleicAcid?: Reference<"SubstanceNucleicAcid">;
  polymer?: Reference<"SubstancePolymer">;
  protein?: Reference<"SubstanceProtein">;
  sourceMaterial?: Reference<"SubstanceSourceMaterial">;
}

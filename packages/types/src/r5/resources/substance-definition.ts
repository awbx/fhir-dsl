import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Quantity,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirDate, FhirDateTime, FhirMarkdown, FhirString } from "../primitives.js";

export interface SubstanceDefinitionMoiety extends BackboneElement {
  role?: CodeableConcept;
  identifier?: Identifier;
  name?: FhirString;
  stereochemistry?: CodeableConcept;
  opticalActivity?: CodeableConcept;
  molecularFormula?: FhirString;
  amountQuantity?: Quantity;
  amountString?: FhirString;
  measurementType?: CodeableConcept;
}

export interface SubstanceDefinitionCharacterization extends BackboneElement {
  technique?: CodeableConcept;
  form?: CodeableConcept;
  description?: FhirMarkdown;
  file?: Attachment[];
}

export interface SubstanceDefinitionProperty extends BackboneElement {
  type: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueDate?: FhirDate;
  valueBoolean?: FhirBoolean;
  valueAttachment?: Attachment;
}

export interface SubstanceDefinitionMolecularWeight extends BackboneElement {
  method?: CodeableConcept;
  type?: CodeableConcept;
  amount: Quantity;
}

export interface SubstanceDefinitionStructureRepresentation extends BackboneElement {
  type?: CodeableConcept;
  representation?: FhirString;
  format?: CodeableConcept;
  document?: Reference<"DocumentReference">;
}

export interface SubstanceDefinitionStructure extends BackboneElement {
  stereochemistry?: CodeableConcept;
  opticalActivity?: CodeableConcept;
  molecularFormula?: FhirString;
  molecularFormulaByMoiety?: FhirString;
  molecularWeight?: SubstanceDefinitionMolecularWeight;
  technique?: CodeableConcept[];
  sourceDocument?: Reference<"DocumentReference">[];
  representation?: SubstanceDefinitionStructureRepresentation[];
}

export interface SubstanceDefinitionCode extends BackboneElement {
  code?: CodeableConcept;
  status?: CodeableConcept;
  statusDate?: FhirDateTime;
  note?: Annotation[];
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceDefinitionNameOfficial extends BackboneElement {
  authority?: CodeableConcept;
  status?: CodeableConcept;
  date?: FhirDateTime;
}

export interface SubstanceDefinitionName extends BackboneElement {
  name: FhirString;
  type?: CodeableConcept;
  status?: CodeableConcept;
  preferred?: FhirBoolean;
  language?: CodeableConcept[];
  domain?: CodeableConcept[];
  jurisdiction?: CodeableConcept[];
  synonym?: SubstanceDefinitionName[];
  translation?: SubstanceDefinitionName[];
  official?: SubstanceDefinitionNameOfficial[];
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceDefinitionRelationship extends BackboneElement {
  substanceDefinitionReference?: Reference<"SubstanceDefinition">;
  substanceDefinitionCodeableConcept?: CodeableConcept;
  type: CodeableConcept;
  isDefining?: FhirBoolean;
  amountQuantity?: Quantity;
  amountRatio?: Ratio;
  amountString?: FhirString;
  ratioHighLimitAmount?: Ratio;
  comparator?: CodeableConcept;
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceDefinitionSourceMaterial extends BackboneElement {
  type?: CodeableConcept;
  genus?: CodeableConcept;
  species?: CodeableConcept;
  part?: CodeableConcept;
  countryOfOrigin?: CodeableConcept[];
}

export interface SubstanceDefinition extends DomainResource {
  resourceType: "SubstanceDefinition";
  identifier?: Identifier[];
  version?: FhirString;
  status?: CodeableConcept;
  classification?: CodeableConcept[];
  domain?: CodeableConcept;
  grade?: CodeableConcept[];
  description?: FhirMarkdown;
  informationSource?: Reference<"Citation">[];
  note?: Annotation[];
  manufacturer?: Reference<"Organization">[];
  supplier?: Reference<"Organization">[];
  moiety?: SubstanceDefinitionMoiety[];
  characterization?: SubstanceDefinitionCharacterization[];
  property?: SubstanceDefinitionProperty[];
  referenceInformation?: Reference<"SubstanceReferenceInformation">;
  molecularWeight?: SubstanceDefinitionMolecularWeight[];
  structure?: SubstanceDefinitionStructure;
  code?: SubstanceDefinitionCode[];
  name?: SubstanceDefinitionName[];
  relationship?: SubstanceDefinitionRelationship[];
  nucleicAcid?: Reference<"SubstanceNucleicAcid">;
  polymer?: Reference<"SubstancePolymer">;
  protein?: Reference<"SubstanceProtein">;
  sourceMaterial?: SubstanceDefinitionSourceMaterial;
}

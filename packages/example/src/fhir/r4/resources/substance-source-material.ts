import type { BackboneElement, CodeableConcept, DomainResource, Identifier } from "../datatypes.js";
import type { FhirString } from "../primitives.js";

export interface SubstanceSourceMaterialFractionDescription extends BackboneElement {
  fraction?: FhirString;
  materialType?: CodeableConcept;
}

export interface SubstanceSourceMaterialOrganismAuthor extends BackboneElement {
  authorType?: CodeableConcept;
  authorDescription?: FhirString;
}

export interface SubstanceSourceMaterialOrganismHybrid extends BackboneElement {
  maternalOrganismId?: FhirString;
  maternalOrganismName?: FhirString;
  paternalOrganismId?: FhirString;
  paternalOrganismName?: FhirString;
  hybridType?: CodeableConcept;
}

export interface SubstanceSourceMaterialOrganismOrganismGeneral extends BackboneElement {
  kingdom?: CodeableConcept;
  phylum?: CodeableConcept;
  class?: CodeableConcept;
  order?: CodeableConcept;
}

export interface SubstanceSourceMaterialOrganism extends BackboneElement {
  family?: CodeableConcept;
  genus?: CodeableConcept;
  species?: CodeableConcept;
  intraspecificType?: CodeableConcept;
  intraspecificDescription?: FhirString;
  author?: SubstanceSourceMaterialOrganismAuthor[];
  hybrid?: SubstanceSourceMaterialOrganismHybrid;
  organismGeneral?: SubstanceSourceMaterialOrganismOrganismGeneral;
}

export interface SubstanceSourceMaterialPartDescription extends BackboneElement {
  part?: CodeableConcept;
  partLocation?: CodeableConcept;
}

export interface SubstanceSourceMaterial extends DomainResource {
  resourceType: "SubstanceSourceMaterial";
  sourceMaterialClass?: CodeableConcept;
  sourceMaterialType?: CodeableConcept;
  sourceMaterialState?: CodeableConcept;
  organismId?: Identifier;
  organismName?: FhirString;
  parentSubstanceId?: Identifier[];
  parentSubstanceName?: FhirString[];
  countryOfOrigin?: CodeableConcept[];
  geographicalLocation?: FhirString[];
  developmentStage?: CodeableConcept;
  fractionDescription?: SubstanceSourceMaterialFractionDescription[];
  organism?: SubstanceSourceMaterialOrganism;
  partDescription?: SubstanceSourceMaterialPartDescription[];
}

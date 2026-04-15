import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Quantity,
  Range,
  Reference,
} from "../datatypes.js";
import type { FhirString } from "../primitives.js";

export interface SubstanceReferenceInformationGene extends BackboneElement {
  geneSequenceOrigin?: CodeableConcept;
  gene?: CodeableConcept;
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceReferenceInformationGeneElement extends BackboneElement {
  type?: CodeableConcept;
  element?: Identifier;
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceReferenceInformationTarget extends BackboneElement {
  target?: Identifier;
  type?: CodeableConcept;
  interaction?: CodeableConcept;
  organism?: CodeableConcept;
  organismType?: CodeableConcept;
  amountQuantity?: Quantity;
  amountRange?: Range;
  amountString?: FhirString;
  amountType?: CodeableConcept;
  source?: Reference<"DocumentReference">[];
}

export interface SubstanceReferenceInformation extends DomainResource {
  resourceType: "SubstanceReferenceInformation";
  comment?: FhirString;
  gene?: SubstanceReferenceInformationGene[];
  geneElement?: SubstanceReferenceInformationGeneElement[];
  target?: SubstanceReferenceInformationTarget[];
}

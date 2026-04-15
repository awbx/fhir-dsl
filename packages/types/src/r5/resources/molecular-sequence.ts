import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Range,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirInteger, FhirString } from "../primitives.js";

export interface MolecularSequenceRelativeStartingSequence extends BackboneElement {
  genomeAssembly?: CodeableConcept;
  chromosome?: CodeableConcept;
  sequenceCodeableConcept?: CodeableConcept;
  sequenceString?: FhirString;
  sequenceReference?: Reference<"MolecularSequence">;
  windowStart?: FhirInteger;
  windowEnd?: FhirInteger;
  orientation?: FhirCode;
  strand?: FhirCode;
}

export interface MolecularSequenceRelativeEdit extends BackboneElement {
  start?: FhirInteger;
  end?: FhirInteger;
  replacementSequence?: FhirString;
  replacedSequence?: FhirString;
}

export interface MolecularSequenceRelative extends BackboneElement {
  coordinateSystem: CodeableConcept;
  ordinalPosition?: FhirInteger;
  sequenceRange?: Range;
  startingSequence?: MolecularSequenceRelativeStartingSequence;
  edit?: MolecularSequenceRelativeEdit[];
}

export interface MolecularSequence extends DomainResource {
  resourceType: "MolecularSequence";
  identifier?: Identifier[];
  type?: FhirCode;
  subject?: Reference<"Patient" | "Group" | "Substance" | "BiologicallyDerivedProduct" | "NutritionProduct">;
  focus?: Reference<"Resource">[];
  specimen?: Reference<"Specimen">;
  device?: Reference<"Device">;
  performer?: Reference<"Organization">;
  literal?: FhirString;
  formatted?: Attachment[];
  relative?: MolecularSequenceRelative[];
}

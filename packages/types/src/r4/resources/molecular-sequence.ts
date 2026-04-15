import type { FhirBoolean, FhirCode, FhirDecimal, FhirInteger, FhirString, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Quantity, Reference } from "../datatypes.js";

export interface MolecularSequenceReferenceSeq extends BackboneElement {
  chromosome?: CodeableConcept;
  genomeBuild?: FhirString;
  orientation?: FhirCode;
  referenceSeqId?: CodeableConcept;
  referenceSeqPointer?: Reference<"MolecularSequence">;
  referenceSeqString?: FhirString;
  strand?: FhirCode;
  windowStart?: FhirInteger;
  windowEnd?: FhirInteger;
}

export interface MolecularSequenceVariant extends BackboneElement {
  start?: FhirInteger;
  end?: FhirInteger;
  observedAllele?: FhirString;
  referenceAllele?: FhirString;
  cigar?: FhirString;
  variantPointer?: Reference<"Observation">;
}

export interface MolecularSequenceQualityRoc extends BackboneElement {
  score?: FhirInteger[];
  numTP?: FhirInteger[];
  numFP?: FhirInteger[];
  numFN?: FhirInteger[];
  precision?: FhirDecimal[];
  sensitivity?: FhirDecimal[];
  fMeasure?: FhirDecimal[];
}

export interface MolecularSequenceQuality extends BackboneElement {
  type: FhirCode;
  standardSequence?: CodeableConcept;
  start?: FhirInteger;
  end?: FhirInteger;
  score?: Quantity;
  method?: CodeableConcept;
  truthTP?: FhirDecimal;
  queryTP?: FhirDecimal;
  truthFN?: FhirDecimal;
  queryFP?: FhirDecimal;
  gtFP?: FhirDecimal;
  precision?: FhirDecimal;
  recall?: FhirDecimal;
  fScore?: FhirDecimal;
  roc?: MolecularSequenceQualityRoc;
}

export interface MolecularSequenceRepository extends BackboneElement {
  type: FhirCode;
  url?: FhirUri;
  name?: FhirString;
  datasetId?: FhirString;
  variantsetId?: FhirString;
  readsetId?: FhirString;
}

export interface MolecularSequenceStructureVariantOuter extends BackboneElement {
  start?: FhirInteger;
  end?: FhirInteger;
}

export interface MolecularSequenceStructureVariantInner extends BackboneElement {
  start?: FhirInteger;
  end?: FhirInteger;
}

export interface MolecularSequenceStructureVariant extends BackboneElement {
  variantType?: CodeableConcept;
  exact?: FhirBoolean;
  length?: FhirInteger;
  outer?: MolecularSequenceStructureVariantOuter;
  inner?: MolecularSequenceStructureVariantInner;
}

export interface MolecularSequence extends DomainResource {
  resourceType: "MolecularSequence";
  identifier?: Identifier[];
  type?: FhirCode;
  coordinateSystem: FhirInteger;
  patient?: Reference<"Patient">;
  specimen?: Reference<"Specimen">;
  device?: Reference<"Device">;
  performer?: Reference<"Organization">;
  quantity?: Quantity;
  referenceSeq?: MolecularSequenceReferenceSeq;
  variant?: MolecularSequenceVariant[];
  observedSeq?: FhirString;
  quality?: MolecularSequenceQuality[];
  readCoverage?: FhirInteger;
  repository?: MolecularSequenceRepository[];
  pointer?: Reference<"MolecularSequence">[];
  structureVariant?: MolecularSequenceStructureVariant[];
}

import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirMarkdown } from "../primitives.js";

export interface BodyStructureIncludedStructureBodyLandmarkOrientationDistanceFromLandmark extends BackboneElement {
  device?: CodeableReference[];
  value?: Quantity[];
}

export interface BodyStructureIncludedStructureBodyLandmarkOrientation extends BackboneElement {
  landmarkDescription?: CodeableConcept[];
  clockFacePosition?: CodeableConcept[];
  distanceFromLandmark?: BodyStructureIncludedStructureBodyLandmarkOrientationDistanceFromLandmark[];
  surfaceOrientation?: CodeableConcept[];
}

export interface BodyStructureIncludedStructure extends BackboneElement {
  structure: CodeableConcept;
  laterality?: CodeableConcept;
  bodyLandmarkOrientation?: BodyStructureIncludedStructureBodyLandmarkOrientation[];
  spatialReference?: Reference<"ImagingSelection">[];
  qualifier?: CodeableConcept[];
}

export interface BodyStructure extends DomainResource {
  resourceType: "BodyStructure";
  identifier?: Identifier[];
  active?: FhirBoolean;
  morphology?: CodeableConcept;
  includedStructure: BodyStructureIncludedStructure[];
  excludedStructure?: BodyStructureIncludedStructure[];
  description?: FhirMarkdown;
  image?: Attachment[];
  patient: Reference<"Patient">;
}

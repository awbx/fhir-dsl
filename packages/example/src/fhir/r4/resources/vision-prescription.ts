import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirDecimal, FhirInteger, FhirString } from "../primitives.js";

export interface VisionPrescriptionLensSpecificationPrism extends BackboneElement {
  amount: FhirDecimal;
  base: FhirCode;
}

export interface VisionPrescriptionLensSpecification extends BackboneElement {
  product: CodeableConcept;
  eye: FhirCode;
  sphere?: FhirDecimal;
  cylinder?: FhirDecimal;
  axis?: FhirInteger;
  prism?: VisionPrescriptionLensSpecificationPrism[];
  add?: FhirDecimal;
  power?: FhirDecimal;
  backCurve?: FhirDecimal;
  diameter?: FhirDecimal;
  duration?: Quantity;
  color?: FhirString;
  brand?: FhirString;
  note?: Annotation[];
}

export interface VisionPrescription extends DomainResource {
  resourceType: "VisionPrescription";
  identifier?: Identifier[];
  status: FhirCode;
  created: FhirDateTime;
  patient: Reference<"Patient">;
  encounter?: Reference<"Encounter">;
  dateWritten: FhirDateTime;
  prescriber: Reference<"Practitioner" | "PractitionerRole">;
  lensSpecification: VisionPrescriptionLensSpecification[];
}

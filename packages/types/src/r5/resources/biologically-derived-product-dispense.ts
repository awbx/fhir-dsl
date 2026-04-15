import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface BiologicallyDerivedProductDispensePerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<"Practitioner">;
}

export interface BiologicallyDerivedProductDispense extends DomainResource {
  resourceType: "BiologicallyDerivedProductDispense";
  identifier?: Identifier[];
  basedOn?: Reference<"ServiceRequest">[];
  partOf?: Reference<"BiologicallyDerivedProductDispense">[];
  status: FhirCode;
  originRelationshipType?: CodeableConcept;
  product: Reference<"BiologicallyDerivedProduct">;
  patient: Reference<"Patient">;
  matchStatus?: CodeableConcept;
  performer?: BiologicallyDerivedProductDispensePerformer[];
  location?: Reference<"Location">;
  quantity?: Quantity;
  preparedDate?: FhirDateTime;
  whenHandedOver?: FhirDateTime;
  destination?: Reference<"Location">;
  note?: Annotation[];
  usageInstruction?: FhirString;
}

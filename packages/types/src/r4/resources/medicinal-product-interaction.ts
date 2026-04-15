import type { FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Reference } from "../datatypes.js";

export interface MedicinalProductInteractionInteractant extends BackboneElement {
  itemReference?: Reference<"MedicinalProduct" | "Medication" | "Substance" | "ObservationDefinition">;
  itemCodeableConcept?: CodeableConcept;
}

export interface MedicinalProductInteraction extends DomainResource {
  resourceType: "MedicinalProductInteraction";
  subject?: Reference<"MedicinalProduct" | "Medication" | "Substance">[];
  description?: FhirString;
  interactant?: MedicinalProductInteractionInteractant[];
  type?: CodeableConcept;
  effect?: CodeableConcept;
  incidence?: CodeableConcept;
  management?: CodeableConcept;
}

import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Duration,
  Identifier,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface SpecimenCollection extends BackboneElement {
  collector?: Reference<"Practitioner" | "PractitionerRole">;
  collectedDateTime?: FhirDateTime;
  collectedPeriod?: Period;
  duration?: Duration;
  quantity?: Quantity;
  method?: CodeableConcept;
  bodySite?: CodeableConcept;
  fastingStatusCodeableConcept?: CodeableConcept;
  fastingStatusDuration?: Duration;
}

export interface SpecimenProcessing extends BackboneElement {
  description?: FhirString;
  procedure?: CodeableConcept;
  additive?: Reference<"Substance">[];
  timeDateTime?: FhirDateTime;
  timePeriod?: Period;
}

export interface SpecimenContainer extends BackboneElement {
  identifier?: Identifier[];
  description?: FhirString;
  type?: CodeableConcept;
  capacity?: Quantity;
  specimenQuantity?: Quantity;
  additiveCodeableConcept?: CodeableConcept;
  additiveReference?: Reference<"Substance">;
}

export interface Specimen extends DomainResource {
  resourceType: "Specimen";
  identifier?: Identifier[];
  accessionIdentifier?: Identifier;
  status?: FhirCode;
  type?: CodeableConcept;
  subject?: Reference<"Patient" | "Group" | "Device" | "Substance" | "Location">;
  receivedTime?: FhirDateTime;
  parent?: Reference<"Specimen">[];
  request?: Reference<"ServiceRequest">[];
  collection?: SpecimenCollection;
  processing?: SpecimenProcessing[];
  container?: SpecimenContainer[];
  condition?: CodeableConcept[];
  note?: Annotation[];
}

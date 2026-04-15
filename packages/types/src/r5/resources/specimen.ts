import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Duration,
  Identifier,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface SpecimenFeature extends BackboneElement {
  type: CodeableConcept;
  description: FhirString;
}

export interface SpecimenCollection extends BackboneElement {
  collector?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson">;
  collectedDateTime?: FhirDateTime;
  collectedPeriod?: Period;
  duration?: Duration;
  quantity?: Quantity;
  method?: CodeableConcept;
  device?: CodeableReference;
  procedure?: Reference<"Procedure">;
  bodySite?: CodeableReference;
  fastingStatusCodeableConcept?: CodeableConcept;
  fastingStatusDuration?: Duration;
}

export interface SpecimenProcessing extends BackboneElement {
  description?: FhirString;
  method?: CodeableConcept;
  additive?: Reference<"Substance">[];
  timeDateTime?: FhirDateTime;
  timePeriod?: Period;
}

export interface SpecimenContainer extends BackboneElement {
  device: Reference<"Device">;
  location?: Reference<"Location">;
  specimenQuantity?: Quantity;
}

export interface Specimen extends DomainResource {
  resourceType: "Specimen";
  identifier?: Identifier[];
  accessionIdentifier?: Identifier;
  status?: FhirCode;
  type?: CodeableConcept;
  subject?: Reference<"Patient" | "Group" | "Device" | "BiologicallyDerivedProduct" | "Substance" | "Location">;
  receivedTime?: FhirDateTime;
  parent?: Reference<"Specimen">[];
  request?: Reference<"ServiceRequest">[];
  combined?: FhirCode;
  role?: CodeableConcept[];
  feature?: SpecimenFeature[];
  collection?: SpecimenCollection;
  processing?: SpecimenProcessing[];
  container?: SpecimenContainer[];
  condition?: CodeableConcept[];
  note?: Annotation[];
}

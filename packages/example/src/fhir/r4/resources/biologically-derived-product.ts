import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirDecimal, FhirInteger, FhirString } from "../primitives.js";

export interface BiologicallyDerivedProductCollection extends BackboneElement {
  collector?: Reference<"Practitioner" | "PractitionerRole">;
  source?: Reference<"Patient" | "Organization">;
  collectedDateTime?: FhirDateTime;
  collectedPeriod?: Period;
}

export interface BiologicallyDerivedProductProcessing extends BackboneElement {
  description?: FhirString;
  procedure?: CodeableConcept;
  additive?: Reference<"Substance">;
  timeDateTime?: FhirDateTime;
  timePeriod?: Period;
}

export interface BiologicallyDerivedProductManipulation extends BackboneElement {
  description?: FhirString;
  timeDateTime?: FhirDateTime;
  timePeriod?: Period;
}

export interface BiologicallyDerivedProductStorage extends BackboneElement {
  description?: FhirString;
  temperature?: FhirDecimal;
  scale?: FhirCode;
  duration?: Period;
}

export interface BiologicallyDerivedProduct extends DomainResource {
  resourceType: "BiologicallyDerivedProduct";
  identifier?: Identifier[];
  productCategory?: FhirCode;
  productCode?: CodeableConcept;
  status?: FhirCode;
  request?: Reference<"ServiceRequest">[];
  quantity?: FhirInteger;
  parent?: Reference<"BiologicallyDerivedProduct">[];
  collection?: BiologicallyDerivedProductCollection;
  processing?: BiologicallyDerivedProductProcessing[];
  manipulation?: BiologicallyDerivedProductManipulation;
  storage?: BiologicallyDerivedProductStorage[];
}

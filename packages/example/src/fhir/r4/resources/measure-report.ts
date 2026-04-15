import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirInteger } from "../primitives.js";

export interface MeasureReportGroupPopulation extends BackboneElement {
  code?: CodeableConcept;
  count?: FhirInteger;
  subjectResults?: Reference<"List">;
}

export interface MeasureReportGroupStratifierStratumComponent extends BackboneElement {
  code: CodeableConcept;
  value: CodeableConcept;
}

export interface MeasureReportGroupStratifierStratumPopulation extends BackboneElement {
  code?: CodeableConcept;
  count?: FhirInteger;
  subjectResults?: Reference<"List">;
}

export interface MeasureReportGroupStratifierStratum extends BackboneElement {
  value?: CodeableConcept;
  component?: MeasureReportGroupStratifierStratumComponent[];
  population?: MeasureReportGroupStratifierStratumPopulation[];
  measureScore?: Quantity;
}

export interface MeasureReportGroupStratifier extends BackboneElement {
  code?: CodeableConcept[];
  stratum?: MeasureReportGroupStratifierStratum[];
}

export interface MeasureReportGroup extends BackboneElement {
  code?: CodeableConcept;
  population?: MeasureReportGroupPopulation[];
  measureScore?: Quantity;
  stratifier?: MeasureReportGroupStratifier[];
}

export interface MeasureReport extends DomainResource {
  resourceType: "MeasureReport";
  identifier?: Identifier[];
  status: FhirCode;
  type: FhirCode;
  measure: FhirCanonical;
  subject?: Reference<
    "Patient" | "Practitioner" | "PractitionerRole" | "Location" | "Device" | "RelatedPerson" | "Group"
  >;
  date?: FhirDateTime;
  reporter?: Reference<"Practitioner" | "PractitionerRole" | "Location" | "Organization">;
  period: Period;
  improvementNotation?: CodeableConcept;
  group?: MeasureReportGroup[];
  evaluatedResource?: Reference<"Resource">[];
}

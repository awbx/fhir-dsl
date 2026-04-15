import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Duration,
  Identifier,
  Period,
  Quantity,
  Range,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirInteger, FhirString } from "../primitives.js";

export interface MeasureReportGroupPopulation extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  count?: FhirInteger;
  subjectResults?: Reference<"List">;
  subjectReport?: Reference<"MeasureReport">[];
  subjects?: Reference<"Group">;
}

export interface MeasureReportGroupStratifierStratumComponent extends BackboneElement {
  linkId?: FhirString;
  code: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueBoolean?: FhirBoolean;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueReference?: Reference;
}

export interface MeasureReportGroupStratifierStratumPopulation extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  count?: FhirInteger;
  subjectResults?: Reference<"List">;
  subjectReport?: Reference<"MeasureReport">[];
  subjects?: Reference<"Group">;
}

export interface MeasureReportGroupStratifierStratum extends BackboneElement {
  valueCodeableConcept?: CodeableConcept;
  valueBoolean?: FhirBoolean;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueReference?: Reference;
  component?: MeasureReportGroupStratifierStratumComponent[];
  population?: MeasureReportGroupStratifierStratumPopulation[];
  measureScoreQuantity?: Quantity;
  measureScoreDateTime?: FhirDateTime;
  measureScoreCodeableConcept?: CodeableConcept;
  measureScorePeriod?: Period;
  measureScoreRange?: Range;
  measureScoreDuration?: Duration;
}

export interface MeasureReportGroupStratifier extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  stratum?: MeasureReportGroupStratifierStratum[];
}

export interface MeasureReportGroup extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  subject?: Reference<
    | "CareTeam"
    | "Device"
    | "Group"
    | "HealthcareService"
    | "Location"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
  >;
  population?: MeasureReportGroupPopulation[];
  measureScoreQuantity?: Quantity;
  measureScoreDateTime?: FhirDateTime;
  measureScoreCodeableConcept?: CodeableConcept;
  measureScorePeriod?: Period;
  measureScoreRange?: Range;
  measureScoreDuration?: Duration;
  stratifier?: MeasureReportGroupStratifier[];
}

export interface MeasureReport extends DomainResource {
  resourceType: "MeasureReport";
  identifier?: Identifier[];
  status: FhirCode;
  type: FhirCode;
  dataUpdateType?: FhirCode;
  measure?: FhirCanonical;
  subject?: Reference<
    | "CareTeam"
    | "Device"
    | "Group"
    | "HealthcareService"
    | "Location"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
  >;
  date?: FhirDateTime;
  reporter?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Group">;
  reportingVendor?: Reference<"Organization">;
  location?: Reference<"Location">;
  period: Period;
  inputParameters?: Reference<"Parameters">;
  scoring?: CodeableConcept;
  improvementNotation?: CodeableConcept;
  group?: MeasureReportGroup[];
  supplementalData?: Reference<"Resource">[];
  evaluatedResource?: Reference<"Resource">[];
}

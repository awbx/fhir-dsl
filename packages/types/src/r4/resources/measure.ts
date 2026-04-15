import type { FhirBoolean, FhirCanonical, FhirCode, FhirDate, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, ContactDetail, DomainResource, Expression, Identifier, Period, Reference, RelatedArtifact, UsageContext } from "../datatypes.js";

export interface MeasureGroupPopulation extends BackboneElement {
  code?: CodeableConcept;
  description?: FhirString;
  criteria: Expression;
}

export interface MeasureGroupStratifierComponent extends BackboneElement {
  code?: CodeableConcept;
  description?: FhirString;
  criteria: Expression;
}

export interface MeasureGroupStratifier extends BackboneElement {
  code?: CodeableConcept;
  description?: FhirString;
  criteria?: Expression;
  component?: MeasureGroupStratifierComponent[];
}

export interface MeasureGroup extends BackboneElement {
  code?: CodeableConcept;
  description?: FhirString;
  population?: MeasureGroupPopulation[];
  stratifier?: MeasureGroupStratifier[];
}

export interface MeasureSupplementalData extends BackboneElement {
  code?: CodeableConcept;
  usage?: CodeableConcept[];
  description?: FhirString;
  criteria: Expression;
}

export interface Measure extends DomainResource {
  resourceType: "Measure";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirString;
  copyright?: FhirMarkdown;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  topic?: CodeableConcept[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  library?: FhirCanonical[];
  disclaimer?: FhirMarkdown;
  scoring?: CodeableConcept;
  compositeScoring?: CodeableConcept;
  type?: CodeableConcept[];
  riskAdjustment?: FhirString;
  rateAggregation?: FhirString;
  rationale?: FhirMarkdown;
  clinicalRecommendationStatement?: FhirMarkdown;
  improvementNotation?: CodeableConcept;
  definition?: FhirMarkdown[];
  guidance?: FhirMarkdown;
  group?: MeasureGroup[];
  supplementalData?: MeasureSupplementalData[];
}

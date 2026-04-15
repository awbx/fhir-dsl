import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Expression,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface MeasureTerm extends BackboneElement {
  code?: CodeableConcept;
  definition?: FhirMarkdown;
}

export interface MeasureGroupPopulation extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  description?: FhirMarkdown;
  criteria?: Expression;
  groupDefinition?: Reference<"Group">;
  inputPopulationId?: FhirString;
  aggregateMethod?: CodeableConcept;
}

export interface MeasureGroupStratifierComponent extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  description?: FhirMarkdown;
  criteria?: Expression;
  groupDefinition?: Reference<"Group">;
}

export interface MeasureGroupStratifier extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  description?: FhirMarkdown;
  criteria?: Expression;
  groupDefinition?: Reference<"Group">;
  component?: MeasureGroupStratifierComponent[];
}

export interface MeasureGroup extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  description?: FhirMarkdown;
  type?: CodeableConcept[];
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  basis?: FhirCode;
  scoring?: CodeableConcept;
  scoringUnit?: CodeableConcept;
  rateAggregation?: FhirMarkdown;
  improvementNotation?: CodeableConcept;
  library?: FhirCanonical[];
  population?: MeasureGroupPopulation[];
  stratifier?: MeasureGroupStratifier[];
}

export interface MeasureSupplementalData extends BackboneElement {
  linkId?: FhirString;
  code?: CodeableConcept;
  usage?: CodeableConcept[];
  description?: FhirMarkdown;
  criteria: Expression;
}

export interface Measure extends DomainResource {
  resourceType: "Measure";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  basis?: FhirCode;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
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
  scoringUnit?: CodeableConcept;
  compositeScoring?: CodeableConcept;
  type?: CodeableConcept[];
  riskAdjustment?: FhirMarkdown;
  rateAggregation?: FhirMarkdown;
  rationale?: FhirMarkdown;
  clinicalRecommendationStatement?: FhirMarkdown;
  improvementNotation?: CodeableConcept;
  term?: MeasureTerm[];
  guidance?: FhirMarkdown;
  group?: MeasureGroup[];
  supplementalData?: MeasureSupplementalData[];
}

import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Range,
  Reference,
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

export interface ObservationDefinitionQualifiedValue extends BackboneElement {
  context?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  gender?: FhirCode;
  age?: Range;
  gestationalAge?: Range;
  condition?: FhirString;
  rangeCategory?: FhirCode;
  range?: Range;
  validCodedValueSet?: FhirCanonical;
  normalCodedValueSet?: FhirCanonical;
  abnormalCodedValueSet?: FhirCanonical;
  criticalCodedValueSet?: FhirCanonical;
}

export interface ObservationDefinitionComponent extends BackboneElement {
  code: CodeableConcept;
  permittedDataType?: FhirCode[];
  permittedUnit?: Coding[];
  qualifiedValue?: ObservationDefinitionQualifiedValue[];
}

export interface ObservationDefinition extends DomainResource {
  resourceType: "ObservationDefinition";
  url?: FhirUri;
  identifier?: Identifier;
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  derivedFromCanonical?: FhirCanonical[];
  derivedFromUri?: FhirUri[];
  subject?: CodeableConcept[];
  performerType?: CodeableConcept;
  category?: CodeableConcept[];
  code: CodeableConcept;
  permittedDataType?: FhirCode[];
  multipleResultsAllowed?: FhirBoolean;
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  specimen?: Reference<"SpecimenDefinition">[];
  device?: Reference<"DeviceDefinition" | "Device">[];
  preferredReportName?: FhirString;
  permittedUnit?: Coding[];
  qualifiedValue?: ObservationDefinitionQualifiedValue[];
  hasMember?: Reference<"ObservationDefinition" | "Questionnaire">[];
  component?: ObservationDefinitionComponent[];
}

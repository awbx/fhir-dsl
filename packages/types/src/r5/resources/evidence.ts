import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Quantity,
  Range,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirMarkdown,
  FhirString,
  FhirUnsignedInt,
  FhirUri,
} from "../primitives.js";

export interface EvidenceVariableDefinition extends BackboneElement {
  description?: FhirMarkdown;
  note?: Annotation[];
  variableRole: CodeableConcept;
  observed?: Reference<"Group" | "EvidenceVariable">;
  intended?: Reference<"Group" | "EvidenceVariable">;
  directnessMatch?: CodeableConcept;
}

export interface EvidenceStatisticSampleSize extends BackboneElement {
  description?: FhirMarkdown;
  note?: Annotation[];
  numberOfStudies?: FhirUnsignedInt;
  numberOfParticipants?: FhirUnsignedInt;
  knownDataCount?: FhirUnsignedInt;
}

export interface EvidenceStatisticAttributeEstimate extends BackboneElement {
  description?: FhirMarkdown;
  note?: Annotation[];
  type?: CodeableConcept;
  quantity?: Quantity;
  level?: FhirDecimal;
  range?: Range;
  attributeEstimate?: EvidenceStatisticAttributeEstimate[];
}

export interface EvidenceStatisticModelCharacteristicVariable extends BackboneElement {
  variableDefinition: Reference<"Group" | "EvidenceVariable">;
  handling?: FhirCode;
  valueCategory?: CodeableConcept[];
  valueQuantity?: Quantity[];
  valueRange?: Range[];
}

export interface EvidenceStatisticModelCharacteristic extends BackboneElement {
  code: CodeableConcept;
  value?: Quantity;
  variable?: EvidenceStatisticModelCharacteristicVariable[];
  attributeEstimate?: EvidenceStatisticAttributeEstimate[];
}

export interface EvidenceStatistic extends BackboneElement {
  description?: FhirMarkdown;
  note?: Annotation[];
  statisticType?: CodeableConcept;
  category?: CodeableConcept;
  quantity?: Quantity;
  numberOfEvents?: FhirUnsignedInt;
  numberAffected?: FhirUnsignedInt;
  sampleSize?: EvidenceStatisticSampleSize;
  attributeEstimate?: EvidenceStatisticAttributeEstimate[];
  modelCharacteristic?: EvidenceStatisticModelCharacteristic[];
}

export interface EvidenceCertainty extends BackboneElement {
  description?: FhirMarkdown;
  note?: Annotation[];
  type?: CodeableConcept;
  rating?: CodeableConcept;
  rater?: FhirString;
  subcomponent?: EvidenceCertainty[];
}

export interface Evidence extends DomainResource {
  resourceType: "Evidence";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  citeAsReference?: Reference<"Citation">;
  citeAsMarkdown?: FhirMarkdown;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  publisher?: FhirString;
  contact?: ContactDetail[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  useContext?: UsageContext[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  relatedArtifact?: RelatedArtifact[];
  description?: FhirMarkdown;
  assertion?: FhirMarkdown;
  note?: Annotation[];
  variableDefinition: EvidenceVariableDefinition[];
  synthesisType?: CodeableConcept;
  studyDesign?: CodeableConcept[];
  statistic?: EvidenceStatistic[];
  certainty?: EvidenceCertainty[];
}

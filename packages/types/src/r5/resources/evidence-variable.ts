import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Expression,
  Identifier,
  Period,
  Quantity,
  Range,
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
  FhirId,
  FhirMarkdown,
  FhirPositiveInt,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface EvidenceVariableCharacteristicDefinitionByTypeAndValue extends BackboneElement {
  type: CodeableConcept;
  method?: CodeableConcept[];
  device?: Reference<"Device" | "DeviceMetric">;
  valueCodeableConcept?: CodeableConcept;
  valueBoolean?: FhirBoolean;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueReference?: Reference;
  valueId?: FhirId;
  offset?: CodeableConcept;
}

export interface EvidenceVariableCharacteristicDefinitionByCombination extends BackboneElement {
  code: FhirCode;
  threshold?: FhirPositiveInt;
  characteristic: EvidenceVariableCharacteristic[];
}

export interface EvidenceVariableCharacteristicTimeFromEvent extends BackboneElement {
  description?: FhirMarkdown;
  note?: Annotation[];
  eventCodeableConcept?: CodeableConcept;
  eventReference?: Reference;
  eventDateTime?: FhirDateTime;
  eventId?: FhirId;
  quantity?: Quantity;
  range?: Range;
}

export interface EvidenceVariableCharacteristic extends BackboneElement {
  linkId?: FhirId;
  description?: FhirMarkdown;
  note?: Annotation[];
  exclude?: FhirBoolean;
  definitionReference?: Reference<"EvidenceVariable" | "Group" | "Evidence">;
  definitionCanonical?: FhirCanonical;
  definitionCodeableConcept?: CodeableConcept;
  definitionExpression?: Expression;
  definitionId?: FhirId;
  definitionByTypeAndValue?: EvidenceVariableCharacteristicDefinitionByTypeAndValue;
  definitionByCombination?: EvidenceVariableCharacteristicDefinitionByCombination;
  instancesQuantity?: Quantity;
  instancesRange?: Range;
  durationQuantity?: Quantity;
  durationRange?: Range;
  timeFromEvent?: EvidenceVariableCharacteristicTimeFromEvent[];
}

export interface EvidenceVariableCategory extends BackboneElement {
  name?: FhirString;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: Range;
}

export interface EvidenceVariable extends DomainResource {
  resourceType: "EvidenceVariable";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  shortTitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  note?: Annotation[];
  useContext?: UsageContext[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  actual?: FhirBoolean;
  characteristic?: EvidenceVariableCharacteristic[];
  handling?: FhirCode;
  category?: EvidenceVariableCategory[];
}

import type { FhirBoolean, FhirCanonical, FhirCode, FhirDate, FhirDateTime, FhirDecimal, FhirInteger, FhirMarkdown, FhirString, FhirTime, FhirUri } from "../primitives.js";
import type { Attachment, BackboneElement, CodeableConcept, Coding, ContactDetail, DomainResource, Identifier, Period, Quantity, Reference, UsageContext } from "../datatypes.js";

export interface QuestionnaireItemEnableWhen extends BackboneElement {
  question: FhirString;
  operator: FhirCode;
  answerBoolean?: FhirBoolean;
  answerDecimal?: FhirDecimal;
  answerInteger?: FhirInteger;
  answerDate?: FhirDate;
  answerDateTime?: FhirDateTime;
  answerTime?: FhirTime;
  answerString?: FhirString;
  answerCoding?: Coding;
  answerQuantity?: Quantity;
  answerReference?: Reference<"Resource">;
}

export interface QuestionnaireItemAnswerOption extends BackboneElement {
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueTime?: FhirTime;
  valueString?: FhirString;
  valueCoding?: Coding;
  valueReference?: Reference<"Resource">;
  initialSelected?: FhirBoolean;
}

export interface QuestionnaireItemInitial extends BackboneElement {
  valueBoolean?: FhirBoolean;
  valueDecimal?: FhirDecimal;
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueDateTime?: FhirDateTime;
  valueTime?: FhirTime;
  valueString?: FhirString;
  valueUri?: FhirUri;
  valueAttachment?: Attachment;
  valueCoding?: Coding;
  valueQuantity?: Quantity;
  valueReference?: Reference<"Resource">;
}

export interface QuestionnaireItem extends BackboneElement {
  linkId: FhirString;
  definition?: FhirUri;
  code?: Coding[];
  prefix?: FhirString;
  text?: FhirString;
  type: FhirCode;
  enableWhen?: QuestionnaireItemEnableWhen[];
  enableBehavior?: FhirCode;
  required?: FhirBoolean;
  repeats?: FhirBoolean;
  readOnly?: FhirBoolean;
  maxLength?: FhirInteger;
  answerValueSet?: FhirCanonical;
  answerOption?: QuestionnaireItemAnswerOption[];
  initial?: QuestionnaireItemInitial[];
  item?: QuestionnaireItem[];
}

export interface Questionnaire extends DomainResource {
  resourceType: "Questionnaire";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  derivedFrom?: FhirCanonical[];
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectType?: FhirCode[];
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  code?: Coding[];
  item?: QuestionnaireItem[];
}

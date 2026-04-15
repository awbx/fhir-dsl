import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
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

export interface SubscriptionTopicResourceTriggerQueryCriteria extends BackboneElement {
  previous?: FhirString;
  resultForCreate?: FhirCode;
  current?: FhirString;
  resultForDelete?: FhirCode;
  requireBoth?: FhirBoolean;
}

export interface SubscriptionTopicResourceTrigger extends BackboneElement {
  description?: FhirMarkdown;
  resource: FhirUri;
  supportedInteraction?: FhirCode[];
  queryCriteria?: SubscriptionTopicResourceTriggerQueryCriteria;
  fhirPathCriteria?: FhirString;
}

export interface SubscriptionTopicEventTrigger extends BackboneElement {
  description?: FhirMarkdown;
  event: CodeableConcept;
  resource: FhirUri;
}

export interface SubscriptionTopicCanFilterBy extends BackboneElement {
  description?: FhirMarkdown;
  resource?: FhirUri;
  filterParameter: FhirString;
  filterDefinition?: FhirUri;
  comparator?: FhirCode[];
  modifier?: FhirCode[];
}

export interface SubscriptionTopicNotificationShape extends BackboneElement {
  resource: FhirUri;
  include?: FhirString[];
  revInclude?: FhirString[];
}

export interface SubscriptionTopic extends DomainResource {
  resourceType: "SubscriptionTopic";
  url: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  derivedFrom?: FhirCanonical[];
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
  resourceTrigger?: SubscriptionTopicResourceTrigger[];
  eventTrigger?: SubscriptionTopicEventTrigger[];
  canFilterBy?: SubscriptionTopicCanFilterBy[];
  notificationShape?: SubscriptionTopicNotificationShape[];
}

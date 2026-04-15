import type {
  CompositeParam,
  DateParam,
  NumberParam,
  QuantityParam,
  ReferenceParam,
  SpecialParam,
  StringParam,
  TokenParam,
  UriParam,
} from "./search-param-types.js";

export type {
  CompositeParam,
  DateParam,
  NumberParam,
  QuantityParam,
  ReferenceParam,
  SpecialParam,
  StringParam,
  TokenParam,
  UriParam,
};

export interface AccountSearchParams {
  guarantor: ReferenceParam;
  identifier: TokenParam;
  name: StringParam;
  owner: ReferenceParam;
  patient: ReferenceParam;
  period: DateParam;
  relatedaccount: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
}

export interface ActivityDefinitionSearchParams {
  "composed-of": ReferenceParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "depends-on": ReferenceParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  kind: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  successor: ReferenceParam;
  title: StringParam;
  topic: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface ActorDefinitionSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  type: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface AdministrableProductDefinitionSearchParams {
  device: ReferenceParam;
  "dose-form": TokenParam;
  "form-of": ReferenceParam;
  identifier: TokenParam;
  ingredient: TokenParam;
  "manufactured-item": ReferenceParam;
  route: TokenParam;
  status: TokenParam;
  "target-species": TokenParam;
}

export interface AdverseEventSearchParams {
  actuality: TokenParam;
  category: TokenParam;
  code: TokenParam;
  date: DateParam;
  identifier: TokenParam;
  location: ReferenceParam;
  patient: ReferenceParam;
  recorder: ReferenceParam;
  resultingeffect: ReferenceParam;
  seriousness: TokenParam;
  status: TokenParam;
  study: ReferenceParam;
  subject: ReferenceParam;
  substance: ReferenceParam;
}

export interface AllergyIntoleranceSearchParams {
  category: TokenParam;
  "clinical-status": TokenParam;
  code: TokenParam;
  criticality: TokenParam;
  date: DateParam;
  identifier: TokenParam;
  "last-date": DateParam;
  "manifestation-code": TokenParam;
  "manifestation-reference": ReferenceParam;
  participant: ReferenceParam;
  patient: ReferenceParam;
  route: TokenParam;
  severity: TokenParam;
  type: TokenParam;
  "verification-status": TokenParam;
}

export interface AppointmentSearchParams {
  actor: ReferenceParam;
  "appointment-type": TokenParam;
  "based-on": ReferenceParam;
  date: DateParam;
  group: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  "part-status": TokenParam;
  patient: ReferenceParam;
  practitioner: ReferenceParam;
  "reason-code": TokenParam;
  "reason-reference": ReferenceParam;
  "requested-period": DateParam;
  "service-category": TokenParam;
  "service-type": TokenParam;
  "service-type-reference": ReferenceParam;
  slot: ReferenceParam;
  specialty: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
  "supporting-info": ReferenceParam;
}

export interface AppointmentResponseSearchParams {
  actor: ReferenceParam;
  appointment: ReferenceParam;
  group: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  "part-status": TokenParam;
  patient: ReferenceParam;
  practitioner: ReferenceParam;
}

export interface ArtifactAssessmentSearchParams {
  date: DateParam;
  identifier: TokenParam;
}

export interface AuditEventSearchParams {
  action: TokenParam;
  agent: ReferenceParam;
  "agent-role": TokenParam;
  "based-on": ReferenceParam;
  category: TokenParam;
  code: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  entity: ReferenceParam;
  "entity-role": TokenParam;
  outcome: TokenParam;
  patient: ReferenceParam;
  policy: UriParam;
  purpose: TokenParam;
  source: ReferenceParam;
}

export interface BasicSearchParams {
  author: ReferenceParam;
  code: TokenParam;
  created: DateParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  subject: ReferenceParam;
}

export interface BiologicallyDerivedProductSearchParams {
  "biological-source-event": TokenParam;
  code: TokenParam;
  collector: ReferenceParam;
  identifier: TokenParam;
  "product-category": TokenParam;
  "product-status": TokenParam;
  request: ReferenceParam;
  "serial-number": TokenParam;
}

export interface BiologicallyDerivedProductDispenseSearchParams {
  identifier: TokenParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  product: ReferenceParam;
  status: TokenParam;
}

export interface BodyStructureSearchParams {
  excluded_structure: TokenParam;
  identifier: TokenParam;
  included_structure: TokenParam;
  morphology: TokenParam;
  patient: ReferenceParam;
}

export interface BundleSearchParams {
  composition: ReferenceParam;
  identifier: TokenParam;
  message: ReferenceParam;
  timestamp: DateParam;
  type: TokenParam;
}

export interface CapabilityStatementSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  fhirversion: TokenParam;
  format: TokenParam;
  guide: ReferenceParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  mode: TokenParam;
  name: StringParam;
  publisher: StringParam;
  resource: TokenParam;
  "resource-profile": ReferenceParam;
  "security-service": TokenParam;
  software: StringParam;
  status: TokenParam;
  "supported-profile": ReferenceParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface CarePlanSearchParams {
  "activity-reference": ReferenceParam;
  "based-on": ReferenceParam;
  "care-team": ReferenceParam;
  category: TokenParam;
  condition: ReferenceParam;
  custodian: ReferenceParam;
  date: DateParam;
  encounter: ReferenceParam;
  goal: ReferenceParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  intent: TokenParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  replaces: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface CareTeamSearchParams {
  category: TokenParam;
  date: DateParam;
  identifier: TokenParam;
  name: StringParam;
  participant: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface ChargeItemSearchParams {
  account: ReferenceParam;
  code: TokenParam;
  encounter: ReferenceParam;
  "entered-date": DateParam;
  enterer: ReferenceParam;
  "factor-override": NumberParam;
  identifier: TokenParam;
  occurrence: DateParam;
  patient: ReferenceParam;
  "performer-actor": ReferenceParam;
  "performer-function": TokenParam;
  "performing-organization": ReferenceParam;
  "price-override": QuantityParam;
  quantity: QuantityParam;
  "requesting-organization": ReferenceParam;
  service: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface ChargeItemDefinitionSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface CitationSearchParams {
  classification: CompositeParam;
  "classification-type": TokenParam;
  classifier: TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface ClaimSearchParams {
  "care-team": ReferenceParam;
  created: DateParam;
  "detail-udi": ReferenceParam;
  encounter: ReferenceParam;
  enterer: ReferenceParam;
  facility: ReferenceParam;
  identifier: TokenParam;
  insurer: ReferenceParam;
  "item-udi": ReferenceParam;
  patient: ReferenceParam;
  payee: ReferenceParam;
  priority: TokenParam;
  "procedure-udi": ReferenceParam;
  provider: ReferenceParam;
  status: TokenParam;
  "subdetail-udi": ReferenceParam;
  use: TokenParam;
}

export interface ClaimResponseSearchParams {
  created: DateParam;
  disposition: StringParam;
  identifier: TokenParam;
  insurer: ReferenceParam;
  outcome: TokenParam;
  patient: ReferenceParam;
  "payment-date": DateParam;
  request: ReferenceParam;
  requestor: ReferenceParam;
  status: TokenParam;
  use: TokenParam;
}

export interface ClinicalImpressionSearchParams {
  date: DateParam;
  encounter: ReferenceParam;
  "finding-code": TokenParam;
  "finding-ref": ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  previous: ReferenceParam;
  problem: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  "supporting-info": ReferenceParam;
}

export interface ClinicalUseDefinitionSearchParams {
  contraindication: TokenParam;
  "contraindication-reference": ReferenceParam;
  effect: TokenParam;
  "effect-reference": ReferenceParam;
  identifier: TokenParam;
  indication: TokenParam;
  "indication-reference": ReferenceParam;
  interaction: TokenParam;
  product: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
}

export interface CodeSystemSearchParams {
  code: TokenParam;
  "content-mode": TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  language: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  supplements: ReferenceParam;
  system: UriParam;
  title: StringParam;
  topic: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface CommunicationSearchParams {
  "based-on": ReferenceParam;
  category: TokenParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  medium: TokenParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  received: DateParam;
  recipient: ReferenceParam;
  sender: ReferenceParam;
  sent: DateParam;
  status: TokenParam;
  subject: ReferenceParam;
  topic: TokenParam;
}

export interface CommunicationRequestSearchParams {
  authored: DateParam;
  "based-on": ReferenceParam;
  category: TokenParam;
  encounter: ReferenceParam;
  "group-identifier": TokenParam;
  identifier: TokenParam;
  "information-provider": ReferenceParam;
  medium: TokenParam;
  occurrence: DateParam;
  patient: ReferenceParam;
  priority: TokenParam;
  recipient: ReferenceParam;
  replaces: ReferenceParam;
  requester: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface CompartmentDefinitionSearchParams {
  code: TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  name: StringParam;
  publisher: StringParam;
  resource: TokenParam;
  status: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface CompositionSearchParams {
  attester: ReferenceParam;
  author: ReferenceParam;
  category: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  entry: ReferenceParam;
  "event-code": TokenParam;
  "event-reference": ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  period: DateParam;
  related: ReferenceParam;
  section: TokenParam;
  "section-code-text": CompositeParam;
  "section-text": SpecialParam;
  status: TokenParam;
  subject: ReferenceParam;
  title: StringParam;
  type: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface ConceptMapSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  "mapping-property": UriParam;
  name: StringParam;
  "other-map": ReferenceParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  "source-code": TokenParam;
  "source-group-system": ReferenceParam;
  "source-scope": ReferenceParam;
  "source-scope-uri": UriParam;
  status: TokenParam;
  "target-code": TokenParam;
  "target-group-system": ReferenceParam;
  "target-scope": ReferenceParam;
  "target-scope-uri": UriParam;
  title: StringParam;
  topic: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface ConditionSearchParams {
  "abatement-age": QuantityParam;
  "abatement-date": DateParam;
  "abatement-string": StringParam;
  "body-site": TokenParam;
  category: TokenParam;
  "clinical-status": TokenParam;
  code: TokenParam;
  encounter: ReferenceParam;
  evidence: TokenParam;
  "evidence-detail": ReferenceParam;
  identifier: TokenParam;
  "onset-age": QuantityParam;
  "onset-date": DateParam;
  "onset-info": StringParam;
  "participant-actor": ReferenceParam;
  "participant-function": TokenParam;
  patient: ReferenceParam;
  "recorded-date": DateParam;
  severity: TokenParam;
  stage: TokenParam;
  subject: ReferenceParam;
  "verification-status": TokenParam;
}

export interface ConditionDefinitionSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface ConsentSearchParams {
  action: TokenParam;
  actor: ReferenceParam;
  category: TokenParam;
  controller: ReferenceParam;
  data: ReferenceParam;
  date: DateParam;
  grantee: ReferenceParam;
  identifier: TokenParam;
  manager: ReferenceParam;
  patient: ReferenceParam;
  period: DateParam;
  purpose: TokenParam;
  "security-label": TokenParam;
  "source-reference": ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  verified: TokenParam;
  "verified-date": DateParam;
}

export interface ContractSearchParams {
  authority: ReferenceParam;
  domain: ReferenceParam;
  identifier: TokenParam;
  instantiates: UriParam;
  issued: DateParam;
  patient: ReferenceParam;
  signer: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  url: UriParam;
}

export interface CoverageSearchParams {
  beneficiary: ReferenceParam;
  "class-type": TokenParam;
  "class-value": TokenParam;
  dependent: StringParam;
  identifier: TokenParam;
  insurer: ReferenceParam;
  patient: ReferenceParam;
  "paymentby-party": ReferenceParam;
  "policy-holder": ReferenceParam;
  status: TokenParam;
  subscriber: ReferenceParam;
  subscriberid: TokenParam;
  type: TokenParam;
}

export interface CoverageEligibilityRequestSearchParams {
  created: DateParam;
  enterer: ReferenceParam;
  facility: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  provider: ReferenceParam;
  status: TokenParam;
}

export interface CoverageEligibilityResponseSearchParams {
  created: DateParam;
  disposition: StringParam;
  identifier: TokenParam;
  insurer: ReferenceParam;
  outcome: TokenParam;
  patient: ReferenceParam;
  request: ReferenceParam;
  requestor: ReferenceParam;
  status: TokenParam;
}

export interface DetectedIssueSearchParams {
  author: ReferenceParam;
  category: TokenParam;
  code: TokenParam;
  identified: DateParam;
  identifier: TokenParam;
  implicated: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface DeviceSearchParams {
  "biological-source-event": TokenParam;
  code: TokenParam;
  "code-value-concept": CompositeParam;
  definition: ReferenceParam;
  "device-name": StringParam;
  "expiration-date": DateParam;
  identifier: TokenParam;
  location: ReferenceParam;
  "lot-number": StringParam;
  "manufacture-date": DateParam;
  manufacturer: StringParam;
  model: StringParam;
  organization: ReferenceParam;
  parent: ReferenceParam;
  "serial-number": StringParam;
  specification: TokenParam;
  "specification-version": CompositeParam;
  status: TokenParam;
  type: TokenParam;
  "udi-carrier": StringParam;
  "udi-di": StringParam;
  url: UriParam;
  version: StringParam;
}

export interface DeviceAssociationSearchParams {
  device: ReferenceParam;
  identifier: TokenParam;
  operator: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface DeviceDefinitionSearchParams {
  "device-name": StringParam;
  identifier: TokenParam;
  manufacturer: ReferenceParam;
  organization: ReferenceParam;
  specification: TokenParam;
  "specification-version": CompositeParam;
  type: TokenParam;
}

export interface DeviceDispenseSearchParams {
  code: TokenParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface DeviceMetricSearchParams {
  category: TokenParam;
  device: ReferenceParam;
  identifier: TokenParam;
  type: TokenParam;
}

export interface DeviceRequestSearchParams {
  "authored-on": DateParam;
  "based-on": ReferenceParam;
  code: TokenParam;
  device: ReferenceParam;
  encounter: ReferenceParam;
  "event-date": DateParam;
  "group-identifier": TokenParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  insurance: ReferenceParam;
  intent: TokenParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  "performer-code": TokenParam;
  "prior-request": ReferenceParam;
  requester: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface DeviceUsageSearchParams {
  device: TokenParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  status: TokenParam;
}

export interface DiagnosticReportSearchParams {
  "based-on": ReferenceParam;
  category: TokenParam;
  code: TokenParam;
  conclusion: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  issued: DateParam;
  media: ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  result: ReferenceParam;
  "results-interpreter": ReferenceParam;
  specimen: ReferenceParam;
  status: TokenParam;
  study: ReferenceParam;
  subject: ReferenceParam;
}

export interface DocumentReferenceSearchParams {
  attester: ReferenceParam;
  author: ReferenceParam;
  "based-on": ReferenceParam;
  bodysite: TokenParam;
  "bodysite-reference": ReferenceParam;
  category: TokenParam;
  contenttype: TokenParam;
  context: ReferenceParam;
  creation: DateParam;
  custodian: ReferenceParam;
  date: DateParam;
  description: StringParam;
  "doc-status": TokenParam;
  "event-code": TokenParam;
  "event-reference": ReferenceParam;
  facility: TokenParam;
  "format-canonical": ReferenceParam;
  "format-code": TokenParam;
  "format-uri": UriParam;
  identifier: TokenParam;
  language: TokenParam;
  location: UriParam;
  modality: TokenParam;
  patient: ReferenceParam;
  period: DateParam;
  relatesto: ReferenceParam;
  relation: TokenParam;
  relationship: CompositeParam;
  "security-label": TokenParam;
  setting: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
  version: StringParam;
}

export interface EncounterSearchParams {
  account: ReferenceParam;
  appointment: ReferenceParam;
  "based-on": ReferenceParam;
  careteam: ReferenceParam;
  class: TokenParam;
  date: DateParam;
  "date-start": DateParam;
  "diagnosis-code": TokenParam;
  "diagnosis-reference": ReferenceParam;
  "end-date": DateParam;
  "episode-of-care": ReferenceParam;
  identifier: TokenParam;
  length: QuantityParam;
  location: ReferenceParam;
  "location-period": CompositeParam;
  "part-of": ReferenceParam;
  participant: ReferenceParam;
  "participant-type": TokenParam;
  patient: ReferenceParam;
  practitioner: ReferenceParam;
  "reason-code": TokenParam;
  "reason-reference": ReferenceParam;
  "service-provider": ReferenceParam;
  "special-arrangement": TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
  "subject-status": TokenParam;
  type: TokenParam;
}

export interface EncounterHistorySearchParams {
  encounter: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface EndpointSearchParams {
  "connection-type": TokenParam;
  identifier: TokenParam;
  name: StringParam;
  organization: ReferenceParam;
  "payload-type": TokenParam;
  status: TokenParam;
}

export interface EnrollmentRequestSearchParams {
  identifier: TokenParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface EnrollmentResponseSearchParams {
  identifier: TokenParam;
  request: ReferenceParam;
  status: TokenParam;
}

export interface EpisodeOfCareSearchParams {
  "care-manager": ReferenceParam;
  date: DateParam;
  "diagnosis-code": TokenParam;
  "diagnosis-reference": ReferenceParam;
  identifier: TokenParam;
  "incoming-referral": ReferenceParam;
  organization: ReferenceParam;
  patient: ReferenceParam;
  "reason-code": TokenParam;
  "reason-reference": ReferenceParam;
  status: TokenParam;
  type: TokenParam;
}

export interface EventDefinitionSearchParams {
  "composed-of": ReferenceParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "depends-on": ReferenceParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  successor: ReferenceParam;
  title: StringParam;
  topic: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface EvidenceSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface EvidenceReportSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  identifier: TokenParam;
  publisher: StringParam;
  status: TokenParam;
  url: UriParam;
}

export interface EvidenceVariableSearchParams {
  "composed-of": ReferenceParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "depends-on": ReferenceParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  identifier: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  successor: ReferenceParam;
  title: StringParam;
  topic: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface ExampleScenarioSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface ExplanationOfBenefitSearchParams {
  "care-team": ReferenceParam;
  claim: ReferenceParam;
  coverage: ReferenceParam;
  created: DateParam;
  "detail-udi": ReferenceParam;
  disposition: StringParam;
  encounter: ReferenceParam;
  enterer: ReferenceParam;
  facility: ReferenceParam;
  identifier: TokenParam;
  "item-udi": ReferenceParam;
  patient: ReferenceParam;
  payee: ReferenceParam;
  "procedure-udi": ReferenceParam;
  provider: ReferenceParam;
  status: TokenParam;
  "subdetail-udi": ReferenceParam;
}

export interface FamilyMemberHistorySearchParams {
  code: TokenParam;
  date: DateParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  patient: ReferenceParam;
  relationship: TokenParam;
  sex: TokenParam;
  status: TokenParam;
}

export interface FlagSearchParams {
  author: ReferenceParam;
  category: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface FormularyItemSearchParams {
  code: TokenParam;
  identifier: TokenParam;
}

export interface GenomicStudySearchParams {
  focus: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface GoalSearchParams {
  "achievement-status": TokenParam;
  addresses: ReferenceParam;
  category: TokenParam;
  description: TokenParam;
  identifier: TokenParam;
  "lifecycle-status": TokenParam;
  patient: ReferenceParam;
  "start-date": DateParam;
  subject: ReferenceParam;
  "target-date": DateParam;
  "target-measure": TokenParam;
}

export interface GraphDefinitionSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  start: TokenParam;
  status: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface GroupSearchParams {
  characteristic: TokenParam;
  "characteristic-reference": ReferenceParam;
  "characteristic-value": CompositeParam;
  code: TokenParam;
  exclude: TokenParam;
  identifier: TokenParam;
  "managing-entity": ReferenceParam;
  member: ReferenceParam;
  membership: TokenParam;
  name: StringParam;
  type: TokenParam;
  value: TokenParam;
}

export interface GuidanceResponseSearchParams {
  identifier: TokenParam;
  patient: ReferenceParam;
  request: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface HealthcareServiceSearchParams {
  active: TokenParam;
  characteristic: TokenParam;
  communication: TokenParam;
  "coverage-area": ReferenceParam;
  eligibility: TokenParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  name: StringParam;
  "offered-in": ReferenceParam;
  organization: ReferenceParam;
  program: TokenParam;
  "service-category": TokenParam;
  "service-type": TokenParam;
  specialty: TokenParam;
}

export interface ImagingSelectionSearchParams {
  "based-on": ReferenceParam;
  "body-site": TokenParam;
  "body-structure": ReferenceParam;
  code: TokenParam;
  "derived-from": ReferenceParam;
  identifier: TokenParam;
  issued: DateParam;
  patient: ReferenceParam;
  status: TokenParam;
  "study-uid": TokenParam;
  subject: ReferenceParam;
}

export interface ImagingStudySearchParams {
  "based-on": ReferenceParam;
  "body-site": TokenParam;
  "body-structure": ReferenceParam;
  "dicom-class": TokenParam;
  encounter: ReferenceParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  instance: TokenParam;
  modality: TokenParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  reason: TokenParam;
  referrer: ReferenceParam;
  series: TokenParam;
  started: DateParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface ImmunizationSearchParams {
  date: DateParam;
  identifier: TokenParam;
  location: ReferenceParam;
  "lot-number": StringParam;
  manufacturer: ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  reaction: ReferenceParam;
  "reaction-date": DateParam;
  "reason-code": TokenParam;
  "reason-reference": ReferenceParam;
  series: StringParam;
  status: TokenParam;
  "status-reason": TokenParam;
  "target-disease": TokenParam;
  "vaccine-code": TokenParam;
}

export interface ImmunizationEvaluationSearchParams {
  date: DateParam;
  "dose-status": TokenParam;
  identifier: TokenParam;
  "immunization-event": ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  "target-disease": TokenParam;
}

export interface ImmunizationRecommendationSearchParams {
  date: DateParam;
  identifier: TokenParam;
  information: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  support: ReferenceParam;
  "target-disease": TokenParam;
  "vaccine-type": TokenParam;
}

export interface ImplementationGuideSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "depends-on": ReferenceParam;
  description: StringParam;
  experimental: TokenParam;
  global: ReferenceParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  resource: ReferenceParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface IngredientSearchParams {
  for: ReferenceParam;
  function: TokenParam;
  identifier: TokenParam;
  manufacturer: ReferenceParam;
  role: TokenParam;
  status: TokenParam;
  "strength-concentration-quantity": QuantityParam;
  "strength-concentration-ratio": CompositeParam;
  "strength-presentation-quantity": QuantityParam;
  "strength-presentation-ratio": CompositeParam;
  substance: ReferenceParam;
  "substance-code": TokenParam;
  "substance-definition": ReferenceParam;
}

export interface InsurancePlanSearchParams {
  address: StringParam;
  "address-city": StringParam;
  "address-country": StringParam;
  "address-postalcode": StringParam;
  "address-state": StringParam;
  "address-use": TokenParam;
  "administered-by": ReferenceParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  name: StringParam;
  "owned-by": ReferenceParam;
  phonetic: StringParam;
  status: TokenParam;
  type: TokenParam;
}

export interface InventoryItemSearchParams {
  code: TokenParam;
  identifier: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface InventoryReportSearchParams {
  identifier: TokenParam;
  item: TokenParam;
  "item-reference": ReferenceParam;
  status: TokenParam;
}

export interface InvoiceSearchParams {
  account: ReferenceParam;
  date: DateParam;
  identifier: TokenParam;
  issuer: ReferenceParam;
  participant: ReferenceParam;
  "participant-role": TokenParam;
  patient: ReferenceParam;
  recipient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  totalgross: QuantityParam;
  totalnet: QuantityParam;
  type: TokenParam;
}

export interface LibrarySearchParams {
  "composed-of": ReferenceParam;
  "content-type": TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "depends-on": ReferenceParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  successor: ReferenceParam;
  title: StringParam;
  topic: TokenParam;
  type: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface LinkageSearchParams {
  author: ReferenceParam;
  item: ReferenceParam;
  source: ReferenceParam;
}

export interface ListSearchParams {
  code: TokenParam;
  date: DateParam;
  "empty-reason": TokenParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  item: ReferenceParam;
  notes: StringParam;
  patient: ReferenceParam;
  source: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  title: StringParam;
}

export interface LocationSearchParams {
  address: StringParam;
  "address-city": StringParam;
  "address-country": StringParam;
  "address-postalcode": StringParam;
  "address-state": StringParam;
  "address-use": TokenParam;
  characteristic: TokenParam;
  contains: SpecialParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  name: StringParam;
  near: SpecialParam;
  "operational-status": TokenParam;
  organization: ReferenceParam;
  partof: ReferenceParam;
  status: TokenParam;
  type: TokenParam;
}

export interface ManufacturedItemDefinitionSearchParams {
  "dose-form": TokenParam;
  identifier: TokenParam;
  ingredient: TokenParam;
  name: TokenParam;
  status: TokenParam;
}

export interface MeasureSearchParams {
  "composed-of": ReferenceParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "depends-on": ReferenceParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  successor: ReferenceParam;
  title: StringParam;
  topic: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface MeasureReportSearchParams {
  date: DateParam;
  "evaluated-resource": ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  measure: ReferenceParam;
  patient: ReferenceParam;
  period: DateParam;
  reporter: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MedicationSearchParams {
  code: TokenParam;
  "expiration-date": DateParam;
  form: TokenParam;
  identifier: TokenParam;
  ingredient: ReferenceParam;
  "ingredient-code": TokenParam;
  "lot-number": TokenParam;
  marketingauthorizationholder: ReferenceParam;
  "serial-number": TokenParam;
  status: TokenParam;
}

export interface MedicationAdministrationSearchParams {
  code: TokenParam;
  date: DateParam;
  device: ReferenceParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  medication: ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  "performer-device-code": TokenParam;
  "reason-given": ReferenceParam;
  "reason-given-code": TokenParam;
  "reason-not-given": TokenParam;
  request: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MedicationDispenseSearchParams {
  code: TokenParam;
  destination: ReferenceParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  medication: ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  prescription: ReferenceParam;
  receiver: ReferenceParam;
  recorded: DateParam;
  responsibleparty: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
  whenhandedover: DateParam;
  whenprepared: DateParam;
}

export interface MedicationKnowledgeSearchParams {
  classification: TokenParam;
  "classification-type": TokenParam;
  code: TokenParam;
  doseform: TokenParam;
  identifier: TokenParam;
  ingredient: ReferenceParam;
  "ingredient-code": TokenParam;
  "monitoring-program-name": TokenParam;
  "monitoring-program-type": TokenParam;
  monograph: ReferenceParam;
  "monograph-type": TokenParam;
  "packaging-cost": QuantityParam;
  "packaging-cost-concept": TokenParam;
  "product-type": TokenParam;
  "source-cost": TokenParam;
  status: TokenParam;
}

export interface MedicationRequestSearchParams {
  authoredon: DateParam;
  category: TokenParam;
  code: TokenParam;
  "combo-date": DateParam;
  encounter: ReferenceParam;
  "group-identifier": TokenParam;
  identifier: TokenParam;
  "intended-dispenser": ReferenceParam;
  "intended-performer": ReferenceParam;
  "intended-performertype": TokenParam;
  intent: TokenParam;
  medication: ReferenceParam;
  patient: ReferenceParam;
  priority: TokenParam;
  requester: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MedicationStatementSearchParams {
  adherence: TokenParam;
  category: TokenParam;
  code: TokenParam;
  effective: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  medication: ReferenceParam;
  patient: ReferenceParam;
  source: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MedicinalProductDefinitionSearchParams {
  characteristic: TokenParam;
  "characteristic-type": TokenParam;
  contact: ReferenceParam;
  domain: TokenParam;
  identifier: TokenParam;
  ingredient: TokenParam;
  "master-file": ReferenceParam;
  name: StringParam;
  "name-language": TokenParam;
  "product-classification": TokenParam;
  status: TokenParam;
  type: TokenParam;
}

export interface MessageDefinitionSearchParams {
  category: TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  event: TokenParam;
  focus: TokenParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  parent: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface MessageHeaderSearchParams {
  author: ReferenceParam;
  code: TokenParam;
  destination: StringParam;
  event: TokenParam;
  focus: ReferenceParam;
  receiver: ReferenceParam;
  "response-id": TokenParam;
  responsible: ReferenceParam;
  sender: ReferenceParam;
  source: StringParam;
  target: ReferenceParam;
}

export interface MolecularSequenceSearchParams {
  focus: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  subject: ReferenceParam;
  type: TokenParam;
}

export interface NamingSystemSearchParams {
  contact: StringParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  "id-type": TokenParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  kind: TokenParam;
  name: StringParam;
  period: DateParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  responsible: StringParam;
  status: TokenParam;
  telecom: TokenParam;
  topic: TokenParam;
  type: TokenParam;
  url: UriParam;
  value: StringParam;
  version: TokenParam;
}

export interface NutritionIntakeSearchParams {
  code: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  nutrition: TokenParam;
  patient: ReferenceParam;
  source: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface NutritionOrderSearchParams {
  additive: TokenParam;
  datetime: DateParam;
  encounter: ReferenceParam;
  formula: TokenParam;
  "group-identifier": TokenParam;
  identifier: TokenParam;
  oraldiet: TokenParam;
  patient: ReferenceParam;
  provider: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  supplement: TokenParam;
}

export interface NutritionProductSearchParams {
  code: TokenParam;
  identifier: TokenParam;
  "lot-number": TokenParam;
  "serial-number": TokenParam;
  status: TokenParam;
}

export interface ObservationSearchParams {
  "based-on": ReferenceParam;
  category: TokenParam;
  code: TokenParam;
  "code-value-concept": CompositeParam;
  "code-value-date": CompositeParam;
  "code-value-quantity": CompositeParam;
  "code-value-string": CompositeParam;
  "combo-code": TokenParam;
  "combo-code-value-concept": CompositeParam;
  "combo-code-value-quantity": CompositeParam;
  "combo-data-absent-reason": TokenParam;
  "combo-value-concept": TokenParam;
  "combo-value-quantity": QuantityParam;
  "component-code": TokenParam;
  "component-code-value-concept": CompositeParam;
  "component-code-value-quantity": CompositeParam;
  "component-data-absent-reason": TokenParam;
  "component-value-canonical": UriParam;
  "component-value-concept": TokenParam;
  "component-value-quantity": QuantityParam;
  "component-value-reference": ReferenceParam;
  "data-absent-reason": TokenParam;
  date: DateParam;
  "derived-from": ReferenceParam;
  device: ReferenceParam;
  encounter: ReferenceParam;
  focus: ReferenceParam;
  "has-member": ReferenceParam;
  identifier: TokenParam;
  method: TokenParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  specimen: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  "value-canonical": UriParam;
  "value-concept": TokenParam;
  "value-date": DateParam;
  "value-markdown": StringParam;
  "value-quantity": QuantityParam;
  "value-reference": ReferenceParam;
}

export interface ObservationDefinitionSearchParams {
  category: TokenParam;
  code: TokenParam;
  experimental: TokenParam;
  identifier: TokenParam;
  method: TokenParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
}

export interface OperationDefinitionSearchParams {
  base: ReferenceParam;
  code: TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  "input-profile": ReferenceParam;
  instance: TokenParam;
  jurisdiction: TokenParam;
  kind: TokenParam;
  name: StringParam;
  "output-profile": ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  system: TokenParam;
  title: StringParam;
  type: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface OrganizationSearchParams {
  active: TokenParam;
  address: StringParam;
  "address-city": StringParam;
  "address-country": StringParam;
  "address-postalcode": StringParam;
  "address-state": StringParam;
  "address-use": TokenParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  name: StringParam;
  partof: ReferenceParam;
  phonetic: StringParam;
  type: TokenParam;
}

export interface OrganizationAffiliationSearchParams {
  active: TokenParam;
  date: DateParam;
  email: TokenParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  network: ReferenceParam;
  "participating-organization": ReferenceParam;
  phone: TokenParam;
  "primary-organization": ReferenceParam;
  role: TokenParam;
  service: ReferenceParam;
  specialty: TokenParam;
  telecom: TokenParam;
}

export interface PackagedProductDefinitionSearchParams {
  biological: ReferenceParam;
  "contained-item": ReferenceParam;
  device: ReferenceParam;
  identifier: TokenParam;
  "manufactured-item": ReferenceParam;
  medication: ReferenceParam;
  name: TokenParam;
  nutrition: ReferenceParam;
  package: ReferenceParam;
  "package-for": ReferenceParam;
  status: TokenParam;
}

export interface PatientSearchParams {
  active: TokenParam;
  address: StringParam;
  "address-city": StringParam;
  "address-country": StringParam;
  "address-postalcode": StringParam;
  "address-state": StringParam;
  "address-use": TokenParam;
  birthdate: DateParam;
  "death-date": DateParam;
  deceased: TokenParam;
  email: TokenParam;
  family: StringParam;
  gender: TokenParam;
  "general-practitioner": ReferenceParam;
  given: StringParam;
  identifier: TokenParam;
  language: TokenParam;
  link: ReferenceParam;
  name: StringParam;
  organization: ReferenceParam;
  phone: TokenParam;
  phonetic: StringParam;
  telecom: TokenParam;
}

export interface PaymentNoticeSearchParams {
  created: DateParam;
  identifier: TokenParam;
  "payment-status": TokenParam;
  reporter: ReferenceParam;
  request: ReferenceParam;
  response: ReferenceParam;
  status: TokenParam;
}

export interface PaymentReconciliationSearchParams {
  "allocation-account": ReferenceParam;
  "allocation-encounter": ReferenceParam;
  created: DateParam;
  disposition: StringParam;
  identifier: TokenParam;
  outcome: TokenParam;
  "payment-issuer": ReferenceParam;
  request: ReferenceParam;
  requestor: ReferenceParam;
  status: TokenParam;
}

export interface PermissionSearchParams {
  status: TokenParam;
}

export interface PersonSearchParams {
  address: StringParam;
  "address-city": StringParam;
  "address-country": StringParam;
  "address-postalcode": StringParam;
  "address-state": StringParam;
  "address-use": TokenParam;
  birthdate: DateParam;
  "death-date": DateParam;
  deceased: TokenParam;
  email: TokenParam;
  family: StringParam;
  gender: TokenParam;
  given: StringParam;
  identifier: TokenParam;
  link: ReferenceParam;
  name: StringParam;
  organization: ReferenceParam;
  patient: ReferenceParam;
  phone: TokenParam;
  phonetic: StringParam;
  practitioner: ReferenceParam;
  relatedperson: ReferenceParam;
  telecom: TokenParam;
}

export interface PlanDefinitionSearchParams {
  "composed-of": ReferenceParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  definition: ReferenceParam;
  "depends-on": ReferenceParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  status: TokenParam;
  successor: ReferenceParam;
  title: StringParam;
  topic: TokenParam;
  type: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface PractitionerSearchParams {
  active: TokenParam;
  address: StringParam;
  "address-city": StringParam;
  "address-country": StringParam;
  "address-postalcode": StringParam;
  "address-state": StringParam;
  "address-use": TokenParam;
  communication: TokenParam;
  "death-date": DateParam;
  deceased: TokenParam;
  email: TokenParam;
  family: StringParam;
  gender: TokenParam;
  given: StringParam;
  identifier: TokenParam;
  name: StringParam;
  phone: TokenParam;
  phonetic: StringParam;
  "qualification-period": DateParam;
  telecom: TokenParam;
}

export interface PractitionerRoleSearchParams {
  active: TokenParam;
  characteristic: TokenParam;
  communication: TokenParam;
  date: DateParam;
  email: TokenParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  organization: ReferenceParam;
  phone: TokenParam;
  practitioner: ReferenceParam;
  role: TokenParam;
  service: ReferenceParam;
  specialty: TokenParam;
  telecom: TokenParam;
}

export interface ProcedureSearchParams {
  "based-on": ReferenceParam;
  category: TokenParam;
  code: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  location: ReferenceParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  "reason-code": TokenParam;
  "reason-reference": ReferenceParam;
  report: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface ProvenanceSearchParams {
  activity: TokenParam;
  agent: ReferenceParam;
  "agent-role": TokenParam;
  "agent-type": TokenParam;
  "based-on": ReferenceParam;
  encounter: ReferenceParam;
  entity: ReferenceParam;
  location: ReferenceParam;
  patient: ReferenceParam;
  recorded: DateParam;
  "signature-type": TokenParam;
  target: ReferenceParam;
  when: DateParam;
}

export interface QuestionnaireSearchParams {
  "combo-code": TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  definition: UriParam;
  description: StringParam;
  effective: DateParam;
  identifier: TokenParam;
  "item-code": TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  "questionnaire-code": TokenParam;
  status: TokenParam;
  "subject-type": TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface QuestionnaireResponseSearchParams {
  author: ReferenceParam;
  authored: DateParam;
  "based-on": ReferenceParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  "item-subject": ReferenceParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  questionnaire: ReferenceParam;
  source: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface RegulatedAuthorizationSearchParams {
  case: TokenParam;
  "case-type": TokenParam;
  holder: ReferenceParam;
  identifier: TokenParam;
  region: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface RelatedPersonSearchParams {
  active: TokenParam;
  address: StringParam;
  "address-city": StringParam;
  "address-country": StringParam;
  "address-postalcode": StringParam;
  "address-state": StringParam;
  "address-use": TokenParam;
  birthdate: DateParam;
  email: TokenParam;
  family: StringParam;
  gender: TokenParam;
  given: StringParam;
  identifier: TokenParam;
  name: StringParam;
  patient: ReferenceParam;
  phone: TokenParam;
  phonetic: StringParam;
  relationship: TokenParam;
  telecom: TokenParam;
}

export interface RequestOrchestrationSearchParams {
  author: ReferenceParam;
  authored: DateParam;
  "based-on": ReferenceParam;
  code: TokenParam;
  encounter: ReferenceParam;
  "group-identifier": TokenParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  intent: TokenParam;
  participant: ReferenceParam;
  patient: ReferenceParam;
  priority: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface RequirementsSearchParams {
  actor: ReferenceParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface ResearchStudySearchParams {
  classifier: TokenParam;
  condition: TokenParam;
  date: DateParam;
  description: StringParam;
  eligibility: ReferenceParam;
  "focus-code": TokenParam;
  "focus-reference": ReferenceParam;
  identifier: TokenParam;
  keyword: TokenParam;
  name: StringParam;
  "objective-description": StringParam;
  "objective-type": TokenParam;
  "part-of": ReferenceParam;
  phase: TokenParam;
  "progress-status-state-actual": CompositeParam;
  "progress-status-state-period": CompositeParam;
  "progress-status-state-period-actual": CompositeParam;
  protocol: ReferenceParam;
  "recruitment-actual": NumberParam;
  "recruitment-target": NumberParam;
  region: TokenParam;
  site: ReferenceParam;
  status: TokenParam;
  "study-design": TokenParam;
  title: StringParam;
}

export interface ResearchSubjectSearchParams {
  date: DateParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  status: TokenParam;
  study: ReferenceParam;
  subject: ReferenceParam;
  subject_state: TokenParam;
}

export interface RiskAssessmentSearchParams {
  condition: ReferenceParam;
  date: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  method: TokenParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  probability: NumberParam;
  risk: TokenParam;
  subject: ReferenceParam;
}

export interface ScheduleSearchParams {
  active: TokenParam;
  actor: ReferenceParam;
  date: DateParam;
  identifier: TokenParam;
  name: StringParam;
  "service-category": TokenParam;
  "service-type": TokenParam;
  "service-type-reference": ReferenceParam;
  specialty: TokenParam;
}

export interface SearchParameterSearchParams {
  base: TokenParam;
  code: TokenParam;
  component: ReferenceParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  target: TokenParam;
  type: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface ServiceRequestSearchParams {
  authored: DateParam;
  "based-on": ReferenceParam;
  "body-site": TokenParam;
  "body-structure": ReferenceParam;
  category: TokenParam;
  "code-concept": TokenParam;
  "code-reference": ReferenceParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  intent: TokenParam;
  occurrence: DateParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  "performer-type": TokenParam;
  priority: TokenParam;
  replaces: ReferenceParam;
  requester: ReferenceParam;
  requisition: TokenParam;
  specimen: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface SlotSearchParams {
  "appointment-type": TokenParam;
  identifier: TokenParam;
  schedule: ReferenceParam;
  "service-category": TokenParam;
  "service-type": TokenParam;
  "service-type-reference": ReferenceParam;
  specialty: TokenParam;
  start: DateParam;
  status: TokenParam;
}

export interface SpecimenSearchParams {
  accession: TokenParam;
  bodysite: ReferenceParam;
  collected: DateParam;
  collector: ReferenceParam;
  "container-device": ReferenceParam;
  identifier: TokenParam;
  parent: ReferenceParam;
  patient: ReferenceParam;
  procedure: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
}

export interface SpecimenDefinitionSearchParams {
  container: TokenParam;
  experimental: TokenParam;
  identifier: TokenParam;
  "is-derived": TokenParam;
  status: TokenParam;
  title: StringParam;
  type: TokenParam;
  "type-tested": TokenParam;
  url: UriParam;
}

export interface StructureDefinitionSearchParams {
  abstract: TokenParam;
  base: ReferenceParam;
  "base-path": TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  derivation: TokenParam;
  description: StringParam;
  experimental: TokenParam;
  "ext-context": CompositeParam;
  "ext-context-expression": TokenParam;
  "ext-context-type": TokenParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  keyword: TokenParam;
  kind: TokenParam;
  name: StringParam;
  path: TokenParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  type: UriParam;
  url: UriParam;
  valueset: ReferenceParam;
  version: TokenParam;
}

export interface StructureMapSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface SubscriptionSearchParams {
  contact: TokenParam;
  "content-level": TokenParam;
  "filter-value": StringParam;
  identifier: TokenParam;
  name: StringParam;
  owner: ReferenceParam;
  payload: TokenParam;
  status: TokenParam;
  topic: UriParam;
  type: TokenParam;
  url: UriParam;
}

export interface SubscriptionTopicSearchParams {
  date: DateParam;
  "derived-or-self": UriParam;
  effective: DateParam;
  event: TokenParam;
  identifier: TokenParam;
  resource: UriParam;
  status: TokenParam;
  title: StringParam;
  "trigger-description": StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface SubstanceSearchParams {
  category: TokenParam;
  code: TokenParam;
  "code-reference": ReferenceParam;
  expiry: DateParam;
  identifier: TokenParam;
  quantity: QuantityParam;
  status: TokenParam;
  "substance-reference": ReferenceParam;
}

export interface SubstanceDefinitionSearchParams {
  classification: TokenParam;
  code: TokenParam;
  domain: TokenParam;
  identifier: TokenParam;
  name: StringParam;
}

export interface SupplyDeliverySearchParams {
  identifier: TokenParam;
  patient: ReferenceParam;
  receiver: ReferenceParam;
  status: TokenParam;
  supplier: ReferenceParam;
}

export interface SupplyRequestSearchParams {
  category: TokenParam;
  date: DateParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  requester: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  supplier: ReferenceParam;
}

export interface TaskSearchParams {
  actor: ReferenceParam;
  "authored-on": DateParam;
  "based-on": ReferenceParam;
  "business-status": TokenParam;
  code: TokenParam;
  encounter: ReferenceParam;
  focus: ReferenceParam;
  "group-identifier": TokenParam;
  identifier: TokenParam;
  intent: TokenParam;
  modified: DateParam;
  output: ReferenceParam;
  owner: ReferenceParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  performer: TokenParam;
  period: DateParam;
  priority: TokenParam;
  "requestedperformer-reference": ReferenceParam;
  requester: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface TerminologyCapabilitiesSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface TestPlanSearchParams {
  identifier: TokenParam;
  scope: ReferenceParam;
  status: TokenParam;
  url: UriParam;
}

export interface TestReportSearchParams {
  identifier: TokenParam;
  issued: DateParam;
  participant: UriParam;
  result: TokenParam;
  status: TokenParam;
  tester: StringParam;
  testscript: ReferenceParam;
}

export interface TestScriptSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  "scope-artifact": ReferenceParam;
  "scope-artifact-conformance": CompositeParam;
  "scope-artifact-phase": CompositeParam;
  status: TokenParam;
  "testscript-capability": StringParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface TransportSearchParams {
  identifier: TokenParam;
  status: TokenParam;
}

export interface ValueSetSearchParams {
  code: TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  "derived-from": ReferenceParam;
  description: StringParam;
  effective: DateParam;
  expansion: UriParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  predecessor: ReferenceParam;
  publisher: StringParam;
  reference: UriParam;
  status: TokenParam;
  title: StringParam;
  topic: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface VerificationResultSearchParams {
  "attestation-method": TokenParam;
  "attestation-onbehalfof": ReferenceParam;
  "attestation-who": ReferenceParam;
  "primarysource-date": DateParam;
  "primarysource-type": TokenParam;
  "primarysource-who": ReferenceParam;
  status: TokenParam;
  "status-date": DateParam;
  target: ReferenceParam;
  "validator-organization": ReferenceParam;
}

export interface VisionPrescriptionSearchParams {
  datewritten: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  prescriber: ReferenceParam;
  status: TokenParam;
}

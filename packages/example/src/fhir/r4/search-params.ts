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
  identifier: TokenParam;
  name: StringParam;
  owner: ReferenceParam;
  patient: ReferenceParam;
  period: DateParam;
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

export interface AdverseEventSearchParams {
  actuality: TokenParam;
  category: TokenParam;
  date: DateParam;
  event: TokenParam;
  location: ReferenceParam;
  recorder: ReferenceParam;
  resultingcondition: ReferenceParam;
  seriousness: TokenParam;
  severity: TokenParam;
  study: ReferenceParam;
  subject: ReferenceParam;
  substance: ReferenceParam;
}

export interface AllergyIntoleranceSearchParams {
  asserter: ReferenceParam;
  category: TokenParam;
  "clinical-status": TokenParam;
  code: TokenParam;
  criticality: TokenParam;
  date: DateParam;
  identifier: TokenParam;
  "last-date": DateParam;
  manifestation: TokenParam;
  onset: DateParam;
  patient: ReferenceParam;
  recorder: ReferenceParam;
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
  identifier: TokenParam;
  location: ReferenceParam;
  "part-status": TokenParam;
  patient: ReferenceParam;
  practitioner: ReferenceParam;
  "reason-code": TokenParam;
  "reason-reference": ReferenceParam;
  "service-category": TokenParam;
  "service-type": TokenParam;
  slot: ReferenceParam;
  specialty: TokenParam;
  status: TokenParam;
  "supporting-info": ReferenceParam;
}

export interface AppointmentResponseSearchParams {
  actor: ReferenceParam;
  appointment: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  "part-status": TokenParam;
  patient: ReferenceParam;
  practitioner: ReferenceParam;
}

export interface AuditEventSearchParams {
  action: TokenParam;
  address: StringParam;
  agent: ReferenceParam;
  "agent-name": StringParam;
  "agent-role": TokenParam;
  altid: TokenParam;
  date: DateParam;
  entity: ReferenceParam;
  "entity-name": StringParam;
  "entity-role": TokenParam;
  "entity-type": TokenParam;
  outcome: TokenParam;
  patient: ReferenceParam;
  policy: UriParam;
  site: TokenParam;
  source: ReferenceParam;
  subtype: TokenParam;
  type: TokenParam;
}

export interface BasicSearchParams {
  author: ReferenceParam;
  code: TokenParam;
  created: DateParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  subject: ReferenceParam;
}

export interface BodyStructureSearchParams {
  identifier: TokenParam;
  location: TokenParam;
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
  "activity-code": TokenParam;
  "activity-date": DateParam;
  "activity-reference": ReferenceParam;
  "based-on": ReferenceParam;
  "care-team": ReferenceParam;
  category: TokenParam;
  condition: ReferenceParam;
  date: DateParam;
  encounter: ReferenceParam;
  goal: ReferenceParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  intent: TokenParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  replaces: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface CareTeamSearchParams {
  category: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  participant: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface ChargeItemSearchParams {
  account: ReferenceParam;
  code: TokenParam;
  context: ReferenceParam;
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
  assessor: ReferenceParam;
  date: DateParam;
  encounter: ReferenceParam;
  "finding-code": TokenParam;
  "finding-ref": ReferenceParam;
  identifier: TokenParam;
  investigation: ReferenceParam;
  patient: ReferenceParam;
  previous: ReferenceParam;
  problem: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  "supporting-info": ReferenceParam;
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
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  language: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  supplements: ReferenceParam;
  system: UriParam;
  title: StringParam;
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
}

export interface CommunicationRequestSearchParams {
  authored: DateParam;
  "based-on": ReferenceParam;
  category: TokenParam;
  encounter: ReferenceParam;
  "group-identifier": TokenParam;
  identifier: TokenParam;
  medium: TokenParam;
  occurrence: DateParam;
  patient: ReferenceParam;
  priority: TokenParam;
  recipient: ReferenceParam;
  replaces: ReferenceParam;
  requester: ReferenceParam;
  sender: ReferenceParam;
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
  confidentiality: TokenParam;
  context: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
  entry: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  period: DateParam;
  "related-id": TokenParam;
  "related-ref": ReferenceParam;
  section: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
  title: StringParam;
  type: TokenParam;
}

export interface ConceptMapSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  dependson: UriParam;
  description: StringParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  other: ReferenceParam;
  product: UriParam;
  publisher: StringParam;
  source: ReferenceParam;
  "source-code": TokenParam;
  "source-system": UriParam;
  "source-uri": ReferenceParam;
  status: TokenParam;
  target: ReferenceParam;
  "target-code": TokenParam;
  "target-system": UriParam;
  "target-uri": ReferenceParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface ConditionSearchParams {
  "abatement-age": QuantityParam;
  "abatement-date": DateParam;
  "abatement-string": StringParam;
  asserter: ReferenceParam;
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
  patient: ReferenceParam;
  "recorded-date": DateParam;
  severity: TokenParam;
  stage: TokenParam;
  subject: ReferenceParam;
  "verification-status": TokenParam;
}

export interface ConsentSearchParams {
  action: TokenParam;
  actor: ReferenceParam;
  category: TokenParam;
  consentor: ReferenceParam;
  data: ReferenceParam;
  date: DateParam;
  identifier: TokenParam;
  organization: ReferenceParam;
  patient: ReferenceParam;
  period: DateParam;
  purpose: TokenParam;
  scope: TokenParam;
  "security-label": TokenParam;
  "source-reference": ReferenceParam;
  status: TokenParam;
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
  "class-value": StringParam;
  dependent: StringParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  payor: ReferenceParam;
  "policy-holder": ReferenceParam;
  status: TokenParam;
  subscriber: ReferenceParam;
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
  code: TokenParam;
  identified: DateParam;
  identifier: TokenParam;
  implicated: ReferenceParam;
  patient: ReferenceParam;
}

export interface DeviceSearchParams {
  "device-name": StringParam;
  identifier: TokenParam;
  location: ReferenceParam;
  manufacturer: StringParam;
  model: StringParam;
  organization: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  type: TokenParam;
  "udi-carrier": StringParam;
  "udi-di": StringParam;
  url: UriParam;
}

export interface DeviceDefinitionSearchParams {
  identifier: TokenParam;
  parent: ReferenceParam;
  type: TokenParam;
}

export interface DeviceMetricSearchParams {
  category: TokenParam;
  identifier: TokenParam;
  parent: ReferenceParam;
  source: ReferenceParam;
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
  "prior-request": ReferenceParam;
  requester: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface DeviceUseStatementSearchParams {
  device: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  subject: ReferenceParam;
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
  subject: ReferenceParam;
}

export interface DocumentManifestSearchParams {
  author: ReferenceParam;
  created: DateParam;
  description: StringParam;
  identifier: TokenParam;
  item: ReferenceParam;
  patient: ReferenceParam;
  recipient: ReferenceParam;
  "related-id": TokenParam;
  "related-ref": ReferenceParam;
  source: UriParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
}

export interface DocumentReferenceSearchParams {
  authenticator: ReferenceParam;
  author: ReferenceParam;
  category: TokenParam;
  contenttype: TokenParam;
  custodian: ReferenceParam;
  date: DateParam;
  description: StringParam;
  encounter: ReferenceParam;
  event: TokenParam;
  facility: TokenParam;
  format: TokenParam;
  identifier: TokenParam;
  language: TokenParam;
  location: UriParam;
  patient: ReferenceParam;
  period: DateParam;
  related: ReferenceParam;
  relatesto: ReferenceParam;
  relation: TokenParam;
  relationship: CompositeParam;
  "security-label": TokenParam;
  setting: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
}

export interface EffectEvidenceSynthesisSearchParams {
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

export interface EncounterSearchParams {
  account: ReferenceParam;
  appointment: ReferenceParam;
  "based-on": ReferenceParam;
  class: TokenParam;
  date: DateParam;
  diagnosis: ReferenceParam;
  "episode-of-care": ReferenceParam;
  identifier: TokenParam;
  length: QuantityParam;
  location: ReferenceParam;
  "location-period": DateParam;
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
  type: TokenParam;
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
  condition: ReferenceParam;
  date: DateParam;
  identifier: TokenParam;
  "incoming-referral": ReferenceParam;
  organization: ReferenceParam;
  patient: ReferenceParam;
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
  date: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  subject: ReferenceParam;
}

export interface GoalSearchParams {
  "achievement-status": TokenParam;
  category: TokenParam;
  identifier: TokenParam;
  "lifecycle-status": TokenParam;
  patient: ReferenceParam;
  "start-date": DateParam;
  subject: ReferenceParam;
  "target-date": DateParam;
}

export interface GraphDefinitionSearchParams {
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  start: TokenParam;
  status: TokenParam;
  url: UriParam;
  version: TokenParam;
}

export interface GroupSearchParams {
  actual: TokenParam;
  characteristic: TokenParam;
  "characteristic-value": CompositeParam;
  code: TokenParam;
  exclude: TokenParam;
  identifier: TokenParam;
  "managing-entity": ReferenceParam;
  member: ReferenceParam;
  type: TokenParam;
  value: TokenParam;
}

export interface GuidanceResponseSearchParams {
  identifier: TokenParam;
  patient: ReferenceParam;
  request: TokenParam;
  subject: ReferenceParam;
}

export interface HealthcareServiceSearchParams {
  active: TokenParam;
  characteristic: TokenParam;
  "coverage-area": ReferenceParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  location: ReferenceParam;
  name: StringParam;
  organization: ReferenceParam;
  program: TokenParam;
  "service-category": TokenParam;
  "service-type": TokenParam;
  specialty: TokenParam;
}

export interface ImagingStudySearchParams {
  basedon: ReferenceParam;
  bodysite: TokenParam;
  "dicom-class": TokenParam;
  encounter: ReferenceParam;
  endpoint: ReferenceParam;
  identifier: TokenParam;
  instance: TokenParam;
  interpreter: ReferenceParam;
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
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  resource: ReferenceParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
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
  measure: ReferenceParam;
  patient: ReferenceParam;
  period: DateParam;
  reporter: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MediaSearchParams {
  "based-on": ReferenceParam;
  created: DateParam;
  device: ReferenceParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  modality: TokenParam;
  operator: ReferenceParam;
  patient: ReferenceParam;
  site: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
  view: TokenParam;
}

export interface MedicationSearchParams {
  code: TokenParam;
  "expiration-date": DateParam;
  form: TokenParam;
  identifier: TokenParam;
  ingredient: ReferenceParam;
  "ingredient-code": TokenParam;
  "lot-number": TokenParam;
  manufacturer: ReferenceParam;
  status: TokenParam;
}

export interface MedicationAdministrationSearchParams {
  code: TokenParam;
  context: ReferenceParam;
  device: ReferenceParam;
  "effective-time": DateParam;
  identifier: TokenParam;
  medication: ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  "reason-given": TokenParam;
  "reason-not-given": TokenParam;
  request: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MedicationDispenseSearchParams {
  code: TokenParam;
  context: ReferenceParam;
  destination: ReferenceParam;
  identifier: TokenParam;
  medication: ReferenceParam;
  patient: ReferenceParam;
  performer: ReferenceParam;
  prescription: ReferenceParam;
  receiver: ReferenceParam;
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
  ingredient: ReferenceParam;
  "ingredient-code": TokenParam;
  manufacturer: ReferenceParam;
  "monitoring-program-name": TokenParam;
  "monitoring-program-type": TokenParam;
  monograph: ReferenceParam;
  "monograph-type": TokenParam;
  "source-cost": TokenParam;
  status: TokenParam;
}

export interface MedicationRequestSearchParams {
  authoredon: DateParam;
  category: TokenParam;
  code: TokenParam;
  date: DateParam;
  encounter: ReferenceParam;
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
  category: TokenParam;
  code: TokenParam;
  context: ReferenceParam;
  effective: DateParam;
  identifier: TokenParam;
  medication: ReferenceParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  source: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MedicinalProductSearchParams {
  identifier: TokenParam;
  name: StringParam;
  "name-language": TokenParam;
}

export interface MedicinalProductAuthorizationSearchParams {
  country: TokenParam;
  holder: ReferenceParam;
  identifier: TokenParam;
  status: TokenParam;
  subject: ReferenceParam;
}

export interface MedicinalProductContraindicationSearchParams {
  subject: ReferenceParam;
}

export interface MedicinalProductIndicationSearchParams {
  subject: ReferenceParam;
}

export interface MedicinalProductInteractionSearchParams {
  subject: ReferenceParam;
}

export interface MedicinalProductPackagedSearchParams {
  identifier: TokenParam;
  subject: ReferenceParam;
}

export interface MedicinalProductPharmaceuticalSearchParams {
  identifier: TokenParam;
  route: TokenParam;
  "target-species": TokenParam;
}

export interface MedicinalProductUndesirableEffectSearchParams {
  subject: ReferenceParam;
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
  "destination-uri": UriParam;
  enterer: ReferenceParam;
  event: TokenParam;
  focus: ReferenceParam;
  receiver: ReferenceParam;
  "response-id": TokenParam;
  responsible: ReferenceParam;
  sender: ReferenceParam;
  source: StringParam;
  "source-uri": UriParam;
  target: ReferenceParam;
}

export interface MolecularSequenceSearchParams {
  chromosome: TokenParam;
  "chromosome-variant-coordinate": CompositeParam;
  "chromosome-window-coordinate": CompositeParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  referenceseqid: TokenParam;
  "referenceseqid-variant-coordinate": CompositeParam;
  "referenceseqid-window-coordinate": CompositeParam;
  type: TokenParam;
  "variant-end": NumberParam;
  "variant-start": NumberParam;
  "window-end": NumberParam;
  "window-start": NumberParam;
}

export interface NamingSystemSearchParams {
  contact: StringParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  "id-type": TokenParam;
  jurisdiction: TokenParam;
  kind: TokenParam;
  name: StringParam;
  period: DateParam;
  publisher: StringParam;
  responsible: StringParam;
  status: TokenParam;
  telecom: TokenParam;
  type: TokenParam;
  value: StringParam;
}

export interface NutritionOrderSearchParams {
  additive: TokenParam;
  datetime: DateParam;
  encounter: ReferenceParam;
  formula: TokenParam;
  identifier: TokenParam;
  "instantiates-canonical": ReferenceParam;
  "instantiates-uri": UriParam;
  oraldiet: TokenParam;
  patient: ReferenceParam;
  provider: ReferenceParam;
  status: TokenParam;
  supplement: TokenParam;
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
  "component-value-concept": TokenParam;
  "component-value-quantity": QuantityParam;
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
  "value-concept": TokenParam;
  "value-date": DateParam;
  "value-quantity": QuantityParam;
  "value-string": StringParam;
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
  provider: ReferenceParam;
  request: ReferenceParam;
  response: ReferenceParam;
  status: TokenParam;
}

export interface PaymentReconciliationSearchParams {
  created: DateParam;
  disposition: StringParam;
  identifier: TokenParam;
  outcome: TokenParam;
  "payment-issuer": ReferenceParam;
  request: ReferenceParam;
  requestor: ReferenceParam;
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
  email: TokenParam;
  gender: TokenParam;
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
  email: TokenParam;
  family: StringParam;
  gender: TokenParam;
  given: StringParam;
  identifier: TokenParam;
  name: StringParam;
  phone: TokenParam;
  phonetic: StringParam;
  telecom: TokenParam;
}

export interface PractitionerRoleSearchParams {
  active: TokenParam;
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
  status: TokenParam;
  subject: ReferenceParam;
}

export interface ProvenanceSearchParams {
  agent: ReferenceParam;
  "agent-role": TokenParam;
  "agent-type": TokenParam;
  entity: ReferenceParam;
  location: ReferenceParam;
  patient: ReferenceParam;
  recorded: DateParam;
  "signature-type": TokenParam;
  target: ReferenceParam;
  when: DateParam;
}

export interface QuestionnaireSearchParams {
  code: TokenParam;
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
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
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
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  questionnaire: ReferenceParam;
  source: ReferenceParam;
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
  gender: TokenParam;
  identifier: TokenParam;
  name: StringParam;
  patient: ReferenceParam;
  phone: TokenParam;
  phonetic: StringParam;
  relationship: TokenParam;
  telecom: TokenParam;
}

export interface RequestGroupSearchParams {
  author: ReferenceParam;
  authored: DateParam;
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

export interface ResearchDefinitionSearchParams {
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

export interface ResearchElementDefinitionSearchParams {
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

export interface ResearchStudySearchParams {
  category: TokenParam;
  date: DateParam;
  focus: TokenParam;
  identifier: TokenParam;
  keyword: TokenParam;
  location: TokenParam;
  partof: ReferenceParam;
  principalinvestigator: ReferenceParam;
  protocol: ReferenceParam;
  site: ReferenceParam;
  sponsor: ReferenceParam;
  status: TokenParam;
  title: StringParam;
}

export interface ResearchSubjectSearchParams {
  date: DateParam;
  identifier: TokenParam;
  individual: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  study: ReferenceParam;
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

export interface RiskEvidenceSynthesisSearchParams {
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

export interface ScheduleSearchParams {
  active: TokenParam;
  actor: ReferenceParam;
  date: DateParam;
  identifier: TokenParam;
  "service-category": TokenParam;
  "service-type": TokenParam;
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
  category: TokenParam;
  code: TokenParam;
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
  specialty: TokenParam;
  start: DateParam;
  status: TokenParam;
}

export interface SpecimenSearchParams {
  accession: TokenParam;
  bodysite: TokenParam;
  collected: DateParam;
  collector: ReferenceParam;
  container: TokenParam;
  "container-id": TokenParam;
  identifier: TokenParam;
  parent: ReferenceParam;
  patient: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  type: TokenParam;
}

export interface SpecimenDefinitionSearchParams {
  container: TokenParam;
  identifier: TokenParam;
  type: TokenParam;
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
  "ext-context": TokenParam;
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
  criteria: StringParam;
  payload: TokenParam;
  status: TokenParam;
  type: TokenParam;
  url: UriParam;
}

export interface SubstanceSearchParams {
  category: TokenParam;
  code: TokenParam;
  "container-identifier": TokenParam;
  expiry: DateParam;
  identifier: TokenParam;
  quantity: QuantityParam;
  status: TokenParam;
  "substance-reference": ReferenceParam;
}

export interface SubstanceSpecificationSearchParams {
  code: TokenParam;
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
  requester: ReferenceParam;
  status: TokenParam;
  subject: ReferenceParam;
  supplier: ReferenceParam;
}

export interface TaskSearchParams {
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
  owner: ReferenceParam;
  "part-of": ReferenceParam;
  patient: ReferenceParam;
  performer: TokenParam;
  period: DateParam;
  priority: TokenParam;
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
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface TestReportSearchParams {
  identifier: TokenParam;
  issued: DateParam;
  participant: UriParam;
  result: TokenParam;
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
  status: TokenParam;
  "testscript-capability": StringParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface ValueSetSearchParams {
  code: TokenParam;
  context: TokenParam;
  "context-quantity": QuantityParam;
  "context-type": TokenParam;
  "context-type-quantity": CompositeParam;
  "context-type-value": CompositeParam;
  date: DateParam;
  description: StringParam;
  expansion: UriParam;
  identifier: TokenParam;
  jurisdiction: TokenParam;
  name: StringParam;
  publisher: StringParam;
  reference: UriParam;
  status: TokenParam;
  title: StringParam;
  url: UriParam;
  version: TokenParam;
}

export interface VerificationResultSearchParams {
  target: ReferenceParam;
}

export interface VisionPrescriptionSearchParams {
  datewritten: DateParam;
  encounter: ReferenceParam;
  identifier: TokenParam;
  patient: ReferenceParam;
  prescriber: ReferenceParam;
  status: TokenParam;
}

import type { Account } from "./resources/account.js";
import type { ActivityDefinition } from "./resources/activity-definition.js";
import type { AdverseEvent } from "./resources/adverse-event.js";
import type { AllergyIntolerance } from "./resources/allergy-intolerance.js";
import type { Appointment } from "./resources/appointment.js";
import type { AppointmentResponse } from "./resources/appointment-response.js";
import type { AuditEvent } from "./resources/audit-event.js";
import type { Basic } from "./resources/basic.js";
import type { Binary } from "./resources/binary.js";
import type { BiologicallyDerivedProduct } from "./resources/biologically-derived-product.js";
import type { BodyStructure } from "./resources/body-structure.js";
import type { Bundle } from "./resources/bundle.js";
import type { CapabilityStatement } from "./resources/capability-statement.js";
import type { CarePlan } from "./resources/care-plan.js";
import type { CareTeam } from "./resources/care-team.js";
import type { CatalogEntry } from "./resources/catalog-entry.js";
import type { ChargeItem } from "./resources/charge-item.js";
import type { ChargeItemDefinition } from "./resources/charge-item-definition.js";
import type { Claim } from "./resources/claim.js";
import type { ClaimResponse } from "./resources/claim-response.js";
import type { ClinicalImpression } from "./resources/clinical-impression.js";
import type { CodeSystem } from "./resources/code-system.js";
import type { Communication } from "./resources/communication.js";
import type { CommunicationRequest } from "./resources/communication-request.js";
import type { CompartmentDefinition } from "./resources/compartment-definition.js";
import type { Composition } from "./resources/composition.js";
import type { ConceptMap } from "./resources/concept-map.js";
import type { Condition } from "./resources/condition.js";
import type { Consent } from "./resources/consent.js";
import type { Contract } from "./resources/contract.js";
import type { Coverage } from "./resources/coverage.js";
import type { CoverageEligibilityRequest } from "./resources/coverage-eligibility-request.js";
import type { CoverageEligibilityResponse } from "./resources/coverage-eligibility-response.js";
import type { DetectedIssue } from "./resources/detected-issue.js";
import type { Device } from "./resources/device.js";
import type { DeviceDefinition } from "./resources/device-definition.js";
import type { DeviceMetric } from "./resources/device-metric.js";
import type { DeviceRequest } from "./resources/device-request.js";
import type { DeviceUseStatement } from "./resources/device-use-statement.js";
import type { DiagnosticReport } from "./resources/diagnostic-report.js";
import type { DocumentManifest } from "./resources/document-manifest.js";
import type { DocumentReference } from "./resources/document-reference.js";
import type { EffectEvidenceSynthesis } from "./resources/effect-evidence-synthesis.js";
import type { Encounter } from "./resources/encounter.js";
import type { Endpoint } from "./resources/endpoint.js";
import type { EnrollmentRequest } from "./resources/enrollment-request.js";
import type { EnrollmentResponse } from "./resources/enrollment-response.js";
import type { EpisodeOfCare } from "./resources/episode-of-care.js";
import type { EventDefinition } from "./resources/event-definition.js";
import type { Evidence } from "./resources/evidence.js";
import type { EvidenceVariable } from "./resources/evidence-variable.js";
import type { ExampleScenario } from "./resources/example-scenario.js";
import type { ExplanationOfBenefit } from "./resources/explanation-of-benefit.js";
import type { FamilyMemberHistory } from "./resources/family-member-history.js";
import type { Flag } from "./resources/flag.js";
import type { Goal } from "./resources/goal.js";
import type { GraphDefinition } from "./resources/graph-definition.js";
import type { Group } from "./resources/group.js";
import type { GuidanceResponse } from "./resources/guidance-response.js";
import type { HealthcareService } from "./resources/healthcare-service.js";
import type { ImagingStudy } from "./resources/imaging-study.js";
import type { Immunization } from "./resources/immunization.js";
import type { ImmunizationEvaluation } from "./resources/immunization-evaluation.js";
import type { ImmunizationRecommendation } from "./resources/immunization-recommendation.js";
import type { ImplementationGuide } from "./resources/implementation-guide.js";
import type { InsurancePlan } from "./resources/insurance-plan.js";
import type { Invoice } from "./resources/invoice.js";
import type { Library } from "./resources/library.js";
import type { Linkage } from "./resources/linkage.js";
import type { List } from "./resources/list.js";
import type { Location } from "./resources/location.js";
import type { Measure } from "./resources/measure.js";
import type { MeasureReport } from "./resources/measure-report.js";
import type { Media } from "./resources/media.js";
import type { Medication } from "./resources/medication.js";
import type { MedicationAdministration } from "./resources/medication-administration.js";
import type { MedicationDispense } from "./resources/medication-dispense.js";
import type { MedicationKnowledge } from "./resources/medication-knowledge.js";
import type { MedicationRequest } from "./resources/medication-request.js";
import type { MedicationStatement } from "./resources/medication-statement.js";
import type { MedicinalProduct } from "./resources/medicinal-product.js";
import type { MedicinalProductAuthorization } from "./resources/medicinal-product-authorization.js";
import type { MedicinalProductContraindication } from "./resources/medicinal-product-contraindication.js";
import type { MedicinalProductIndication } from "./resources/medicinal-product-indication.js";
import type { MedicinalProductIngredient } from "./resources/medicinal-product-ingredient.js";
import type { MedicinalProductInteraction } from "./resources/medicinal-product-interaction.js";
import type { MedicinalProductManufactured } from "./resources/medicinal-product-manufactured.js";
import type { MedicinalProductPackaged } from "./resources/medicinal-product-packaged.js";
import type { MedicinalProductPharmaceutical } from "./resources/medicinal-product-pharmaceutical.js";
import type { MedicinalProductUndesirableEffect } from "./resources/medicinal-product-undesirable-effect.js";
import type { MessageDefinition } from "./resources/message-definition.js";
import type { MessageHeader } from "./resources/message-header.js";
import type { MolecularSequence } from "./resources/molecular-sequence.js";
import type { NamingSystem } from "./resources/naming-system.js";
import type { NutritionOrder } from "./resources/nutrition-order.js";
import type { Observation } from "./resources/observation.js";
import type { ObservationDefinition } from "./resources/observation-definition.js";
import type { OperationDefinition } from "./resources/operation-definition.js";
import type { OperationOutcome } from "./resources/operation-outcome.js";
import type { Organization } from "./resources/organization.js";
import type { OrganizationAffiliation } from "./resources/organization-affiliation.js";
import type { Parameters } from "./resources/parameters.js";
import type { Patient } from "./resources/patient.js";
import type { PaymentNotice } from "./resources/payment-notice.js";
import type { PaymentReconciliation } from "./resources/payment-reconciliation.js";
import type { Person } from "./resources/person.js";
import type { PlanDefinition } from "./resources/plan-definition.js";
import type { Practitioner } from "./resources/practitioner.js";
import type { PractitionerRole } from "./resources/practitioner-role.js";
import type { Procedure } from "./resources/procedure.js";
import type { Provenance } from "./resources/provenance.js";
import type { Questionnaire } from "./resources/questionnaire.js";
import type { QuestionnaireResponse } from "./resources/questionnaire-response.js";
import type { RelatedPerson } from "./resources/related-person.js";
import type { RequestGroup } from "./resources/request-group.js";
import type { ResearchDefinition } from "./resources/research-definition.js";
import type { ResearchElementDefinition } from "./resources/research-element-definition.js";
import type { ResearchStudy } from "./resources/research-study.js";
import type { ResearchSubject } from "./resources/research-subject.js";
import type { RiskAssessment } from "./resources/risk-assessment.js";
import type { RiskEvidenceSynthesis } from "./resources/risk-evidence-synthesis.js";
import type { Schedule } from "./resources/schedule.js";
import type { SearchParameter } from "./resources/search-parameter.js";
import type { ServiceRequest } from "./resources/service-request.js";
import type { Slot } from "./resources/slot.js";
import type { Specimen } from "./resources/specimen.js";
import type { SpecimenDefinition } from "./resources/specimen-definition.js";
import type { StructureDefinition } from "./resources/structure-definition.js";
import type { StructureMap } from "./resources/structure-map.js";
import type { Subscription } from "./resources/subscription.js";
import type { Substance } from "./resources/substance.js";
import type { SubstanceNucleicAcid } from "./resources/substance-nucleic-acid.js";
import type { SubstancePolymer } from "./resources/substance-polymer.js";
import type { SubstanceProtein } from "./resources/substance-protein.js";
import type { SubstanceReferenceInformation } from "./resources/substance-reference-information.js";
import type { SubstanceSourceMaterial } from "./resources/substance-source-material.js";
import type { SubstanceSpecification } from "./resources/substance-specification.js";
import type { SupplyDelivery } from "./resources/supply-delivery.js";
import type { SupplyRequest } from "./resources/supply-request.js";
import type { Task } from "./resources/task.js";
import type { TerminologyCapabilities } from "./resources/terminology-capabilities.js";
import type { TestReport } from "./resources/test-report.js";
import type { TestScript } from "./resources/test-script.js";
import type { ValueSet } from "./resources/value-set.js";
import type { VerificationResult } from "./resources/verification-result.js";
import type { VisionPrescription } from "./resources/vision-prescription.js";

import type {
  AccountSearchParams,
  ActivityDefinitionSearchParams,
  AdverseEventSearchParams,
  AllergyIntoleranceSearchParams,
  AppointmentResponseSearchParams,
  AppointmentSearchParams,
  AuditEventSearchParams,
  BasicSearchParams,
  BodyStructureSearchParams,
  BundleSearchParams,
  CapabilityStatementSearchParams,
  CarePlanSearchParams,
  CareTeamSearchParams,
  ChargeItemDefinitionSearchParams,
  ChargeItemSearchParams,
  ClaimResponseSearchParams,
  ClaimSearchParams,
  ClinicalImpressionSearchParams,
  CodeSystemSearchParams,
  CommunicationRequestSearchParams,
  CommunicationSearchParams,
  CompartmentDefinitionSearchParams,
  CompositionSearchParams,
  ConceptMapSearchParams,
  ConditionSearchParams,
  ConsentSearchParams,
  ContractSearchParams,
  CoverageEligibilityRequestSearchParams,
  CoverageEligibilityResponseSearchParams,
  CoverageSearchParams,
  DetectedIssueSearchParams,
  DeviceDefinitionSearchParams,
  DeviceMetricSearchParams,
  DeviceRequestSearchParams,
  DeviceSearchParams,
  DeviceUseStatementSearchParams,
  DiagnosticReportSearchParams,
  DocumentManifestSearchParams,
  DocumentReferenceSearchParams,
  EffectEvidenceSynthesisSearchParams,
  EncounterSearchParams,
  EndpointSearchParams,
  EnrollmentRequestSearchParams,
  EnrollmentResponseSearchParams,
  EpisodeOfCareSearchParams,
  EventDefinitionSearchParams,
  EvidenceSearchParams,
  EvidenceVariableSearchParams,
  ExampleScenarioSearchParams,
  ExplanationOfBenefitSearchParams,
  FamilyMemberHistorySearchParams,
  FlagSearchParams,
  GoalSearchParams,
  GraphDefinitionSearchParams,
  GroupSearchParams,
  GuidanceResponseSearchParams,
  HealthcareServiceSearchParams,
  ImagingStudySearchParams,
  ImmunizationEvaluationSearchParams,
  ImmunizationRecommendationSearchParams,
  ImmunizationSearchParams,
  ImplementationGuideSearchParams,
  InsurancePlanSearchParams,
  InvoiceSearchParams,
  LibrarySearchParams,
  LinkageSearchParams,
  ListSearchParams,
  LocationSearchParams,
  MeasureReportSearchParams,
  MeasureSearchParams,
  MediaSearchParams,
  MedicationAdministrationSearchParams,
  MedicationDispenseSearchParams,
  MedicationKnowledgeSearchParams,
  MedicationRequestSearchParams,
  MedicationSearchParams,
  MedicationStatementSearchParams,
  MedicinalProductAuthorizationSearchParams,
  MedicinalProductContraindicationSearchParams,
  MedicinalProductIndicationSearchParams,
  MedicinalProductInteractionSearchParams,
  MedicinalProductPackagedSearchParams,
  MedicinalProductPharmaceuticalSearchParams,
  MedicinalProductSearchParams,
  MedicinalProductUndesirableEffectSearchParams,
  MessageDefinitionSearchParams,
  MessageHeaderSearchParams,
  MolecularSequenceSearchParams,
  NamingSystemSearchParams,
  NutritionOrderSearchParams,
  ObservationSearchParams,
  OperationDefinitionSearchParams,
  OrganizationAffiliationSearchParams,
  OrganizationSearchParams,
  PatientSearchParams,
  PaymentNoticeSearchParams,
  PaymentReconciliationSearchParams,
  PersonSearchParams,
  PlanDefinitionSearchParams,
  PractitionerRoleSearchParams,
  PractitionerSearchParams,
  ProcedureSearchParams,
  ProvenanceSearchParams,
  QuestionnaireResponseSearchParams,
  QuestionnaireSearchParams,
  RelatedPersonSearchParams,
  RequestGroupSearchParams,
  ResearchDefinitionSearchParams,
  ResearchElementDefinitionSearchParams,
  ResearchStudySearchParams,
  ResearchSubjectSearchParams,
  RiskAssessmentSearchParams,
  RiskEvidenceSynthesisSearchParams,
  ScheduleSearchParams,
  SearchParameterSearchParams,
  ServiceRequestSearchParams,
  SlotSearchParams,
  SpecimenDefinitionSearchParams,
  SpecimenSearchParams,
  StructureDefinitionSearchParams,
  StructureMapSearchParams,
  SubscriptionSearchParams,
  SubstanceSearchParams,
  SubstanceSpecificationSearchParams,
  SupplyDeliverySearchParams,
  SupplyRequestSearchParams,
  TaskSearchParams,
  TerminologyCapabilitiesSearchParams,
  TestReportSearchParams,
  TestScriptSearchParams,
  ValueSetSearchParams,
  VerificationResultSearchParams,
  VisionPrescriptionSearchParams,
} from "./search-params.js";

export interface FhirResourceMap {
  Account: Account;
  ActivityDefinition: ActivityDefinition;
  AdverseEvent: AdverseEvent;
  AllergyIntolerance: AllergyIntolerance;
  Appointment: Appointment;
  AppointmentResponse: AppointmentResponse;
  AuditEvent: AuditEvent;
  Basic: Basic;
  Binary: Binary;
  BiologicallyDerivedProduct: BiologicallyDerivedProduct;
  BodyStructure: BodyStructure;
  Bundle: Bundle;
  CapabilityStatement: CapabilityStatement;
  CarePlan: CarePlan;
  CareTeam: CareTeam;
  CatalogEntry: CatalogEntry;
  ChargeItem: ChargeItem;
  ChargeItemDefinition: ChargeItemDefinition;
  Claim: Claim;
  ClaimResponse: ClaimResponse;
  ClinicalImpression: ClinicalImpression;
  CodeSystem: CodeSystem;
  Communication: Communication;
  CommunicationRequest: CommunicationRequest;
  CompartmentDefinition: CompartmentDefinition;
  Composition: Composition;
  ConceptMap: ConceptMap;
  Condition: Condition;
  Consent: Consent;
  Contract: Contract;
  Coverage: Coverage;
  CoverageEligibilityRequest: CoverageEligibilityRequest;
  CoverageEligibilityResponse: CoverageEligibilityResponse;
  DetectedIssue: DetectedIssue;
  Device: Device;
  DeviceDefinition: DeviceDefinition;
  DeviceMetric: DeviceMetric;
  DeviceRequest: DeviceRequest;
  DeviceUseStatement: DeviceUseStatement;
  DiagnosticReport: DiagnosticReport;
  DocumentManifest: DocumentManifest;
  DocumentReference: DocumentReference;
  EffectEvidenceSynthesis: EffectEvidenceSynthesis;
  Encounter: Encounter;
  Endpoint: Endpoint;
  EnrollmentRequest: EnrollmentRequest;
  EnrollmentResponse: EnrollmentResponse;
  EpisodeOfCare: EpisodeOfCare;
  EventDefinition: EventDefinition;
  Evidence: Evidence;
  EvidenceVariable: EvidenceVariable;
  ExampleScenario: ExampleScenario;
  ExplanationOfBenefit: ExplanationOfBenefit;
  FamilyMemberHistory: FamilyMemberHistory;
  Flag: Flag;
  Goal: Goal;
  GraphDefinition: GraphDefinition;
  Group: Group;
  GuidanceResponse: GuidanceResponse;
  HealthcareService: HealthcareService;
  ImagingStudy: ImagingStudy;
  Immunization: Immunization;
  ImmunizationEvaluation: ImmunizationEvaluation;
  ImmunizationRecommendation: ImmunizationRecommendation;
  ImplementationGuide: ImplementationGuide;
  InsurancePlan: InsurancePlan;
  Invoice: Invoice;
  Library: Library;
  Linkage: Linkage;
  List: List;
  Location: Location;
  Measure: Measure;
  MeasureReport: MeasureReport;
  Media: Media;
  Medication: Medication;
  MedicationAdministration: MedicationAdministration;
  MedicationDispense: MedicationDispense;
  MedicationKnowledge: MedicationKnowledge;
  MedicationRequest: MedicationRequest;
  MedicationStatement: MedicationStatement;
  MedicinalProduct: MedicinalProduct;
  MedicinalProductAuthorization: MedicinalProductAuthorization;
  MedicinalProductContraindication: MedicinalProductContraindication;
  MedicinalProductIndication: MedicinalProductIndication;
  MedicinalProductIngredient: MedicinalProductIngredient;
  MedicinalProductInteraction: MedicinalProductInteraction;
  MedicinalProductManufactured: MedicinalProductManufactured;
  MedicinalProductPackaged: MedicinalProductPackaged;
  MedicinalProductPharmaceutical: MedicinalProductPharmaceutical;
  MedicinalProductUndesirableEffect: MedicinalProductUndesirableEffect;
  MessageDefinition: MessageDefinition;
  MessageHeader: MessageHeader;
  MolecularSequence: MolecularSequence;
  NamingSystem: NamingSystem;
  NutritionOrder: NutritionOrder;
  Observation: Observation;
  ObservationDefinition: ObservationDefinition;
  OperationDefinition: OperationDefinition;
  OperationOutcome: OperationOutcome;
  Organization: Organization;
  OrganizationAffiliation: OrganizationAffiliation;
  Parameters: Parameters;
  Patient: Patient;
  PaymentNotice: PaymentNotice;
  PaymentReconciliation: PaymentReconciliation;
  Person: Person;
  PlanDefinition: PlanDefinition;
  Practitioner: Practitioner;
  PractitionerRole: PractitionerRole;
  Procedure: Procedure;
  Provenance: Provenance;
  Questionnaire: Questionnaire;
  QuestionnaireResponse: QuestionnaireResponse;
  RelatedPerson: RelatedPerson;
  RequestGroup: RequestGroup;
  ResearchDefinition: ResearchDefinition;
  ResearchElementDefinition: ResearchElementDefinition;
  ResearchStudy: ResearchStudy;
  ResearchSubject: ResearchSubject;
  RiskAssessment: RiskAssessment;
  RiskEvidenceSynthesis: RiskEvidenceSynthesis;
  Schedule: Schedule;
  SearchParameter: SearchParameter;
  ServiceRequest: ServiceRequest;
  Slot: Slot;
  Specimen: Specimen;
  SpecimenDefinition: SpecimenDefinition;
  StructureDefinition: StructureDefinition;
  StructureMap: StructureMap;
  Subscription: Subscription;
  Substance: Substance;
  SubstanceNucleicAcid: SubstanceNucleicAcid;
  SubstancePolymer: SubstancePolymer;
  SubstanceProtein: SubstanceProtein;
  SubstanceReferenceInformation: SubstanceReferenceInformation;
  SubstanceSourceMaterial: SubstanceSourceMaterial;
  SubstanceSpecification: SubstanceSpecification;
  SupplyDelivery: SupplyDelivery;
  SupplyRequest: SupplyRequest;
  Task: Task;
  TerminologyCapabilities: TerminologyCapabilities;
  TestReport: TestReport;
  TestScript: TestScript;
  ValueSet: ValueSet;
  VerificationResult: VerificationResult;
  VisionPrescription: VisionPrescription;
}

export type ResourceType = keyof FhirResourceMap;

export interface SearchParamRegistry {
  Account: AccountSearchParams;
  ActivityDefinition: ActivityDefinitionSearchParams;
  AdverseEvent: AdverseEventSearchParams;
  AllergyIntolerance: AllergyIntoleranceSearchParams;
  Appointment: AppointmentSearchParams;
  AppointmentResponse: AppointmentResponseSearchParams;
  AuditEvent: AuditEventSearchParams;
  Basic: BasicSearchParams;
  BodyStructure: BodyStructureSearchParams;
  Bundle: BundleSearchParams;
  CapabilityStatement: CapabilityStatementSearchParams;
  CarePlan: CarePlanSearchParams;
  CareTeam: CareTeamSearchParams;
  ChargeItem: ChargeItemSearchParams;
  ChargeItemDefinition: ChargeItemDefinitionSearchParams;
  Claim: ClaimSearchParams;
  ClaimResponse: ClaimResponseSearchParams;
  ClinicalImpression: ClinicalImpressionSearchParams;
  CodeSystem: CodeSystemSearchParams;
  Communication: CommunicationSearchParams;
  CommunicationRequest: CommunicationRequestSearchParams;
  CompartmentDefinition: CompartmentDefinitionSearchParams;
  Composition: CompositionSearchParams;
  ConceptMap: ConceptMapSearchParams;
  Condition: ConditionSearchParams;
  Consent: ConsentSearchParams;
  Contract: ContractSearchParams;
  Coverage: CoverageSearchParams;
  CoverageEligibilityRequest: CoverageEligibilityRequestSearchParams;
  CoverageEligibilityResponse: CoverageEligibilityResponseSearchParams;
  DetectedIssue: DetectedIssueSearchParams;
  Device: DeviceSearchParams;
  DeviceDefinition: DeviceDefinitionSearchParams;
  DeviceMetric: DeviceMetricSearchParams;
  DeviceRequest: DeviceRequestSearchParams;
  DeviceUseStatement: DeviceUseStatementSearchParams;
  DiagnosticReport: DiagnosticReportSearchParams;
  DocumentManifest: DocumentManifestSearchParams;
  DocumentReference: DocumentReferenceSearchParams;
  EffectEvidenceSynthesis: EffectEvidenceSynthesisSearchParams;
  Encounter: EncounterSearchParams;
  Endpoint: EndpointSearchParams;
  EnrollmentRequest: EnrollmentRequestSearchParams;
  EnrollmentResponse: EnrollmentResponseSearchParams;
  EpisodeOfCare: EpisodeOfCareSearchParams;
  EventDefinition: EventDefinitionSearchParams;
  Evidence: EvidenceSearchParams;
  EvidenceVariable: EvidenceVariableSearchParams;
  ExampleScenario: ExampleScenarioSearchParams;
  ExplanationOfBenefit: ExplanationOfBenefitSearchParams;
  FamilyMemberHistory: FamilyMemberHistorySearchParams;
  Flag: FlagSearchParams;
  Goal: GoalSearchParams;
  GraphDefinition: GraphDefinitionSearchParams;
  Group: GroupSearchParams;
  GuidanceResponse: GuidanceResponseSearchParams;
  HealthcareService: HealthcareServiceSearchParams;
  ImagingStudy: ImagingStudySearchParams;
  Immunization: ImmunizationSearchParams;
  ImmunizationEvaluation: ImmunizationEvaluationSearchParams;
  ImmunizationRecommendation: ImmunizationRecommendationSearchParams;
  ImplementationGuide: ImplementationGuideSearchParams;
  InsurancePlan: InsurancePlanSearchParams;
  Invoice: InvoiceSearchParams;
  Library: LibrarySearchParams;
  Linkage: LinkageSearchParams;
  List: ListSearchParams;
  Location: LocationSearchParams;
  Measure: MeasureSearchParams;
  MeasureReport: MeasureReportSearchParams;
  Media: MediaSearchParams;
  Medication: MedicationSearchParams;
  MedicationAdministration: MedicationAdministrationSearchParams;
  MedicationDispense: MedicationDispenseSearchParams;
  MedicationKnowledge: MedicationKnowledgeSearchParams;
  MedicationRequest: MedicationRequestSearchParams;
  MedicationStatement: MedicationStatementSearchParams;
  MedicinalProduct: MedicinalProductSearchParams;
  MedicinalProductAuthorization: MedicinalProductAuthorizationSearchParams;
  MedicinalProductContraindication: MedicinalProductContraindicationSearchParams;
  MedicinalProductIndication: MedicinalProductIndicationSearchParams;
  MedicinalProductInteraction: MedicinalProductInteractionSearchParams;
  MedicinalProductPackaged: MedicinalProductPackagedSearchParams;
  MedicinalProductPharmaceutical: MedicinalProductPharmaceuticalSearchParams;
  MedicinalProductUndesirableEffect: MedicinalProductUndesirableEffectSearchParams;
  MessageDefinition: MessageDefinitionSearchParams;
  MessageHeader: MessageHeaderSearchParams;
  MolecularSequence: MolecularSequenceSearchParams;
  NamingSystem: NamingSystemSearchParams;
  NutritionOrder: NutritionOrderSearchParams;
  Observation: ObservationSearchParams;
  OperationDefinition: OperationDefinitionSearchParams;
  Organization: OrganizationSearchParams;
  OrganizationAffiliation: OrganizationAffiliationSearchParams;
  Patient: PatientSearchParams;
  PaymentNotice: PaymentNoticeSearchParams;
  PaymentReconciliation: PaymentReconciliationSearchParams;
  Person: PersonSearchParams;
  PlanDefinition: PlanDefinitionSearchParams;
  Practitioner: PractitionerSearchParams;
  PractitionerRole: PractitionerRoleSearchParams;
  Procedure: ProcedureSearchParams;
  Provenance: ProvenanceSearchParams;
  Questionnaire: QuestionnaireSearchParams;
  QuestionnaireResponse: QuestionnaireResponseSearchParams;
  RelatedPerson: RelatedPersonSearchParams;
  RequestGroup: RequestGroupSearchParams;
  ResearchDefinition: ResearchDefinitionSearchParams;
  ResearchElementDefinition: ResearchElementDefinitionSearchParams;
  ResearchStudy: ResearchStudySearchParams;
  ResearchSubject: ResearchSubjectSearchParams;
  RiskAssessment: RiskAssessmentSearchParams;
  RiskEvidenceSynthesis: RiskEvidenceSynthesisSearchParams;
  Schedule: ScheduleSearchParams;
  SearchParameter: SearchParameterSearchParams;
  ServiceRequest: ServiceRequestSearchParams;
  Slot: SlotSearchParams;
  Specimen: SpecimenSearchParams;
  SpecimenDefinition: SpecimenDefinitionSearchParams;
  StructureDefinition: StructureDefinitionSearchParams;
  StructureMap: StructureMapSearchParams;
  Subscription: SubscriptionSearchParams;
  Substance: SubstanceSearchParams;
  SubstanceSpecification: SubstanceSpecificationSearchParams;
  SupplyDelivery: SupplyDeliverySearchParams;
  SupplyRequest: SupplyRequestSearchParams;
  Task: TaskSearchParams;
  TerminologyCapabilities: TerminologyCapabilitiesSearchParams;
  TestReport: TestReportSearchParams;
  TestScript: TestScriptSearchParams;
  ValueSet: ValueSetSearchParams;
  VerificationResult: VerificationResultSearchParams;
  VisionPrescription: VisionPrescriptionSearchParams;
}

export interface IncludeRegistry {
  Account: {
    owner: "Organization";
    patient: "Patient";
    subject:
      | "Practitioner"
      | "Organization"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "Location";
  };
  ActivityDefinition: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Library"
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  AdverseEvent: {
    location: "Location";
    recorder: "Practitioner" | "Patient" | "PractitionerRole" | "RelatedPerson";
    resultingcondition: "Condition";
    study: "ResearchStudy";
    subject: "Practitioner" | "Group" | "Patient" | "RelatedPerson";
    substance:
      | "Immunization"
      | "Device"
      | "Medication"
      | "Procedure"
      | "Substance"
      | "MedicationAdministration"
      | "MedicationStatement";
  };
  AllergyIntolerance: {
    asserter: "Practitioner" | "Patient" | "PractitionerRole" | "RelatedPerson";
    patient: "Patient" | "Group";
    recorder: "Practitioner" | "Patient" | "PractitionerRole" | "RelatedPerson";
  };
  Appointment: {
    actor:
      | "Practitioner"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson"
      | "Location";
    "based-on": "ServiceRequest";
    location: "Location";
    patient: "Patient";
    practitioner: "Practitioner";
    "reason-reference": "Condition" | "Observation" | "Procedure" | "ImmunizationRecommendation";
    slot: "Slot";
    "supporting-info":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  AppointmentResponse: {
    actor:
      | "Practitioner"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson"
      | "Location";
    appointment: "Appointment";
    location: "Location";
    patient: "Patient";
    practitioner: "Practitioner";
  };
  AuditEvent: {
    agent: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    entity:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient";
    source: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
  };
  Basic: {
    author: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    patient: "Patient";
    subject:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  BodyStructure: {
    patient: "Patient";
  };
  Bundle: {
    composition: "Composition";
    message: "MessageHeader";
  };
  CapabilityStatement: {
    guide: "ImplementationGuide";
    "resource-profile": "StructureDefinition";
    "supported-profile": "StructureDefinition";
  };
  CarePlan: {
    "activity-reference":
      | "Appointment"
      | "MedicationRequest"
      | "Task"
      | "NutritionOrder"
      | "RequestGroup"
      | "VisionPrescription"
      | "DeviceRequest"
      | "ServiceRequest"
      | "CommunicationRequest";
    "based-on": "CarePlan";
    "care-team": "CareTeam";
    condition: "Condition";
    encounter: "Encounter";
    goal: "Goal";
    "instantiates-canonical":
      | "Questionnaire"
      | "Measure"
      | "PlanDefinition"
      | "OperationDefinition"
      | "ActivityDefinition";
    "part-of": "CarePlan";
    patient: "Patient" | "Group";
    performer:
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    replaces: "CarePlan";
    subject: "Group" | "Patient";
  };
  CareTeam: {
    encounter: "Encounter";
    participant: "Practitioner" | "Organization" | "CareTeam" | "Patient" | "PractitionerRole" | "RelatedPerson";
    patient: "Patient" | "Group";
    subject: "Group" | "Patient";
  };
  ChargeItem: {
    account: "Account";
    context: "EpisodeOfCare" | "Encounter";
    enterer: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    patient: "Patient";
    "performer-actor":
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "PractitionerRole"
      | "RelatedPerson";
    "performing-organization": "Organization";
    "requesting-organization": "Organization";
    service:
      | "Immunization"
      | "MedicationDispense"
      | "SupplyDelivery"
      | "Observation"
      | "DiagnosticReport"
      | "ImagingStudy"
      | "MedicationAdministration"
      | "Procedure";
    subject: "Group" | "Patient";
  };
  Claim: {
    "care-team": "Practitioner" | "Organization" | "PractitionerRole";
    "detail-udi": "Device";
    encounter: "Encounter";
    enterer: "Practitioner" | "PractitionerRole";
    facility: "Location";
    insurer: "Organization";
    "item-udi": "Device";
    patient: "Patient";
    payee: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    "procedure-udi": "Device";
    provider: "Practitioner" | "Organization" | "PractitionerRole";
    "subdetail-udi": "Device";
  };
  ClaimResponse: {
    insurer: "Organization";
    patient: "Patient";
    request: "Claim";
    requestor: "Practitioner" | "Organization" | "PractitionerRole";
  };
  ClinicalImpression: {
    assessor: "Practitioner" | "PractitionerRole";
    encounter: "Encounter";
    "finding-ref": "Condition" | "Observation" | "Media";
    investigation:
      | "RiskAssessment"
      | "FamilyMemberHistory"
      | "Observation"
      | "Media"
      | "DiagnosticReport"
      | "ImagingStudy"
      | "QuestionnaireResponse";
    patient: "Patient" | "Group";
    previous: "ClinicalImpression";
    problem: "Condition" | "AllergyIntolerance";
    subject: "Group" | "Patient";
    "supporting-info":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  CodeSystem: {
    supplements: "CodeSystem";
  };
  Communication: {
    "based-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    encounter: "Encounter";
    "instantiates-canonical":
      | "Questionnaire"
      | "Measure"
      | "PlanDefinition"
      | "OperationDefinition"
      | "ActivityDefinition";
    "part-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient";
    recipient:
      | "Practitioner"
      | "Group"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    sender:
      | "Practitioner"
      | "Organization"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    subject: "Group" | "Patient";
  };
  CommunicationRequest: {
    "based-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    encounter: "Encounter";
    patient: "Patient";
    recipient:
      | "Practitioner"
      | "Group"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    replaces: "CommunicationRequest";
    requester: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    sender:
      | "Practitioner"
      | "Organization"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    subject: "Group" | "Patient";
  };
  Composition: {
    attester: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    author: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    encounter: "Encounter" | "EpisodeOfCare";
    entry:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient" | "Group";
    "related-ref": "Composition";
    subject:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  ConceptMap: {
    other: "ConceptMap";
    source: "ValueSet";
    "source-uri": "ValueSet";
    target: "ValueSet";
    "target-uri": "ValueSet";
  };
  Condition: {
    asserter: "Practitioner" | "Patient" | "PractitionerRole" | "RelatedPerson";
    encounter: "Encounter";
    "evidence-detail":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient" | "Group";
    subject: "Group" | "Patient";
  };
  Consent: {
    actor:
      | "Practitioner"
      | "Group"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "PractitionerRole"
      | "RelatedPerson";
    consentor: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    data:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    organization: "Organization";
    patient: "Patient" | "Group";
    "source-reference": "Consent" | "Contract" | "QuestionnaireResponse" | "DocumentReference";
  };
  Contract: {
    authority: "Organization";
    domain: "Location";
    patient: "Patient";
    signer: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    subject:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  Coverage: {
    beneficiary: "Patient";
    patient: "Patient";
    payor: "Organization" | "Patient" | "RelatedPerson";
    "policy-holder": "Organization" | "Patient" | "RelatedPerson";
    subscriber: "Patient" | "RelatedPerson";
  };
  CoverageEligibilityRequest: {
    enterer: "Practitioner" | "PractitionerRole";
    facility: "Location";
    patient: "Patient";
    provider: "Practitioner" | "Organization" | "PractitionerRole";
  };
  CoverageEligibilityResponse: {
    insurer: "Organization";
    patient: "Patient";
    request: "CoverageEligibilityRequest";
    requestor: "Practitioner" | "Organization" | "PractitionerRole";
  };
  DetectedIssue: {
    author: "Practitioner" | "Device" | "PractitionerRole";
    implicated:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient" | "Group";
  };
  Device: {
    location: "Location";
    organization: "Organization";
    patient: "Patient";
  };
  DeviceDefinition: {
    parent: "DeviceDefinition";
  };
  DeviceMetric: {
    parent: "Device";
    source: "Device";
  };
  DeviceRequest: {
    "based-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    device: "Device";
    encounter: "Encounter" | "EpisodeOfCare";
    "instantiates-canonical": "PlanDefinition" | "ActivityDefinition";
    insurance: "ClaimResponse" | "Coverage";
    patient: "Patient" | "Group";
    performer:
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    "prior-request":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    requester: "Practitioner" | "Organization" | "Device" | "PractitionerRole";
    subject: "Group" | "Device" | "Patient" | "Location";
  };
  DeviceUseStatement: {
    device: "Device";
    patient: "Patient" | "Group";
    subject: "Group" | "Patient";
  };
  DiagnosticReport: {
    "based-on": "CarePlan" | "MedicationRequest" | "NutritionOrder" | "ServiceRequest" | "ImmunizationRecommendation";
    encounter: "Encounter" | "EpisodeOfCare";
    media: "Media";
    patient: "Patient" | "Group";
    performer: "Practitioner" | "Organization" | "CareTeam" | "PractitionerRole";
    result: "Observation";
    "results-interpreter": "Practitioner" | "Organization" | "CareTeam" | "PractitionerRole";
    specimen: "Specimen";
    subject: "Group" | "Device" | "Patient" | "Location";
  };
  DocumentManifest: {
    author: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    item:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient" | "Group";
    recipient: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    "related-ref":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    subject: "Practitioner" | "Group" | "Device" | "Patient";
  };
  DocumentReference: {
    authenticator: "Practitioner" | "Organization" | "PractitionerRole";
    author: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    custodian: "Organization";
    encounter: "Encounter" | "EpisodeOfCare";
    patient: "Patient" | "Group";
    related:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    relatesto: "DocumentReference";
    subject: "Practitioner" | "Group" | "Device" | "Patient";
  };
  Encounter: {
    account: "Account";
    appointment: "Appointment";
    "based-on": "ServiceRequest";
    diagnosis: "Condition" | "Procedure";
    "episode-of-care": "EpisodeOfCare";
    location: "Location";
    "part-of": "Encounter";
    participant: "Practitioner" | "PractitionerRole" | "RelatedPerson";
    patient: "Patient" | "Group";
    practitioner: "Practitioner";
    "reason-reference": "Condition" | "Observation" | "Procedure" | "ImmunizationRecommendation";
    "service-provider": "Organization";
    subject: "Group" | "Patient";
  };
  Endpoint: {
    organization: "Organization";
  };
  EnrollmentRequest: {
    patient: "Patient";
    subject: "Patient";
  };
  EnrollmentResponse: {
    request: "EnrollmentRequest";
  };
  EpisodeOfCare: {
    "care-manager": "Practitioner";
    condition: "Condition";
    "incoming-referral": "ServiceRequest";
    organization: "Organization";
    patient: "Patient" | "Group";
  };
  EventDefinition: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  Evidence: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  EvidenceVariable: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  ExplanationOfBenefit: {
    "care-team": "Practitioner" | "Organization" | "PractitionerRole";
    claim: "Claim";
    coverage: "Coverage";
    "detail-udi": "Device";
    encounter: "Encounter";
    enterer: "Practitioner" | "PractitionerRole";
    facility: "Location";
    "item-udi": "Device";
    patient: "Patient";
    payee: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    "procedure-udi": "Device";
    provider: "Practitioner" | "Organization" | "PractitionerRole";
    "subdetail-udi": "Device";
  };
  FamilyMemberHistory: {
    "instantiates-canonical":
      | "Questionnaire"
      | "Measure"
      | "PlanDefinition"
      | "OperationDefinition"
      | "ActivityDefinition";
    patient: "Patient" | "Group";
  };
  Flag: {
    author: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole";
    encounter: "Encounter" | "EpisodeOfCare";
    patient: "Patient" | "Group";
    subject:
      | "Practitioner"
      | "Group"
      | "Organization"
      | "Medication"
      | "Patient"
      | "PlanDefinition"
      | "Procedure"
      | "Location";
  };
  Goal: {
    patient: "Patient" | "Group";
    subject: "Group" | "Organization" | "Patient";
  };
  Group: {
    "managing-entity": "Practitioner" | "Organization" | "PractitionerRole" | "RelatedPerson";
    member: "Practitioner" | "Group" | "Device" | "Medication" | "Patient" | "Substance" | "PractitionerRole";
  };
  GuidanceResponse: {
    patient: "Patient";
    subject: "Group" | "Patient";
  };
  HealthcareService: {
    "coverage-area": "Location";
    endpoint: "Endpoint";
    location: "Location";
    organization: "Organization";
  };
  ImagingStudy: {
    basedon: "Appointment" | "AppointmentResponse" | "CarePlan" | "Task" | "ServiceRequest";
    encounter: "Encounter";
    endpoint: "Endpoint";
    interpreter: "Practitioner" | "PractitionerRole";
    patient: "Patient" | "Group";
    performer:
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "PractitionerRole"
      | "RelatedPerson";
    referrer: "Practitioner" | "PractitionerRole";
    subject: "Group" | "Device" | "Patient";
  };
  Immunization: {
    location: "Location";
    manufacturer: "Organization";
    patient: "Patient" | "Group";
    performer: "Practitioner" | "Organization" | "PractitionerRole";
    reaction: "Observation";
    "reason-reference": "Condition" | "Observation" | "DiagnosticReport";
  };
  ImmunizationEvaluation: {
    "immunization-event": "Immunization";
    patient: "Patient";
  };
  ImmunizationRecommendation: {
    information:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient";
    support: "Immunization" | "ImmunizationEvaluation";
  };
  ImplementationGuide: {
    "depends-on": "ImplementationGuide";
    global: "StructureDefinition";
    resource:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  InsurancePlan: {
    "administered-by": "Organization";
    endpoint: "Endpoint";
    "owned-by": "Organization";
  };
  Invoice: {
    account: "Account";
    issuer: "Organization";
    participant: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    patient: "Patient";
    recipient: "Organization" | "Patient" | "RelatedPerson";
    subject: "Group" | "Patient";
  };
  Library: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  Linkage: {
    author: "Practitioner" | "Organization" | "PractitionerRole";
    item:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    source:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  List: {
    encounter: "Encounter" | "EpisodeOfCare";
    item:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    patient: "Patient" | "Group";
    source: "Practitioner" | "Device" | "Patient" | "PractitionerRole";
    subject: "Group" | "Device" | "Patient" | "Location";
  };
  Location: {
    endpoint: "Endpoint";
    organization: "Organization";
    partof: "Location";
  };
  Measure: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Library"
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  MeasureReport: {
    "evaluated-resource":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    measure: "Measure";
    patient: "Patient";
    reporter: "Practitioner" | "Organization" | "PractitionerRole" | "Location";
    subject: "Practitioner" | "Group" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson" | "Location";
  };
  Media: {
    "based-on": "CarePlan" | "ServiceRequest";
    device: "Device" | "DeviceMetric";
    encounter: "Encounter";
    operator:
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "PractitionerRole"
      | "RelatedPerson";
    patient: "Patient";
    subject: "Practitioner" | "Group" | "Specimen" | "Device" | "Patient" | "PractitionerRole" | "Location";
  };
  Medication: {
    ingredient: "Medication" | "Substance";
    manufacturer: "Organization";
  };
  MedicationAdministration: {
    context: "EpisodeOfCare" | "Encounter";
    device: "Device";
    medication: "Medication";
    patient: "Patient" | "Group";
    performer: "Practitioner" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    request: "MedicationRequest";
    subject: "Group" | "Patient";
  };
  MedicationDispense: {
    context: "EpisodeOfCare" | "Encounter";
    destination: "Location";
    medication: "Medication";
    patient: "Patient" | "Group";
    performer: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    prescription: "MedicationRequest";
    receiver: "Practitioner" | "Patient";
    responsibleparty: "Practitioner" | "PractitionerRole";
    subject: "Group" | "Patient";
  };
  MedicationKnowledge: {
    ingredient: "Substance";
    manufacturer: "Organization";
    monograph: "Media" | "DocumentReference";
  };
  MedicationRequest: {
    encounter: "Encounter";
    "intended-dispenser": "Organization";
    "intended-performer":
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "PractitionerRole"
      | "RelatedPerson";
    medication: "Medication";
    patient: "Patient" | "Group";
    requester: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    subject: "Group" | "Patient";
  };
  MedicationStatement: {
    context: "EpisodeOfCare" | "Encounter";
    medication: "Medication";
    "part-of": "MedicationDispense" | "Observation" | "MedicationAdministration" | "Procedure" | "MedicationStatement";
    patient: "Patient" | "Group";
    source: "Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "RelatedPerson";
    subject: "Group" | "Patient";
  };
  MedicinalProductAuthorization: {
    holder: "Organization";
    subject: "MedicinalProductPackaged" | "MedicinalProduct";
  };
  MedicinalProductContraindication: {
    subject: "Medication" | "MedicinalProduct";
  };
  MedicinalProductIndication: {
    subject: "Medication" | "MedicinalProduct";
  };
  MedicinalProductInteraction: {
    subject: "Medication" | "Substance" | "MedicinalProduct";
  };
  MedicinalProductPackaged: {
    subject: "MedicinalProduct";
  };
  MedicinalProductUndesirableEffect: {
    subject: "Medication" | "MedicinalProduct";
  };
  MessageDefinition: {
    parent: "PlanDefinition" | "ActivityDefinition";
  };
  MessageHeader: {
    author: "Practitioner" | "PractitionerRole";
    enterer: "Practitioner" | "PractitionerRole";
    focus:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    receiver: "Practitioner" | "Organization" | "PractitionerRole";
    responsible: "Practitioner" | "Organization" | "PractitionerRole";
    sender: "Practitioner" | "Organization" | "PractitionerRole";
    target: "Device";
  };
  MolecularSequence: {
    patient: "Patient";
  };
  NutritionOrder: {
    encounter: "Encounter" | "EpisodeOfCare";
    "instantiates-canonical": "PlanDefinition" | "ActivityDefinition";
    patient: "Patient" | "Group";
    provider: "Practitioner" | "PractitionerRole";
  };
  Observation: {
    "based-on":
      | "CarePlan"
      | "MedicationRequest"
      | "NutritionOrder"
      | "DeviceRequest"
      | "ServiceRequest"
      | "ImmunizationRecommendation";
    "derived-from":
      | "Media"
      | "Observation"
      | "ImagingStudy"
      | "MolecularSequence"
      | "QuestionnaireResponse"
      | "DocumentReference";
    device: "Device" | "DeviceMetric";
    encounter: "Encounter" | "EpisodeOfCare";
    focus:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "has-member": "Observation" | "MolecularSequence" | "QuestionnaireResponse";
    "part-of":
      | "Immunization"
      | "MedicationDispense"
      | "MedicationAdministration"
      | "Procedure"
      | "ImagingStudy"
      | "MedicationStatement";
    patient: "Patient" | "Group";
    performer: "Practitioner" | "Organization" | "CareTeam" | "Patient" | "PractitionerRole" | "RelatedPerson";
    specimen: "Specimen";
    subject: "Group" | "Device" | "Patient" | "Location";
  };
  OperationDefinition: {
    base: "OperationDefinition";
    "input-profile": "StructureDefinition";
    "output-profile": "StructureDefinition";
  };
  Organization: {
    endpoint: "Endpoint";
    partof: "Organization";
  };
  OrganizationAffiliation: {
    endpoint: "Endpoint";
    location: "Location";
    network: "Organization";
    "participating-organization": "Organization";
    "primary-organization": "Organization";
    service: "HealthcareService";
  };
  Patient: {
    "general-practitioner": "Practitioner" | "Organization" | "PractitionerRole";
    link: "Patient" | "RelatedPerson";
    organization: "Organization";
  };
  PaymentNotice: {
    provider: "Practitioner" | "Organization" | "PractitionerRole";
    request:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    response:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  PaymentReconciliation: {
    "payment-issuer": "Organization";
    request: "Task";
    requestor: "Practitioner" | "Organization" | "PractitionerRole";
  };
  Person: {
    link: "Practitioner" | "Patient" | "Person" | "RelatedPerson";
    organization: "Organization";
    patient: "Patient";
    practitioner: "Practitioner";
    relatedperson: "RelatedPerson";
  };
  PlanDefinition: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    definition: "Questionnaire" | "PlanDefinition" | "ActivityDefinition";
    "depends-on":
      | "Library"
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  PractitionerRole: {
    endpoint: "Endpoint";
    location: "Location";
    organization: "Organization";
    practitioner: "Practitioner";
    service: "HealthcareService";
  };
  Procedure: {
    "based-on": "CarePlan" | "ServiceRequest";
    encounter: "Encounter" | "EpisodeOfCare";
    "instantiates-canonical":
      | "Questionnaire"
      | "Measure"
      | "PlanDefinition"
      | "OperationDefinition"
      | "ActivityDefinition";
    location: "Location";
    "part-of": "Observation" | "Procedure" | "MedicationAdministration";
    patient: "Patient" | "Group";
    performer: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    "reason-reference": "Condition" | "Observation" | "Procedure" | "DiagnosticReport" | "DocumentReference";
    subject: "Group" | "Patient";
  };
  Provenance: {
    agent: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    entity:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    location: "Location";
    patient: "Patient";
    target:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  QuestionnaireResponse: {
    author: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    "based-on": "CarePlan" | "ServiceRequest";
    encounter: "Encounter";
    "part-of": "Observation" | "Procedure";
    patient: "Patient";
    questionnaire: "Questionnaire";
    source: "Practitioner" | "Patient" | "PractitionerRole" | "RelatedPerson";
    subject:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  RelatedPerson: {
    patient: "Patient";
  };
  RequestGroup: {
    author: "Practitioner" | "Device" | "PractitionerRole";
    encounter: "Encounter";
    participant: "Practitioner" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    patient: "Patient";
    subject: "Group" | "Patient";
  };
  ResearchDefinition: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Library"
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  ResearchElementDefinition: {
    "composed-of":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "depends-on":
      | "Library"
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    "derived-from":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    predecessor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    successor:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  ResearchStudy: {
    partof: "ResearchStudy";
    principalinvestigator: "Practitioner" | "PractitionerRole";
    protocol: "PlanDefinition";
    site: "Location";
    sponsor: "Organization";
  };
  ResearchSubject: {
    individual: "Patient";
    patient: "Patient";
    study: "ResearchStudy";
  };
  RiskAssessment: {
    condition: "Condition";
    encounter: "Encounter" | "EpisodeOfCare";
    patient: "Patient" | "Group";
    performer: "Practitioner" | "Device" | "PractitionerRole";
    subject: "Group" | "Patient";
  };
  Schedule: {
    actor:
      | "Practitioner"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson"
      | "Location";
  };
  SearchParameter: {
    component: "SearchParameter";
    "derived-from": "SearchParameter";
  };
  ServiceRequest: {
    "based-on": "CarePlan" | "MedicationRequest" | "ServiceRequest";
    encounter: "Encounter" | "EpisodeOfCare";
    "instantiates-canonical": "PlanDefinition" | "ActivityDefinition";
    patient: "Patient" | "Group";
    performer:
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    replaces: "ServiceRequest";
    requester: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    specimen: "Specimen";
    subject: "Group" | "Device" | "Patient" | "Location";
  };
  Slot: {
    schedule: "Schedule";
  };
  Specimen: {
    collector: "Practitioner" | "PractitionerRole";
    parent: "Specimen";
    patient: "Patient";
    subject: "Group" | "Device" | "Patient" | "Substance" | "Location";
  };
  StructureDefinition: {
    base: "StructureDefinition";
    valueset: "ValueSet";
  };
  Substance: {
    "substance-reference": "Substance";
  };
  SupplyDelivery: {
    patient: "Patient" | "Group";
    receiver: "Practitioner" | "PractitionerRole";
    supplier: "Practitioner" | "Organization" | "PractitionerRole";
  };
  SupplyRequest: {
    requester: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    subject: "Organization" | "Patient" | "Location";
    supplier: "Organization" | "HealthcareService";
  };
  Task: {
    "based-on":
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    encounter: "Encounter";
    focus:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
    owner:
      | "Practitioner"
      | "Organization"
      | "CareTeam"
      | "Device"
      | "Patient"
      | "HealthcareService"
      | "PractitionerRole"
      | "RelatedPerson";
    "part-of": "Task";
    patient: "Patient";
    requester: "Practitioner" | "Organization" | "Device" | "Patient" | "PractitionerRole" | "RelatedPerson";
    subject:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  TestReport: {
    testscript: "TestScript";
  };
  VerificationResult: {
    target:
      | "Account"
      | "ActivityDefinition"
      | "AdverseEvent"
      | "AllergyIntolerance"
      | "Appointment"
      | "AppointmentResponse"
      | "AuditEvent"
      | "Basic"
      | "Binary"
      | "BiologicallyDerivedProduct"
      | "BodyStructure"
      | "Bundle"
      | "CapabilityStatement"
      | "CarePlan"
      | "CareTeam"
      | "CatalogEntry"
      | "ChargeItem"
      | "ChargeItemDefinition"
      | "Claim"
      | "ClaimResponse"
      | "ClinicalImpression"
      | "CodeSystem"
      | "Communication"
      | "CommunicationRequest"
      | "CompartmentDefinition"
      | "Composition"
      | "ConceptMap"
      | "Condition"
      | "Consent"
      | "Contract"
      | "Coverage"
      | "CoverageEligibilityRequest"
      | "CoverageEligibilityResponse"
      | "DetectedIssue"
      | "Device"
      | "DeviceDefinition"
      | "DeviceMetric"
      | "DeviceRequest"
      | "DeviceUseStatement"
      | "DiagnosticReport"
      | "DocumentManifest"
      | "DocumentReference"
      | "EffectEvidenceSynthesis"
      | "Encounter"
      | "Endpoint"
      | "EnrollmentRequest"
      | "EnrollmentResponse"
      | "EpisodeOfCare"
      | "EventDefinition"
      | "Evidence"
      | "EvidenceVariable"
      | "ExampleScenario"
      | "ExplanationOfBenefit"
      | "FamilyMemberHistory"
      | "Flag"
      | "Goal"
      | "GraphDefinition"
      | "Group"
      | "GuidanceResponse"
      | "HealthcareService"
      | "ImagingStudy"
      | "Immunization"
      | "ImmunizationEvaluation"
      | "ImmunizationRecommendation"
      | "ImplementationGuide"
      | "InsurancePlan"
      | "Invoice"
      | "Library"
      | "Linkage"
      | "List"
      | "Location"
      | "Measure"
      | "MeasureReport"
      | "Media"
      | "Medication"
      | "MedicationAdministration"
      | "MedicationDispense"
      | "MedicationKnowledge"
      | "MedicationRequest"
      | "MedicationStatement"
      | "MedicinalProduct"
      | "MedicinalProductAuthorization"
      | "MedicinalProductContraindication"
      | "MedicinalProductIndication"
      | "MedicinalProductIngredient"
      | "MedicinalProductInteraction"
      | "MedicinalProductManufactured"
      | "MedicinalProductPackaged"
      | "MedicinalProductPharmaceutical"
      | "MedicinalProductUndesirableEffect"
      | "MessageDefinition"
      | "MessageHeader"
      | "MolecularSequence"
      | "NamingSystem"
      | "NutritionOrder"
      | "Observation"
      | "ObservationDefinition"
      | "OperationDefinition"
      | "OperationOutcome"
      | "Organization"
      | "OrganizationAffiliation"
      | "Patient"
      | "PaymentNotice"
      | "PaymentReconciliation"
      | "Person"
      | "PlanDefinition"
      | "Practitioner"
      | "PractitionerRole"
      | "Procedure"
      | "Provenance"
      | "Questionnaire"
      | "QuestionnaireResponse"
      | "RelatedPerson"
      | "RequestGroup"
      | "ResearchDefinition"
      | "ResearchElementDefinition"
      | "ResearchStudy"
      | "ResearchSubject"
      | "RiskAssessment"
      | "RiskEvidenceSynthesis"
      | "Schedule"
      | "SearchParameter"
      | "ServiceRequest"
      | "Slot"
      | "Specimen"
      | "SpecimenDefinition"
      | "StructureDefinition"
      | "StructureMap"
      | "Subscription"
      | "Substance"
      | "SubstanceNucleicAcid"
      | "SubstancePolymer"
      | "SubstanceProtein"
      | "SubstanceReferenceInformation"
      | "SubstanceSourceMaterial"
      | "SubstanceSpecification"
      | "SupplyDelivery"
      | "SupplyRequest"
      | "Task"
      | "TerminologyCapabilities"
      | "TestReport"
      | "TestScript"
      | "ValueSet"
      | "VerificationResult"
      | "VisionPrescription";
  };
  VisionPrescription: {
    encounter: "Encounter" | "EpisodeOfCare";
    patient: "Patient" | "Group";
    prescriber: "Practitioner" | "PractitionerRole";
  };
}

export interface RevIncludeRegistry {
  Account: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "account";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "account";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Invoice: "account";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ActivityDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "instantiates-canonical";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "instantiates-canonical" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "instantiates-canonical" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    FamilyMemberHistory: "instantiates-canonical";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageDefinition: "parent";
    MessageHeader: "focus";
    NutritionOrder: "instantiates-canonical";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "definition" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "instantiates-canonical";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ServiceRequest: "instantiates-canonical";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  AdverseEvent: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  AllergyIntolerance: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "problem" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Appointment: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AppointmentResponse: "appointment";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "appointment";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImagingStudy: "basedon";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  AppointmentResponse: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImagingStudy: "basedon";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  AuditEvent: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Basic: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Binary: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  BiologicallyDerivedProduct: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  BodyStructure: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Bundle: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CapabilityStatement: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CarePlan: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "based-on" | "part-of" | "replaces";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "based-on";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImagingStudy: "basedon";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Media: "based-on";
    MessageHeader: "focus";
    Observation: "based-on" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "based-on";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "based-on" | "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ServiceRequest: "based-on";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CareTeam: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "care-team" | "performer";
    CareTeam: "participant";
    ChargeItem: "performer-actor";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of" | "recipient";
    CommunicationRequest: "based-on" | "recipient";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "actor" | "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "performer" | "prior-request";
    DiagnosticReport: "performer" | "results-interpreter";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImagingStudy: "performer";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Media: "operator";
    MedicationRequest: "intended-performer";
    MessageHeader: "focus";
    Observation: "focus" | "performer";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ServiceRequest: "performer";
    Task: "based-on" | "focus" | "owner" | "subject";
    VerificationResult: "target";
  };
  CatalogEntry: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ChargeItem: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ChargeItemDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Claim: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClaimResponse: "request";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "claim";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ClaimResponse: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "insurance" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ClinicalImpression: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "previous" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CodeSystem: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    CodeSystem: "supplements";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Communication: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CommunicationRequest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on" | "replaces";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CompartmentDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Composition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    Bundle: "composition";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "related-ref" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ConceptMap: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    ConceptMap: "other";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Condition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "resultingcondition";
    Appointment: "reason-reference" | "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "condition";
    ClinicalImpression: "finding-ref" | "problem" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "diagnosis" | "reason-reference";
    EpisodeOfCare: "condition";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Immunization: "reason-reference";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "reason-reference";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    RiskAssessment: "condition";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Consent: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data" | "source-reference";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Contract: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data" | "source-reference";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Coverage: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "insurance" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "coverage";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CoverageEligibilityRequest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    CoverageEligibilityResponse: "request";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  CoverageEligibilityResponse: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  DetectedIssue: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Device: {
    Account: "subject";
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "substance";
    Appointment: "actor" | "supporting-info";
    AppointmentResponse: "actor";
    AuditEvent: "agent" | "entity" | "source";
    Basic: "subject";
    CarePlan: "performer";
    ChargeItem: "enterer" | "performer-actor";
    Claim: "detail-udi" | "item-udi" | "procedure-udi" | "subdetail-udi";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of" | "recipient" | "sender";
    CommunicationRequest: "based-on" | "recipient" | "requester" | "sender";
    Composition: "author" | "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "actor" | "data";
    Contract: "subject";
    DetectedIssue: "author" | "implicated";
    DeviceMetric: "parent" | "source";
    DeviceRequest: "based-on" | "device" | "performer" | "prior-request" | "requester" | "subject";
    DeviceUseStatement: "device";
    DiagnosticReport: "subject";
    DocumentManifest: "author" | "item" | "related-ref" | "subject";
    DocumentReference: "author" | "related" | "subject";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "detail-udi" | "item-udi" | "procedure-udi" | "subdetail-udi";
    Flag: "author";
    Group: "member";
    ImagingStudy: "performer" | "subject";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Invoice: "participant";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item" | "source" | "subject";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "subject";
    Media: "device" | "operator" | "subject";
    MedicationAdministration: "device" | "performer";
    MedicationDispense: "performer";
    MedicationRequest: "intended-performer" | "requester";
    MessageHeader: "focus" | "target";
    Observation: "device" | "focus" | "subject";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "performer";
    Provenance: "agent" | "entity" | "target";
    QuestionnaireResponse: "author" | "subject";
    RequestGroup: "author" | "participant";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    RiskAssessment: "performer";
    Schedule: "actor";
    ServiceRequest: "performer" | "requester" | "subject";
    Specimen: "subject";
    SupplyRequest: "requester";
    Task: "based-on" | "focus" | "owner" | "requester" | "subject";
    VerificationResult: "target";
  };
  DeviceDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceDefinition: "parent";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  DeviceMetric: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Media: "device";
    MessageHeader: "focus";
    Observation: "device" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  DeviceRequest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "based-on" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  DeviceUseStatement: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  DiagnosticReport: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "investigation" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Immunization: "reason-reference";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "reason-reference";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  DocumentManifest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  DocumentReference: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data" | "source-reference";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related" | "relatesto";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationKnowledge: "monograph";
    MessageHeader: "focus";
    Observation: "derived-from" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "reason-reference";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  EffectEvidenceSynthesis: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Encounter: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "encounter";
    CareTeam: "encounter";
    ChargeItem: "context";
    Claim: "encounter";
    ClinicalImpression: "encounter" | "supporting-info";
    Communication: "based-on" | "encounter" | "part-of";
    CommunicationRequest: "based-on" | "encounter";
    Composition: "encounter" | "entry" | "subject";
    Condition: "encounter" | "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "encounter" | "prior-request";
    DiagnosticReport: "encounter";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "encounter" | "related";
    Encounter: "part-of";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "encounter";
    Flag: "encounter";
    ImagingStudy: "encounter";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "encounter" | "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Media: "encounter";
    MedicationAdministration: "context";
    MedicationDispense: "context";
    MedicationRequest: "encounter";
    MedicationStatement: "context";
    MessageHeader: "focus";
    NutritionOrder: "encounter";
    Observation: "encounter" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "encounter";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "encounter" | "subject";
    RequestGroup: "encounter";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    RiskAssessment: "encounter";
    ServiceRequest: "encounter";
    Task: "based-on" | "encounter" | "focus" | "subject";
    VerificationResult: "target";
    VisionPrescription: "encounter";
  };
  Endpoint: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    HealthcareService: "endpoint";
    ImagingStudy: "endpoint";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    InsurancePlan: "endpoint";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Location: "endpoint";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    Organization: "endpoint";
    OrganizationAffiliation: "endpoint";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    PractitionerRole: "endpoint";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  EnrollmentRequest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EnrollmentResponse: "request";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  EnrollmentResponse: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  EpisodeOfCare: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "context";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "encounter" | "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "encounter" | "prior-request";
    DiagnosticReport: "encounter";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "encounter" | "related";
    Encounter: "episode-of-care";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Flag: "encounter";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "encounter" | "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationAdministration: "context";
    MedicationDispense: "context";
    MedicationStatement: "context";
    MessageHeader: "focus";
    NutritionOrder: "encounter";
    Observation: "encounter" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "encounter";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    RiskAssessment: "encounter";
    ServiceRequest: "encounter";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
    VisionPrescription: "encounter";
  };
  EventDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Evidence: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  EvidenceVariable: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ExampleScenario: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ExplanationOfBenefit: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  FamilyMemberHistory: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "investigation" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Flag: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Goal: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "goal";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  GraphDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Group: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "subject";
    AllergyIntolerance: "patient";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "patient" | "subject";
    CareTeam: "patient" | "subject";
    ChargeItem: "subject";
    ClinicalImpression: "patient" | "subject" | "supporting-info";
    Communication: "based-on" | "part-of" | "recipient" | "subject";
    CommunicationRequest: "based-on" | "recipient" | "subject";
    Composition: "entry" | "patient" | "subject";
    Condition: "evidence-detail" | "patient" | "subject";
    Consent: "actor" | "data" | "patient";
    Contract: "subject";
    DetectedIssue: "implicated" | "patient";
    DeviceRequest: "based-on" | "patient" | "prior-request" | "subject";
    DeviceUseStatement: "patient" | "subject";
    DiagnosticReport: "patient" | "subject";
    DocumentManifest: "item" | "patient" | "related-ref" | "subject";
    DocumentReference: "patient" | "related" | "subject";
    Encounter: "patient" | "subject";
    EpisodeOfCare: "patient";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    FamilyMemberHistory: "patient";
    Flag: "patient" | "subject";
    Goal: "patient" | "subject";
    Group: "member";
    GuidanceResponse: "subject";
    ImagingStudy: "patient" | "subject";
    Immunization: "patient";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Invoice: "subject";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item" | "patient" | "subject";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "subject";
    Media: "subject";
    MedicationAdministration: "patient" | "subject";
    MedicationDispense: "patient" | "subject";
    MedicationRequest: "patient" | "subject";
    MedicationStatement: "patient" | "subject";
    MessageHeader: "focus";
    NutritionOrder: "patient";
    Observation: "focus" | "patient" | "subject";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "patient" | "subject";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    RequestGroup: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    RiskAssessment: "patient" | "subject";
    ServiceRequest: "patient" | "subject";
    Specimen: "subject";
    SupplyDelivery: "patient";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
    VisionPrescription: "patient";
  };
  GuidanceResponse: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  HealthcareService: {
    Account: "subject";
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "actor" | "supporting-info";
    AppointmentResponse: "actor";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "performer";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of" | "recipient" | "sender";
    CommunicationRequest: "based-on" | "recipient" | "sender";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "performer" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    OrganizationAffiliation: "service";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    PractitionerRole: "service";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Schedule: "actor";
    ServiceRequest: "performer";
    SupplyRequest: "supplier";
    Task: "based-on" | "focus" | "owner" | "subject";
    VerificationResult: "target";
  };
  ImagingStudy: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "investigation" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "derived-from" | "focus" | "part-of";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Immunization: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "substance";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationEvaluation: "immunization-event";
    ImmunizationRecommendation: "information" | "support";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus" | "part-of";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ImmunizationEvaluation: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information" | "support";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ImmunizationRecommendation: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "reason-reference" | "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "based-on";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "reason-reference";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "based-on" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ImplementationGuide: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CapabilityStatement: "guide";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "depends-on" | "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  InsurancePlan: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Invoice: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Library: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Linkage: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  List: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Location: {
    Account: "subject";
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "location";
    Appointment: "actor" | "location" | "supporting-info";
    AppointmentResponse: "actor" | "location";
    AuditEvent: "entity";
    Basic: "subject";
    Claim: "facility";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "domain" | "subject";
    CoverageEligibilityRequest: "facility";
    DetectedIssue: "implicated";
    Device: "location";
    DeviceRequest: "based-on" | "prior-request" | "subject";
    DiagnosticReport: "subject";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "location";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "facility";
    Flag: "subject";
    HealthcareService: "coverage-area" | "location";
    Immunization: "location";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item" | "subject";
    Location: "partof";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "reporter" | "subject";
    Media: "subject";
    MedicationDispense: "destination";
    MessageHeader: "focus";
    Observation: "focus" | "subject";
    OrganizationAffiliation: "location";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    PractitionerRole: "location";
    Procedure: "location";
    Provenance: "entity" | "location" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchStudy: "site";
    Schedule: "actor";
    ServiceRequest: "subject";
    Specimen: "subject";
    SupplyRequest: "subject";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Measure: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "instantiates-canonical";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "instantiates-canonical" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    FamilyMemberHistory: "instantiates-canonical";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "measure";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "instantiates-canonical";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MeasureReport: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Media: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "finding-ref" | "investigation" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "media";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationKnowledge: "monograph";
    MessageHeader: "focus";
    Observation: "derived-from" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Medication: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "substance";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Flag: "subject";
    Group: "member";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Medication: "ingredient";
    MedicationAdministration: "medication";
    MedicationDispense: "medication";
    MedicationRequest: "medication";
    MedicationStatement: "medication";
    MedicinalProductContraindication: "subject";
    MedicinalProductIndication: "subject";
    MedicinalProductInteraction: "subject";
    MedicinalProductUndesirableEffect: "subject";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicationAdministration: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "substance";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationStatement: "part-of";
    MessageHeader: "focus";
    Observation: "focus" | "part-of";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "part-of";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicationDispense: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationStatement: "part-of";
    MessageHeader: "focus";
    Observation: "focus" | "part-of";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicationKnowledge: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicationRequest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "based-on";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationAdministration: "request";
    MedicationDispense: "prescription";
    MessageHeader: "focus";
    Observation: "based-on" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ServiceRequest: "based-on";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicationStatement: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "substance";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationStatement: "part-of";
    MessageHeader: "focus";
    Observation: "focus" | "part-of";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProduct: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicinalProductAuthorization: "subject";
    MedicinalProductContraindication: "subject";
    MedicinalProductIndication: "subject";
    MedicinalProductInteraction: "subject";
    MedicinalProductPackaged: "subject";
    MedicinalProductUndesirableEffect: "subject";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductAuthorization: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductContraindication: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductIndication: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductIngredient: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductInteraction: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductManufactured: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductPackaged: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicinalProductAuthorization: "subject";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductPharmaceutical: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MedicinalProductUndesirableEffect: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MessageDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MessageHeader: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    Bundle: "message";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  MolecularSequence: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "derived-from" | "focus" | "has-member";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  NamingSystem: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  NutritionOrder: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "based-on";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "based-on" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Observation: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "reason-reference" | "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "finding-ref" | "investigation" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "result";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "reason-reference";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Immunization: "reaction" | "reason-reference";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationStatement: "part-of";
    MessageHeader: "focus";
    Observation: "derived-from" | "focus" | "has-member";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "part-of" | "reason-reference";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "part-of" | "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ObservationDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  OperationDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "instantiates-canonical";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "instantiates-canonical" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    FamilyMemberHistory: "instantiates-canonical";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    OperationDefinition: "base";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "instantiates-canonical";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  OperationOutcome: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Organization: {
    Account: "owner" | "subject";
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "agent" | "entity" | "source";
    Basic: "author" | "subject";
    CarePlan: "performer";
    CareTeam: "participant";
    ChargeItem: "enterer" | "performer-actor" | "performing-organization" | "requesting-organization";
    Claim: "care-team" | "insurer" | "payee" | "provider";
    ClaimResponse: "insurer" | "requestor";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of" | "recipient" | "sender";
    CommunicationRequest: "based-on" | "recipient" | "requester" | "sender";
    Composition: "attester" | "author" | "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "actor" | "consentor" | "data" | "organization";
    Contract: "authority" | "signer" | "subject";
    Coverage: "payor" | "policy-holder";
    CoverageEligibilityRequest: "provider";
    CoverageEligibilityResponse: "insurer" | "requestor";
    DetectedIssue: "implicated";
    Device: "organization";
    DeviceRequest: "based-on" | "performer" | "prior-request" | "requester";
    DiagnosticReport: "performer" | "results-interpreter";
    DocumentManifest: "author" | "item" | "recipient" | "related-ref";
    DocumentReference: "authenticator" | "author" | "custodian" | "related";
    Encounter: "service-provider";
    Endpoint: "organization";
    EpisodeOfCare: "organization";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "care-team" | "payee" | "provider";
    Flag: "author" | "subject";
    Goal: "subject";
    Group: "managing-entity";
    HealthcareService: "organization";
    ImagingStudy: "performer";
    Immunization: "manufacturer" | "performer";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    InsurancePlan: "administered-by" | "owned-by";
    Invoice: "issuer" | "participant" | "recipient";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "author" | "item" | "source";
    List: "item";
    Location: "organization";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "reporter";
    Media: "operator";
    Medication: "manufacturer";
    MedicationDispense: "performer";
    MedicationKnowledge: "manufacturer";
    MedicationRequest: "intended-dispenser" | "intended-performer" | "requester";
    MedicationStatement: "source";
    MedicinalProductAuthorization: "holder";
    MessageHeader: "focus" | "receiver" | "responsible" | "sender";
    Observation: "focus" | "performer";
    Organization: "partof";
    OrganizationAffiliation: "network" | "participating-organization" | "primary-organization";
    Patient: "general-practitioner" | "organization";
    PaymentNotice: "provider" | "request" | "response";
    PaymentReconciliation: "payment-issuer" | "requestor";
    Person: "organization";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    PractitionerRole: "organization";
    Procedure: "performer";
    Provenance: "agent" | "entity" | "target";
    QuestionnaireResponse: "author" | "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchStudy: "sponsor";
    ServiceRequest: "performer" | "requester";
    SupplyDelivery: "supplier";
    SupplyRequest: "requester" | "subject" | "supplier";
    Task: "based-on" | "focus" | "owner" | "requester" | "subject";
    VerificationResult: "target";
  };
  OrganizationAffiliation: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Patient: {
    Account: "patient" | "subject";
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "recorder" | "subject";
    AllergyIntolerance: "asserter" | "patient" | "recorder";
    Appointment: "actor" | "patient" | "supporting-info";
    AppointmentResponse: "actor" | "patient";
    AuditEvent: "agent" | "entity" | "patient" | "source";
    Basic: "author" | "patient" | "subject";
    BodyStructure: "patient";
    CarePlan: "patient" | "performer" | "subject";
    CareTeam: "participant" | "patient" | "subject";
    ChargeItem: "enterer" | "patient" | "performer-actor" | "subject";
    Claim: "patient" | "payee";
    ClaimResponse: "patient";
    ClinicalImpression: "patient" | "subject" | "supporting-info";
    Communication: "based-on" | "part-of" | "patient" | "recipient" | "sender" | "subject";
    CommunicationRequest: "based-on" | "patient" | "recipient" | "requester" | "sender" | "subject";
    Composition: "attester" | "author" | "entry" | "patient" | "subject";
    Condition: "asserter" | "evidence-detail" | "patient" | "subject";
    Consent: "actor" | "consentor" | "data" | "patient";
    Contract: "patient" | "signer" | "subject";
    Coverage: "beneficiary" | "patient" | "payor" | "policy-holder" | "subscriber";
    CoverageEligibilityRequest: "patient";
    CoverageEligibilityResponse: "patient";
    DetectedIssue: "implicated" | "patient";
    Device: "patient";
    DeviceRequest: "based-on" | "patient" | "performer" | "prior-request" | "subject";
    DeviceUseStatement: "patient" | "subject";
    DiagnosticReport: "patient" | "subject";
    DocumentManifest: "author" | "item" | "patient" | "recipient" | "related-ref" | "subject";
    DocumentReference: "author" | "patient" | "related" | "subject";
    Encounter: "patient" | "subject";
    EnrollmentRequest: "patient" | "subject";
    EpisodeOfCare: "patient";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "patient" | "payee";
    FamilyMemberHistory: "patient";
    Flag: "author" | "patient" | "subject";
    Goal: "patient" | "subject";
    Group: "member";
    GuidanceResponse: "patient" | "subject";
    ImagingStudy: "patient" | "performer" | "subject";
    Immunization: "patient";
    ImmunizationEvaluation: "patient";
    ImmunizationRecommendation: "information" | "patient";
    ImplementationGuide: "resource";
    Invoice: "participant" | "patient" | "recipient" | "subject";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item" | "patient" | "source" | "subject";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "patient" | "subject";
    Media: "operator" | "patient" | "subject";
    MedicationAdministration: "patient" | "performer" | "subject";
    MedicationDispense: "patient" | "performer" | "receiver" | "subject";
    MedicationRequest: "intended-performer" | "patient" | "requester" | "subject";
    MedicationStatement: "patient" | "source" | "subject";
    MessageHeader: "focus";
    MolecularSequence: "patient";
    NutritionOrder: "patient";
    Observation: "focus" | "patient" | "performer" | "subject";
    Patient: "link";
    PaymentNotice: "request" | "response";
    Person: "link" | "patient";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "patient" | "performer" | "subject";
    Provenance: "agent" | "entity" | "patient" | "target";
    QuestionnaireResponse: "author" | "patient" | "source" | "subject";
    RelatedPerson: "patient";
    RequestGroup: "participant" | "patient" | "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchSubject: "individual" | "patient";
    RiskAssessment: "patient" | "subject";
    Schedule: "actor";
    ServiceRequest: "patient" | "performer" | "requester" | "subject";
    Specimen: "patient" | "subject";
    SupplyDelivery: "patient";
    SupplyRequest: "requester" | "subject";
    Task: "based-on" | "focus" | "owner" | "patient" | "requester" | "subject";
    VerificationResult: "target";
    VisionPrescription: "patient";
  };
  PaymentNotice: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  PaymentReconciliation: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Person: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    Person: "link";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  PlanDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "instantiates-canonical";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "instantiates-canonical" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "instantiates-canonical" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    FamilyMemberHistory: "instantiates-canonical";
    Flag: "subject";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageDefinition: "parent";
    MessageHeader: "focus";
    NutritionOrder: "instantiates-canonical";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "definition" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "instantiates-canonical";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchStudy: "protocol";
    ServiceRequest: "instantiates-canonical";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Practitioner: {
    Account: "subject";
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "recorder" | "subject";
    AllergyIntolerance: "asserter" | "recorder";
    Appointment: "actor" | "practitioner" | "supporting-info";
    AppointmentResponse: "actor" | "practitioner";
    AuditEvent: "agent" | "entity" | "source";
    Basic: "author" | "subject";
    CarePlan: "performer";
    CareTeam: "participant";
    ChargeItem: "enterer" | "performer-actor";
    Claim: "care-team" | "enterer" | "payee" | "provider";
    ClaimResponse: "requestor";
    ClinicalImpression: "assessor" | "supporting-info";
    Communication: "based-on" | "part-of" | "recipient" | "sender";
    CommunicationRequest: "based-on" | "recipient" | "requester" | "sender";
    Composition: "attester" | "author" | "entry" | "subject";
    Condition: "asserter" | "evidence-detail";
    Consent: "actor" | "consentor" | "data";
    Contract: "signer" | "subject";
    CoverageEligibilityRequest: "enterer" | "provider";
    CoverageEligibilityResponse: "requestor";
    DetectedIssue: "author" | "implicated";
    DeviceRequest: "based-on" | "performer" | "prior-request" | "requester";
    DiagnosticReport: "performer" | "results-interpreter";
    DocumentManifest: "author" | "item" | "recipient" | "related-ref" | "subject";
    DocumentReference: "authenticator" | "author" | "related" | "subject";
    Encounter: "participant" | "practitioner";
    EpisodeOfCare: "care-manager";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "care-team" | "enterer" | "payee" | "provider";
    Flag: "author" | "subject";
    Group: "managing-entity" | "member";
    ImagingStudy: "interpreter" | "performer" | "referrer";
    Immunization: "performer";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Invoice: "participant";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "author" | "item" | "source";
    List: "item" | "source";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "reporter" | "subject";
    Media: "operator" | "subject";
    MedicationAdministration: "performer";
    MedicationDispense: "performer" | "receiver" | "responsibleparty";
    MedicationRequest: "intended-performer" | "requester";
    MedicationStatement: "source";
    MessageHeader: "author" | "enterer" | "focus" | "receiver" | "responsible" | "sender";
    NutritionOrder: "provider";
    Observation: "focus" | "performer";
    Patient: "general-practitioner";
    PaymentNotice: "provider" | "request" | "response";
    PaymentReconciliation: "requestor";
    Person: "link" | "practitioner";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    PractitionerRole: "practitioner";
    Procedure: "performer";
    Provenance: "agent" | "entity" | "target";
    QuestionnaireResponse: "author" | "source" | "subject";
    RequestGroup: "author" | "participant";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchStudy: "principalinvestigator";
    RiskAssessment: "performer";
    Schedule: "actor";
    ServiceRequest: "performer" | "requester";
    Specimen: "collector";
    SupplyDelivery: "receiver" | "supplier";
    SupplyRequest: "requester";
    Task: "based-on" | "focus" | "owner" | "requester" | "subject";
    VerificationResult: "target";
    VisionPrescription: "prescriber";
  };
  PractitionerRole: {
    Account: "subject";
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "recorder";
    AllergyIntolerance: "asserter" | "recorder";
    Appointment: "actor" | "supporting-info";
    AppointmentResponse: "actor";
    AuditEvent: "agent" | "entity" | "source";
    Basic: "author" | "subject";
    CarePlan: "performer";
    CareTeam: "participant";
    ChargeItem: "enterer" | "performer-actor";
    Claim: "care-team" | "enterer" | "payee" | "provider";
    ClaimResponse: "requestor";
    ClinicalImpression: "assessor" | "supporting-info";
    Communication: "based-on" | "part-of" | "recipient" | "sender";
    CommunicationRequest: "based-on" | "recipient" | "requester" | "sender";
    Composition: "attester" | "author" | "entry" | "subject";
    Condition: "asserter" | "evidence-detail";
    Consent: "actor" | "consentor" | "data";
    Contract: "signer" | "subject";
    CoverageEligibilityRequest: "enterer" | "provider";
    CoverageEligibilityResponse: "requestor";
    DetectedIssue: "author" | "implicated";
    DeviceRequest: "based-on" | "performer" | "prior-request" | "requester";
    DiagnosticReport: "performer" | "results-interpreter";
    DocumentManifest: "author" | "item" | "recipient" | "related-ref";
    DocumentReference: "authenticator" | "author" | "related";
    Encounter: "participant";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "care-team" | "enterer" | "payee" | "provider";
    Flag: "author";
    Group: "managing-entity" | "member";
    ImagingStudy: "interpreter" | "performer" | "referrer";
    Immunization: "performer";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Invoice: "participant";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "author" | "item" | "source";
    List: "item" | "source";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "reporter" | "subject";
    Media: "operator" | "subject";
    MedicationAdministration: "performer";
    MedicationDispense: "performer" | "responsibleparty";
    MedicationRequest: "intended-performer" | "requester";
    MedicationStatement: "source";
    MessageHeader: "author" | "enterer" | "focus" | "receiver" | "responsible" | "sender";
    NutritionOrder: "provider";
    Observation: "focus" | "performer";
    Patient: "general-practitioner";
    PaymentNotice: "provider" | "request" | "response";
    PaymentReconciliation: "requestor";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "performer";
    Provenance: "agent" | "entity" | "target";
    QuestionnaireResponse: "author" | "source" | "subject";
    RequestGroup: "author" | "participant";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchStudy: "principalinvestigator";
    RiskAssessment: "performer";
    Schedule: "actor";
    ServiceRequest: "performer" | "requester";
    Specimen: "collector";
    SupplyDelivery: "receiver" | "supplier";
    SupplyRequest: "requester";
    Task: "based-on" | "focus" | "owner" | "requester" | "subject";
    VerificationResult: "target";
    VisionPrescription: "prescriber";
  };
  Procedure: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "substance";
    Appointment: "reason-reference" | "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "diagnosis" | "reason-reference";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Flag: "subject";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MedicationStatement: "part-of";
    MessageHeader: "focus";
    Observation: "focus" | "part-of";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "part-of" | "reason-reference";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "part-of" | "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Provenance: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Questionnaire: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "instantiates-canonical";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "instantiates-canonical" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    FamilyMemberHistory: "instantiates-canonical";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "definition" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "instantiates-canonical";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "questionnaire" | "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  QuestionnaireResponse: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "investigation" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data" | "source-reference";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "derived-from" | "focus" | "has-member";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  RelatedPerson: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "recorder" | "subject";
    AllergyIntolerance: "asserter" | "recorder";
    Appointment: "actor" | "supporting-info";
    AppointmentResponse: "actor";
    AuditEvent: "agent" | "entity" | "source";
    Basic: "author" | "subject";
    CarePlan: "performer";
    CareTeam: "participant";
    ChargeItem: "enterer" | "performer-actor";
    Claim: "payee";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of" | "recipient" | "sender";
    CommunicationRequest: "based-on" | "recipient" | "requester" | "sender";
    Composition: "attester" | "author" | "entry" | "subject";
    Condition: "asserter" | "evidence-detail";
    Consent: "actor" | "consentor" | "data";
    Contract: "signer" | "subject";
    Coverage: "payor" | "policy-holder" | "subscriber";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "performer" | "prior-request";
    DocumentManifest: "author" | "item" | "recipient" | "related-ref";
    DocumentReference: "author" | "related";
    Encounter: "participant";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ExplanationOfBenefit: "payee";
    Group: "managing-entity";
    ImagingStudy: "performer";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Invoice: "participant" | "recipient";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource" | "subject";
    Media: "operator";
    MedicationAdministration: "performer";
    MedicationDispense: "performer";
    MedicationRequest: "intended-performer" | "requester";
    MedicationStatement: "source";
    MessageHeader: "focus";
    Observation: "focus" | "performer";
    Patient: "link";
    PaymentNotice: "request" | "response";
    Person: "link" | "relatedperson";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "performer";
    Provenance: "agent" | "entity" | "target";
    QuestionnaireResponse: "author" | "source" | "subject";
    RequestGroup: "participant";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Schedule: "actor";
    ServiceRequest: "performer" | "requester";
    SupplyRequest: "requester";
    Task: "based-on" | "focus" | "owner" | "requester" | "subject";
    VerificationResult: "target";
  };
  RequestGroup: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ResearchDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ResearchElementDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ResearchStudy: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "study";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchStudy: "partof";
    ResearchSubject: "study";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ResearchSubject: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  RiskAssessment: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "investigation" | "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  RiskEvidenceSynthesis: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Schedule: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Slot: "schedule";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SearchParameter: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    SearchParameter: "component" | "derived-from";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  ServiceRequest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "based-on" | "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "based-on";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    Encounter: "based-on";
    EpisodeOfCare: "incoming-referral";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImagingStudy: "basedon";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Media: "based-on";
    MessageHeader: "focus";
    Observation: "based-on" | "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Procedure: "based-on";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "based-on" | "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ServiceRequest: "based-on" | "replaces";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Slot: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "slot" | "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Specimen: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DiagnosticReport: "specimen";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Media: "subject";
    MessageHeader: "focus";
    Observation: "focus" | "specimen";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ServiceRequest: "specimen";
    Specimen: "parent";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SpecimenDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  StructureDefinition: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CapabilityStatement: "resource-profile" | "supported-profile";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "global" | "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    OperationDefinition: "input-profile" | "output-profile";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    StructureDefinition: "base";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  StructureMap: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Subscription: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Substance: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    AdverseEvent: "substance";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Group: "member";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    Medication: "ingredient";
    MedicationKnowledge: "ingredient";
    MedicinalProductInteraction: "subject";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Specimen: "subject";
    Substance: "substance-reference";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SubstanceNucleicAcid: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SubstancePolymer: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SubstanceProtein: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SubstanceReferenceInformation: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SubstanceSourceMaterial: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SubstanceSpecification: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SupplyDelivery: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ChargeItem: "service";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  SupplyRequest: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  Task: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImagingStudy: "basedon";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PaymentReconciliation: "request";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "part-of" | "subject";
    VerificationResult: "target";
  };
  TerminologyCapabilities: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  TestReport: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  TestScript: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    TestReport: "testscript";
    VerificationResult: "target";
  };
  ValueSet: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    ConceptMap: "source" | "source-uri" | "target" | "target-uri";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    StructureDefinition: "valueset";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  VerificationResult: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
  VisionPrescription: {
    ActivityDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Appointment: "supporting-info";
    AuditEvent: "entity";
    Basic: "subject";
    CarePlan: "activity-reference";
    ClinicalImpression: "supporting-info";
    Communication: "based-on" | "part-of";
    CommunicationRequest: "based-on";
    Composition: "entry" | "subject";
    Condition: "evidence-detail";
    Consent: "data";
    Contract: "subject";
    DetectedIssue: "implicated";
    DeviceRequest: "based-on" | "prior-request";
    DocumentManifest: "item" | "related-ref";
    DocumentReference: "related";
    EventDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Evidence: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    EvidenceVariable: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ImmunizationRecommendation: "information";
    ImplementationGuide: "resource";
    Library: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Linkage: "item" | "source";
    List: "item";
    Measure: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    MeasureReport: "evaluated-resource";
    MessageHeader: "focus";
    Observation: "focus";
    PaymentNotice: "request" | "response";
    PlanDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Provenance: "entity" | "target";
    QuestionnaireResponse: "subject";
    ResearchDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    ResearchElementDefinition: "composed-of" | "depends-on" | "derived-from" | "predecessor" | "successor";
    Task: "based-on" | "focus" | "subject";
    VerificationResult: "target";
  };
}

export interface IncludeExpressions {
  Account: {
    owner: "owner";
    patient: "subject";
    subject: "subject";
  };
  AdverseEvent: {
    location: "location";
    recorder: "recorder";
    resultingcondition: "resultingCondition";
    study: "study";
    subject: "subject";
    substance: "suspectEntity.instance";
  };
  AllergyIntolerance: {
    asserter: "asserter";
    recorder: "recorder";
  };
  Appointment: {
    actor: "participant.actor";
    "based-on": "basedOn";
    location: "participant.actor";
    patient: "participant.actor";
    practitioner: "participant.actor";
    "reason-reference": "reasonReference";
    slot: "slot";
    "supporting-info": "supportingInformation";
  };
  AppointmentResponse: {
    actor: "actor";
    appointment: "appointment";
    location: "actor";
    patient: "actor";
    practitioner: "actor";
  };
  AuditEvent: {
    agent: "agent.who";
    entity: "entity.what";
    patient: "agent.who" | "entity.what";
    source: "source.observer";
  };
  Basic: {
    author: "author";
    patient: "subject";
    subject: "subject";
  };
  BodyStructure: {
    patient: "patient";
  };
  CapabilityStatement: {
    guide: "implementationGuide";
    "resource-profile": "rest.resource.profile";
    "supported-profile": "rest.resource.supportedProfile";
  };
  CarePlan: {
    "activity-reference": "activity";
    "based-on": "basedOn";
    "care-team": "careTeam";
    condition: "addresses";
    encounter: "encounter";
    goal: "goal";
    "instantiates-canonical": "instantiatesCanonical";
    "part-of": "partOf";
    performer: "activity.detail.performer";
    replaces: "replaces";
    subject: "subject";
  };
  CareTeam: {
    encounter: "encounter";
    participant: "participant.member";
    subject: "subject";
  };
  ChargeItem: {
    account: "account";
    context: "context";
    enterer: "enterer";
    patient: "subject";
    "performer-actor": "performer.actor";
    "performing-organization": "performingOrganization";
    "requesting-organization": "requestingOrganization";
    service: "service";
    subject: "subject";
  };
  Claim: {
    "care-team": "careTeam.provider";
    "detail-udi": "item.detail.udi";
    encounter: "item.encounter";
    enterer: "enterer";
    facility: "facility";
    insurer: "insurer";
    "item-udi": "item.udi";
    patient: "patient";
    payee: "payee.party";
    "procedure-udi": "procedure.udi";
    provider: "provider";
    "subdetail-udi": "item.detail.subDetail.udi";
  };
  ClaimResponse: {
    insurer: "insurer";
    patient: "patient";
    request: "request";
    requestor: "requestor";
  };
  ClinicalImpression: {
    assessor: "assessor";
    encounter: "encounter";
    "finding-ref": "finding.itemReference";
    investigation: "investigation.item";
    previous: "previous";
    problem: "problem";
    subject: "subject";
    "supporting-info": "supportingInfo";
  };
  CodeSystem: {
    supplements: "supplements";
  };
  Communication: {
    "based-on": "basedOn";
    encounter: "encounter";
    "instantiates-canonical": "instantiatesCanonical";
    "part-of": "partOf";
    patient: "subject";
    recipient: "recipient";
    sender: "sender";
    subject: "subject";
  };
  CommunicationRequest: {
    "based-on": "basedOn";
    encounter: "encounter";
    patient: "subject";
    recipient: "recipient";
    replaces: "replaces";
    requester: "requester";
    sender: "sender";
    subject: "subject";
  };
  Composition: {
    attester: "attester.party";
    author: "author";
    entry: "section.entry";
    subject: "subject";
  };
  ConceptMap: {
    other: "group.unmapped.url";
  };
  Condition: {
    asserter: "asserter";
    encounter: "encounter";
    "evidence-detail": "evidence.detail";
    subject: "subject";
  };
  Consent: {
    actor: "provision.actor";
    consentor: "performer";
    data: "provision.data";
    organization: "organization";
    "source-reference": "source";
  };
  Contract: {
    authority: "authority";
    domain: "domain";
    patient: "subject";
    signer: "signer.party";
    subject: "subject";
  };
  Coverage: {
    beneficiary: "beneficiary";
    patient: "beneficiary";
    payor: "payor";
    "policy-holder": "policyHolder";
    subscriber: "subscriber";
  };
  CoverageEligibilityRequest: {
    enterer: "enterer";
    facility: "facility";
    patient: "patient";
    provider: "provider";
  };
  CoverageEligibilityResponse: {
    insurer: "insurer";
    patient: "patient";
    request: "request";
    requestor: "requestor";
  };
  DetectedIssue: {
    author: "author";
    implicated: "implicated";
  };
  Device: {
    location: "location";
    organization: "owner";
    patient: "patient";
  };
  DeviceDefinition: {
    parent: "parentDevice";
  };
  DeviceMetric: {
    parent: "parent";
    source: "source";
  };
  DeviceRequest: {
    "based-on": "basedOn";
    "instantiates-canonical": "instantiatesCanonical";
    insurance: "insurance";
    performer: "performer";
    "prior-request": "priorRequest";
    requester: "requester";
    subject: "subject";
  };
  DeviceUseStatement: {
    device: "device";
    subject: "subject";
  };
  DiagnosticReport: {
    "based-on": "basedOn";
    media: "media.link";
    performer: "performer";
    result: "result";
    "results-interpreter": "resultsInterpreter";
    specimen: "specimen";
    subject: "subject";
  };
  DocumentManifest: {
    author: "author";
    item: "content";
    recipient: "recipient";
    "related-ref": "related.ref";
    subject: "subject";
  };
  DocumentReference: {
    authenticator: "authenticator";
    author: "author";
    custodian: "custodian";
    related: "context.related";
    relatesto: "relatesTo.target";
    subject: "subject";
  };
  Encounter: {
    account: "account";
    appointment: "appointment";
    "based-on": "basedOn";
    diagnosis: "diagnosis.condition";
    "episode-of-care": "episodeOfCare";
    location: "location.location";
    "part-of": "partOf";
    participant: "participant.individual";
    practitioner: "participant.individual";
    "reason-reference": "reasonReference";
    "service-provider": "serviceProvider";
    subject: "subject";
  };
  Endpoint: {
    organization: "managingOrganization";
  };
  EnrollmentRequest: {
    patient: "candidate";
    subject: "candidate";
  };
  EnrollmentResponse: {
    request: "request";
  };
  EpisodeOfCare: {
    "care-manager": "careManager";
    condition: "diagnosis.condition";
    "incoming-referral": "referralRequest";
    organization: "managingOrganization";
  };
  ExplanationOfBenefit: {
    "care-team": "careTeam.provider";
    claim: "claim";
    coverage: "insurance.coverage";
    "detail-udi": "item.detail.udi";
    encounter: "item.encounter";
    enterer: "enterer";
    facility: "facility";
    "item-udi": "item.udi";
    patient: "patient";
    payee: "payee.party";
    "procedure-udi": "procedure.udi";
    provider: "provider";
    "subdetail-udi": "item.detail.subDetail.udi";
  };
  FamilyMemberHistory: {
    "instantiates-canonical": "instantiatesCanonical";
  };
  Flag: {
    author: "author";
    subject: "subject";
  };
  Goal: {
    subject: "subject";
  };
  Group: {
    "managing-entity": "managingEntity";
    member: "member.entity";
  };
  GuidanceResponse: {
    patient: "subject";
    subject: "subject";
  };
  HealthcareService: {
    "coverage-area": "coverageArea";
    endpoint: "endpoint";
    location: "location";
    organization: "providedBy";
  };
  ImagingStudy: {
    basedon: "basedOn";
    encounter: "encounter";
    endpoint: "endpoint" | "series.endpoint";
    interpreter: "interpreter";
    performer: "series.performer.actor";
    referrer: "referrer";
    subject: "subject";
  };
  Immunization: {
    location: "location";
    manufacturer: "manufacturer";
    performer: "performer.actor";
    reaction: "reaction.detail";
    "reason-reference": "reasonReference";
  };
  ImmunizationEvaluation: {
    "immunization-event": "immunizationEvent";
    patient: "patient";
  };
  ImmunizationRecommendation: {
    information: "recommendation.supportingPatientInformation";
    patient: "patient";
    support: "recommendation.supportingImmunization";
  };
  ImplementationGuide: {
    "depends-on": "dependsOn.uri";
    global: "global.profile";
    resource: "definition.resource";
  };
  InsurancePlan: {
    "administered-by": "administeredBy";
    endpoint: "endpoint";
    "owned-by": "ownedBy";
  };
  Invoice: {
    account: "account";
    issuer: "issuer";
    participant: "participant.actor";
    patient: "subject";
    recipient: "recipient";
    subject: "subject";
  };
  Linkage: {
    author: "author";
    item: "item.resource";
    source: "item.resource";
  };
  List: {
    item: "entry.item";
    source: "source";
    subject: "subject";
  };
  Location: {
    endpoint: "endpoint";
    organization: "managingOrganization";
    partof: "partOf";
  };
  MeasureReport: {
    "evaluated-resource": "evaluatedResource";
    measure: "measure";
    patient: "subject";
    reporter: "reporter";
    subject: "subject";
  };
  Media: {
    "based-on": "basedOn";
    device: "device";
    encounter: "encounter";
    operator: "operator";
    patient: "subject";
    subject: "subject";
  };
  Medication: {
    manufacturer: "manufacturer";
  };
  MedicationAdministration: {
    context: "context";
    device: "device";
    performer: "performer.actor";
    request: "request";
    subject: "subject";
  };
  MedicationDispense: {
    context: "context";
    destination: "destination";
    performer: "performer.actor";
    prescription: "authorizingPrescription";
    receiver: "receiver";
    responsibleparty: "substitution.responsibleParty";
    subject: "subject";
  };
  MedicationKnowledge: {
    manufacturer: "manufacturer";
    monograph: "monograph.source";
  };
  MedicationRequest: {
    encounter: "encounter";
    "intended-dispenser": "dispenseRequest.performer";
    "intended-performer": "performer";
    requester: "requester";
    subject: "subject";
  };
  MedicationStatement: {
    context: "context";
    "part-of": "partOf";
    source: "informationSource";
    subject: "subject";
  };
  MedicinalProductAuthorization: {
    holder: "holder";
    subject: "subject";
  };
  MedicinalProductContraindication: {
    subject: "subject";
  };
  MedicinalProductIndication: {
    subject: "subject";
  };
  MedicinalProductInteraction: {
    subject: "subject";
  };
  MedicinalProductPackaged: {
    subject: "subject";
  };
  MedicinalProductUndesirableEffect: {
    subject: "subject";
  };
  MessageDefinition: {
    parent: "parent";
  };
  MessageHeader: {
    author: "author";
    enterer: "enterer";
    focus: "focus";
    receiver: "destination.receiver";
    responsible: "responsible";
    sender: "sender";
    target: "destination.target";
  };
  MolecularSequence: {
    patient: "patient";
  };
  NutritionOrder: {
    "instantiates-canonical": "instantiatesCanonical";
    provider: "orderer";
  };
  Observation: {
    "based-on": "basedOn";
    "derived-from": "derivedFrom";
    device: "device";
    focus: "focus";
    "has-member": "hasMember";
    "part-of": "partOf";
    performer: "performer";
    specimen: "specimen";
    subject: "subject";
  };
  OperationDefinition: {
    base: "base";
    "input-profile": "inputProfile";
    "output-profile": "outputProfile";
  };
  Organization: {
    endpoint: "endpoint";
    partof: "partOf";
  };
  OrganizationAffiliation: {
    endpoint: "endpoint";
    location: "location";
    network: "network";
    "participating-organization": "participatingOrganization";
    "primary-organization": "organization";
    service: "healthcareService";
  };
  Patient: {
    "general-practitioner": "generalPractitioner";
    link: "link.other";
    organization: "managingOrganization";
  };
  PaymentNotice: {
    provider: "provider";
    request: "request";
    response: "response";
  };
  PaymentReconciliation: {
    "payment-issuer": "paymentIssuer";
    request: "request";
    requestor: "requestor";
  };
  Person: {
    link: "link.target";
    organization: "managingOrganization";
    patient: "link.target";
    practitioner: "link.target";
    relatedperson: "link.target";
  };
  PlanDefinition: {
    definition: "action.definition";
  };
  PractitionerRole: {
    endpoint: "endpoint";
    location: "location";
    organization: "organization";
    practitioner: "practitioner";
    service: "healthcareService";
  };
  Procedure: {
    "based-on": "basedOn";
    "instantiates-canonical": "instantiatesCanonical";
    location: "location";
    "part-of": "partOf";
    performer: "performer.actor";
    "reason-reference": "reasonReference";
    subject: "subject";
  };
  Provenance: {
    agent: "agent.who";
    entity: "entity.what";
    location: "location";
    patient: "target";
    target: "target";
  };
  QuestionnaireResponse: {
    author: "author";
    "based-on": "basedOn";
    encounter: "encounter";
    "part-of": "partOf";
    patient: "subject";
    questionnaire: "questionnaire";
    source: "source";
    subject: "subject";
  };
  RelatedPerson: {
    patient: "patient";
  };
  RequestGroup: {
    author: "author";
    encounter: "encounter";
    participant: "action.participant";
    patient: "subject";
    subject: "subject";
  };
  ResearchStudy: {
    partof: "partOf";
    principalinvestigator: "principalInvestigator";
    protocol: "protocol";
    site: "site";
    sponsor: "sponsor";
  };
  ResearchSubject: {
    individual: "individual";
    patient: "individual";
    study: "study";
  };
  RiskAssessment: {
    condition: "condition";
    performer: "performer";
    subject: "subject";
  };
  Schedule: {
    actor: "actor";
  };
  SearchParameter: {
    component: "component.definition";
    "derived-from": "derivedFrom";
  };
  ServiceRequest: {
    "based-on": "basedOn";
    "instantiates-canonical": "instantiatesCanonical";
    performer: "performer";
    replaces: "replaces";
    requester: "requester";
    specimen: "specimen";
    subject: "subject";
  };
  Slot: {
    schedule: "schedule";
  };
  Specimen: {
    collector: "collection.collector";
    parent: "parent";
    patient: "subject";
    subject: "subject";
  };
  StructureDefinition: {
    base: "baseDefinition";
    valueset: "snapshot.element.binding.valueSet";
  };
  SupplyDelivery: {
    receiver: "receiver";
    supplier: "supplier";
  };
  SupplyRequest: {
    requester: "requester";
    subject: "deliverTo";
    supplier: "supplier";
  };
  Task: {
    "based-on": "basedOn";
    encounter: "encounter";
    focus: "focus";
    owner: "owner";
    "part-of": "partOf";
    patient: "for";
    requester: "requester";
    subject: "for";
  };
  TestReport: {
    testscript: "testScript";
  };
  VerificationResult: {
    target: "target";
  };
  VisionPrescription: {
    prescriber: "prescriber";
  };
}

export const includeExpressions: Record<string, Record<string, string | string[]>> = {
  Account: {
    owner: "owner",
    patient: "subject",
    subject: "subject",
  },
  AdverseEvent: {
    location: "location",
    recorder: "recorder",
    resultingcondition: "resultingCondition",
    study: "study",
    subject: "subject",
    substance: "suspectEntity.instance",
  },
  AllergyIntolerance: {
    asserter: "asserter",
    recorder: "recorder",
  },
  Appointment: {
    actor: "participant.actor",
    "based-on": "basedOn",
    location: "participant.actor",
    patient: "participant.actor",
    practitioner: "participant.actor",
    "reason-reference": "reasonReference",
    slot: "slot",
    "supporting-info": "supportingInformation",
  },
  AppointmentResponse: {
    actor: "actor",
    appointment: "appointment",
    location: "actor",
    patient: "actor",
    practitioner: "actor",
  },
  AuditEvent: {
    agent: "agent.who",
    entity: "entity.what",
    patient: ["agent.who", "entity.what"],
    source: "source.observer",
  },
  Basic: {
    author: "author",
    patient: "subject",
    subject: "subject",
  },
  BodyStructure: {
    patient: "patient",
  },
  CapabilityStatement: {
    guide: "implementationGuide",
    "resource-profile": "rest.resource.profile",
    "supported-profile": "rest.resource.supportedProfile",
  },
  CarePlan: {
    "activity-reference": "activity",
    "based-on": "basedOn",
    "care-team": "careTeam",
    condition: "addresses",
    encounter: "encounter",
    goal: "goal",
    "instantiates-canonical": "instantiatesCanonical",
    "part-of": "partOf",
    performer: "activity.detail.performer",
    replaces: "replaces",
    subject: "subject",
  },
  CareTeam: {
    encounter: "encounter",
    participant: "participant.member",
    subject: "subject",
  },
  ChargeItem: {
    account: "account",
    context: "context",
    enterer: "enterer",
    patient: "subject",
    "performer-actor": "performer.actor",
    "performing-organization": "performingOrganization",
    "requesting-organization": "requestingOrganization",
    service: "service",
    subject: "subject",
  },
  Claim: {
    "care-team": "careTeam.provider",
    "detail-udi": "item.detail.udi",
    encounter: "item.encounter",
    enterer: "enterer",
    facility: "facility",
    insurer: "insurer",
    "item-udi": "item.udi",
    patient: "patient",
    payee: "payee.party",
    "procedure-udi": "procedure.udi",
    provider: "provider",
    "subdetail-udi": "item.detail.subDetail.udi",
  },
  ClaimResponse: {
    insurer: "insurer",
    patient: "patient",
    request: "request",
    requestor: "requestor",
  },
  ClinicalImpression: {
    assessor: "assessor",
    encounter: "encounter",
    "finding-ref": "finding.itemReference",
    investigation: "investigation.item",
    previous: "previous",
    problem: "problem",
    subject: "subject",
    "supporting-info": "supportingInfo",
  },
  CodeSystem: {
    supplements: "supplements",
  },
  Communication: {
    "based-on": "basedOn",
    encounter: "encounter",
    "instantiates-canonical": "instantiatesCanonical",
    "part-of": "partOf",
    patient: "subject",
    recipient: "recipient",
    sender: "sender",
    subject: "subject",
  },
  CommunicationRequest: {
    "based-on": "basedOn",
    encounter: "encounter",
    patient: "subject",
    recipient: "recipient",
    replaces: "replaces",
    requester: "requester",
    sender: "sender",
    subject: "subject",
  },
  Composition: {
    attester: "attester.party",
    author: "author",
    entry: "section.entry",
    subject: "subject",
  },
  ConceptMap: {
    other: "group.unmapped.url",
  },
  Condition: {
    asserter: "asserter",
    encounter: "encounter",
    "evidence-detail": "evidence.detail",
    subject: "subject",
  },
  Consent: {
    actor: "provision.actor",
    consentor: "performer",
    data: "provision.data",
    organization: "organization",
    "source-reference": "source",
  },
  Contract: {
    authority: "authority",
    domain: "domain",
    patient: "subject",
    signer: "signer.party",
    subject: "subject",
  },
  Coverage: {
    beneficiary: "beneficiary",
    patient: "beneficiary",
    payor: "payor",
    "policy-holder": "policyHolder",
    subscriber: "subscriber",
  },
  CoverageEligibilityRequest: {
    enterer: "enterer",
    facility: "facility",
    patient: "patient",
    provider: "provider",
  },
  CoverageEligibilityResponse: {
    insurer: "insurer",
    patient: "patient",
    request: "request",
    requestor: "requestor",
  },
  DetectedIssue: {
    author: "author",
    implicated: "implicated",
  },
  Device: {
    location: "location",
    organization: "owner",
    patient: "patient",
  },
  DeviceDefinition: {
    parent: "parentDevice",
  },
  DeviceMetric: {
    parent: "parent",
    source: "source",
  },
  DeviceRequest: {
    "based-on": "basedOn",
    "instantiates-canonical": "instantiatesCanonical",
    insurance: "insurance",
    performer: "performer",
    "prior-request": "priorRequest",
    requester: "requester",
    subject: "subject",
  },
  DeviceUseStatement: {
    device: "device",
    subject: "subject",
  },
  DiagnosticReport: {
    "based-on": "basedOn",
    media: "media.link",
    performer: "performer",
    result: "result",
    "results-interpreter": "resultsInterpreter",
    specimen: "specimen",
    subject: "subject",
  },
  DocumentManifest: {
    author: "author",
    item: "content",
    recipient: "recipient",
    "related-ref": "related.ref",
    subject: "subject",
  },
  DocumentReference: {
    authenticator: "authenticator",
    author: "author",
    custodian: "custodian",
    related: "context.related",
    relatesto: "relatesTo.target",
    subject: "subject",
  },
  Encounter: {
    account: "account",
    appointment: "appointment",
    "based-on": "basedOn",
    diagnosis: "diagnosis.condition",
    "episode-of-care": "episodeOfCare",
    location: "location.location",
    "part-of": "partOf",
    participant: "participant.individual",
    practitioner: "participant.individual",
    "reason-reference": "reasonReference",
    "service-provider": "serviceProvider",
    subject: "subject",
  },
  Endpoint: {
    organization: "managingOrganization",
  },
  EnrollmentRequest: {
    patient: "candidate",
    subject: "candidate",
  },
  EnrollmentResponse: {
    request: "request",
  },
  EpisodeOfCare: {
    "care-manager": "careManager",
    condition: "diagnosis.condition",
    "incoming-referral": "referralRequest",
    organization: "managingOrganization",
  },
  ExplanationOfBenefit: {
    "care-team": "careTeam.provider",
    claim: "claim",
    coverage: "insurance.coverage",
    "detail-udi": "item.detail.udi",
    encounter: "item.encounter",
    enterer: "enterer",
    facility: "facility",
    "item-udi": "item.udi",
    patient: "patient",
    payee: "payee.party",
    "procedure-udi": "procedure.udi",
    provider: "provider",
    "subdetail-udi": "item.detail.subDetail.udi",
  },
  FamilyMemberHistory: {
    "instantiates-canonical": "instantiatesCanonical",
  },
  Flag: {
    author: "author",
    subject: "subject",
  },
  Goal: {
    subject: "subject",
  },
  Group: {
    "managing-entity": "managingEntity",
    member: "member.entity",
  },
  GuidanceResponse: {
    patient: "subject",
    subject: "subject",
  },
  HealthcareService: {
    "coverage-area": "coverageArea",
    endpoint: "endpoint",
    location: "location",
    organization: "providedBy",
  },
  ImagingStudy: {
    basedon: "basedOn",
    encounter: "encounter",
    endpoint: ["endpoint", "series.endpoint"],
    interpreter: "interpreter",
    performer: "series.performer.actor",
    referrer: "referrer",
    subject: "subject",
  },
  Immunization: {
    location: "location",
    manufacturer: "manufacturer",
    performer: "performer.actor",
    reaction: "reaction.detail",
    "reason-reference": "reasonReference",
  },
  ImmunizationEvaluation: {
    "immunization-event": "immunizationEvent",
    patient: "patient",
  },
  ImmunizationRecommendation: {
    information: "recommendation.supportingPatientInformation",
    patient: "patient",
    support: "recommendation.supportingImmunization",
  },
  ImplementationGuide: {
    "depends-on": "dependsOn.uri",
    global: "global.profile",
    resource: "definition.resource",
  },
  InsurancePlan: {
    "administered-by": "administeredBy",
    endpoint: "endpoint",
    "owned-by": "ownedBy",
  },
  Invoice: {
    account: "account",
    issuer: "issuer",
    participant: "participant.actor",
    patient: "subject",
    recipient: "recipient",
    subject: "subject",
  },
  Linkage: {
    author: "author",
    item: "item.resource",
    source: "item.resource",
  },
  List: {
    item: "entry.item",
    source: "source",
    subject: "subject",
  },
  Location: {
    endpoint: "endpoint",
    organization: "managingOrganization",
    partof: "partOf",
  },
  MeasureReport: {
    "evaluated-resource": "evaluatedResource",
    measure: "measure",
    patient: "subject",
    reporter: "reporter",
    subject: "subject",
  },
  Media: {
    "based-on": "basedOn",
    device: "device",
    encounter: "encounter",
    operator: "operator",
    patient: "subject",
    subject: "subject",
  },
  Medication: {
    manufacturer: "manufacturer",
  },
  MedicationAdministration: {
    context: "context",
    device: "device",
    performer: "performer.actor",
    request: "request",
    subject: "subject",
  },
  MedicationDispense: {
    context: "context",
    destination: "destination",
    performer: "performer.actor",
    prescription: "authorizingPrescription",
    receiver: "receiver",
    responsibleparty: "substitution.responsibleParty",
    subject: "subject",
  },
  MedicationKnowledge: {
    manufacturer: "manufacturer",
    monograph: "monograph.source",
  },
  MedicationRequest: {
    encounter: "encounter",
    "intended-dispenser": "dispenseRequest.performer",
    "intended-performer": "performer",
    requester: "requester",
    subject: "subject",
  },
  MedicationStatement: {
    context: "context",
    "part-of": "partOf",
    source: "informationSource",
    subject: "subject",
  },
  MedicinalProductAuthorization: {
    holder: "holder",
    subject: "subject",
  },
  MedicinalProductContraindication: {
    subject: "subject",
  },
  MedicinalProductIndication: {
    subject: "subject",
  },
  MedicinalProductInteraction: {
    subject: "subject",
  },
  MedicinalProductPackaged: {
    subject: "subject",
  },
  MedicinalProductUndesirableEffect: {
    subject: "subject",
  },
  MessageDefinition: {
    parent: "parent",
  },
  MessageHeader: {
    author: "author",
    enterer: "enterer",
    focus: "focus",
    receiver: "destination.receiver",
    responsible: "responsible",
    sender: "sender",
    target: "destination.target",
  },
  MolecularSequence: {
    patient: "patient",
  },
  NutritionOrder: {
    "instantiates-canonical": "instantiatesCanonical",
    provider: "orderer",
  },
  Observation: {
    "based-on": "basedOn",
    "derived-from": "derivedFrom",
    device: "device",
    focus: "focus",
    "has-member": "hasMember",
    "part-of": "partOf",
    performer: "performer",
    specimen: "specimen",
    subject: "subject",
  },
  OperationDefinition: {
    base: "base",
    "input-profile": "inputProfile",
    "output-profile": "outputProfile",
  },
  Organization: {
    endpoint: "endpoint",
    partof: "partOf",
  },
  OrganizationAffiliation: {
    endpoint: "endpoint",
    location: "location",
    network: "network",
    "participating-organization": "participatingOrganization",
    "primary-organization": "organization",
    service: "healthcareService",
  },
  Patient: {
    "general-practitioner": "generalPractitioner",
    link: "link.other",
    organization: "managingOrganization",
  },
  PaymentNotice: {
    provider: "provider",
    request: "request",
    response: "response",
  },
  PaymentReconciliation: {
    "payment-issuer": "paymentIssuer",
    request: "request",
    requestor: "requestor",
  },
  Person: {
    link: "link.target",
    organization: "managingOrganization",
    patient: "link.target",
    practitioner: "link.target",
    relatedperson: "link.target",
  },
  PlanDefinition: {
    definition: "action.definition",
  },
  PractitionerRole: {
    endpoint: "endpoint",
    location: "location",
    organization: "organization",
    practitioner: "practitioner",
    service: "healthcareService",
  },
  Procedure: {
    "based-on": "basedOn",
    "instantiates-canonical": "instantiatesCanonical",
    location: "location",
    "part-of": "partOf",
    performer: "performer.actor",
    "reason-reference": "reasonReference",
    subject: "subject",
  },
  Provenance: {
    agent: "agent.who",
    entity: "entity.what",
    location: "location",
    patient: "target",
    target: "target",
  },
  QuestionnaireResponse: {
    author: "author",
    "based-on": "basedOn",
    encounter: "encounter",
    "part-of": "partOf",
    patient: "subject",
    questionnaire: "questionnaire",
    source: "source",
    subject: "subject",
  },
  RelatedPerson: {
    patient: "patient",
  },
  RequestGroup: {
    author: "author",
    encounter: "encounter",
    participant: "action.participant",
    patient: "subject",
    subject: "subject",
  },
  ResearchStudy: {
    partof: "partOf",
    principalinvestigator: "principalInvestigator",
    protocol: "protocol",
    site: "site",
    sponsor: "sponsor",
  },
  ResearchSubject: {
    individual: "individual",
    patient: "individual",
    study: "study",
  },
  RiskAssessment: {
    condition: "condition",
    performer: "performer",
    subject: "subject",
  },
  Schedule: {
    actor: "actor",
  },
  SearchParameter: {
    component: "component.definition",
    "derived-from": "derivedFrom",
  },
  ServiceRequest: {
    "based-on": "basedOn",
    "instantiates-canonical": "instantiatesCanonical",
    performer: "performer",
    replaces: "replaces",
    requester: "requester",
    specimen: "specimen",
    subject: "subject",
  },
  Slot: {
    schedule: "schedule",
  },
  Specimen: {
    collector: "collection.collector",
    parent: "parent",
    patient: "subject",
    subject: "subject",
  },
  StructureDefinition: {
    base: "baseDefinition",
    valueset: "snapshot.element.binding.valueSet",
  },
  SupplyDelivery: {
    receiver: "receiver",
    supplier: "supplier",
  },
  SupplyRequest: {
    requester: "requester",
    subject: "deliverTo",
    supplier: "supplier",
  },
  Task: {
    "based-on": "basedOn",
    encounter: "encounter",
    focus: "focus",
    owner: "owner",
    "part-of": "partOf",
    patient: "for",
    requester: "requester",
    subject: "for",
  },
  TestReport: {
    testscript: "testScript",
  },
  VerificationResult: {
    target: "target",
  },
  VisionPrescription: {
    prescriber: "prescriber",
  },
};

import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Reference,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDateTime,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface TestPlanDependency extends BackboneElement {
  description?: FhirMarkdown;
  predecessor?: Reference;
}

export interface TestPlanTestCaseDependency extends BackboneElement {
  description?: FhirMarkdown;
  predecessor?: Reference;
}

export interface TestPlanTestCaseTestRunScript extends BackboneElement {
  language?: CodeableConcept;
  sourceString?: FhirString;
  sourceReference?: Reference;
}

export interface TestPlanTestCaseTestRun extends BackboneElement {
  narrative?: FhirMarkdown;
  script?: TestPlanTestCaseTestRunScript;
}

export interface TestPlanTestCaseTestData extends BackboneElement {
  type: Coding;
  content?: Reference;
  sourceString?: FhirString;
  sourceReference?: Reference;
}

export interface TestPlanTestCaseAssertion extends BackboneElement {
  type?: CodeableConcept[];
  object?: CodeableReference[];
  result?: CodeableReference[];
}

export interface TestPlanTestCase extends BackboneElement {
  sequence?: FhirInteger;
  scope?: Reference[];
  dependency?: TestPlanTestCaseDependency[];
  testRun?: TestPlanTestCaseTestRun[];
  testData?: TestPlanTestCaseTestData[];
  assertion?: TestPlanTestCaseAssertion[];
}

export interface TestPlan extends DomainResource {
  resourceType: "TestPlan";
  url?: FhirUri;
  identifier?: Identifier[];
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
  category?: CodeableConcept[];
  scope?: Reference[];
  testTools?: FhirMarkdown;
  dependency?: TestPlanDependency[];
  exitCriteria?: FhirMarkdown;
  testCase?: TestPlanTestCase[];
}

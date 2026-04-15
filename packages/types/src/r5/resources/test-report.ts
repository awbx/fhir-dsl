import type { BackboneElement, DomainResource, Identifier } from "../datatypes.js";
import type {
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirDecimal,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface TestReportParticipant extends BackboneElement {
  type: FhirCode;
  uri: FhirUri;
  display?: FhirString;
}

export interface TestReportSetupActionOperation extends BackboneElement {
  result: FhirCode;
  message?: FhirMarkdown;
  detail?: FhirUri;
}

export interface TestReportSetupActionAssertRequirement extends BackboneElement {
  linkUri?: FhirUri;
  linkCanonical?: FhirCanonical;
}

export interface TestReportSetupActionAssert extends BackboneElement {
  result: FhirCode;
  message?: FhirMarkdown;
  detail?: FhirString;
  requirement?: TestReportSetupActionAssertRequirement[];
}

export interface TestReportSetupAction extends BackboneElement {
  operation?: TestReportSetupActionOperation;
  assert?: TestReportSetupActionAssert;
}

export interface TestReportSetup extends BackboneElement {
  action: TestReportSetupAction[];
}

export interface TestReportTestAction extends BackboneElement {
  operation?: TestReportSetupActionOperation;
  assert?: TestReportSetupActionAssert;
}

export interface TestReportTest extends BackboneElement {
  name?: FhirString;
  description?: FhirString;
  action: TestReportTestAction[];
}

export interface TestReportTeardownAction extends BackboneElement {
  operation: TestReportSetupActionOperation;
}

export interface TestReportTeardown extends BackboneElement {
  action: TestReportTeardownAction[];
}

export interface TestReport extends DomainResource {
  resourceType: "TestReport";
  identifier?: Identifier;
  name?: FhirString;
  status: FhirCode;
  testScript: FhirCanonical;
  result: FhirCode;
  score?: FhirDecimal;
  tester?: FhirString;
  issued?: FhirDateTime;
  participant?: TestReportParticipant[];
  setup?: TestReportSetup;
  test?: TestReportTest[];
  teardown?: TestReportTeardown;
}

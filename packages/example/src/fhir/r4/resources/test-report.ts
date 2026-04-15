import type { FhirCode, FhirDateTime, FhirDecimal, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { BackboneElement, DomainResource, Identifier, Reference } from "../datatypes.js";

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

export interface TestReportSetupActionAssert extends BackboneElement {
  result: FhirCode;
  message?: FhirMarkdown;
  detail?: FhirString;
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
  testScript: Reference<"TestScript">;
  result: FhirCode;
  score?: FhirDecimal;
  tester?: FhirString;
  issued?: FhirDateTime;
  participant?: TestReportParticipant[];
  setup?: TestReportSetup;
  test?: TestReportTest[];
  teardown?: TestReportTeardown;
}

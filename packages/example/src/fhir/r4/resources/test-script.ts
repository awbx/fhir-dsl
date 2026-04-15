import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Reference,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirId,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface TestScriptOrigin extends BackboneElement {
  index: FhirInteger;
  profile: Coding;
}

export interface TestScriptDestination extends BackboneElement {
  index: FhirInteger;
  profile: Coding;
}

export interface TestScriptMetadataLink extends BackboneElement {
  url: FhirUri;
  description?: FhirString;
}

export interface TestScriptMetadataCapability extends BackboneElement {
  required: FhirBoolean;
  validated: FhirBoolean;
  description?: FhirString;
  origin?: FhirInteger[];
  destination?: FhirInteger;
  link?: FhirUri[];
  capabilities: FhirCanonical;
}

export interface TestScriptMetadata extends BackboneElement {
  link?: TestScriptMetadataLink[];
  capability: TestScriptMetadataCapability[];
}

export interface TestScriptFixture extends BackboneElement {
  autocreate: FhirBoolean;
  autodelete: FhirBoolean;
  resource?: Reference<"Resource">;
}

export interface TestScriptVariable extends BackboneElement {
  name: FhirString;
  defaultValue?: FhirString;
  description?: FhirString;
  expression?: FhirString;
  headerField?: FhirString;
  hint?: FhirString;
  path?: FhirString;
  sourceId?: FhirId;
}

export interface TestScriptSetupActionOperationRequestHeader extends BackboneElement {
  field: FhirString;
  value: FhirString;
}

export interface TestScriptSetupActionOperation extends BackboneElement {
  type?: Coding;
  resource?: FhirCode;
  label?: FhirString;
  description?: FhirString;
  accept?: FhirCode;
  contentType?: FhirCode;
  destination?: FhirInteger;
  encodeRequestUrl: FhirBoolean;
  method?: FhirCode;
  origin?: FhirInteger;
  params?: FhirString;
  requestHeader?: TestScriptSetupActionOperationRequestHeader[];
  requestId?: FhirId;
  responseId?: FhirId;
  sourceId?: FhirId;
  targetId?: FhirId;
  url?: FhirString;
}

export interface TestScriptSetupActionAssert extends BackboneElement {
  label?: FhirString;
  description?: FhirString;
  direction?: FhirCode;
  compareToSourceId?: FhirString;
  compareToSourceExpression?: FhirString;
  compareToSourcePath?: FhirString;
  contentType?: FhirCode;
  expression?: FhirString;
  headerField?: FhirString;
  minimumId?: FhirString;
  navigationLinks?: FhirBoolean;
  operator?: FhirCode;
  path?: FhirString;
  requestMethod?: FhirCode;
  requestURL?: FhirString;
  resource?: FhirCode;
  response?: FhirCode;
  responseCode?: FhirString;
  sourceId?: FhirId;
  validateProfileId?: FhirId;
  value?: FhirString;
  warningOnly: FhirBoolean;
}

export interface TestScriptSetupAction extends BackboneElement {
  operation?: TestScriptSetupActionOperation;
  assert?: TestScriptSetupActionAssert;
}

export interface TestScriptSetup extends BackboneElement {
  action: TestScriptSetupAction[];
}

export interface TestScriptTestAction extends BackboneElement {
  operation?: TestScriptSetupActionOperation;
  assert?: TestScriptSetupActionAssert;
}

export interface TestScriptTest extends BackboneElement {
  name?: FhirString;
  description?: FhirString;
  action: TestScriptTestAction[];
}

export interface TestScriptTeardownAction extends BackboneElement {
  operation: TestScriptSetupActionOperation;
}

export interface TestScriptTeardown extends BackboneElement {
  action: TestScriptTeardownAction[];
}

export interface TestScript extends DomainResource {
  resourceType: "TestScript";
  url: FhirUri;
  identifier?: Identifier;
  version?: FhirString;
  name: FhirString;
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
  origin?: TestScriptOrigin[];
  destination?: TestScriptDestination[];
  metadata?: TestScriptMetadata;
  fixture?: TestScriptFixture[];
  profile?: Reference<"Resource">[];
  variable?: TestScriptVariable[];
  setup?: TestScriptSetup;
  test?: TestScriptTest[];
  teardown?: TestScriptTeardown;
}

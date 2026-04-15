import type {
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ExampleScenarioActor extends BackboneElement {
  actorId: FhirString;
  type: FhirCode;
  name?: FhirString;
  description?: FhirMarkdown;
}

export interface ExampleScenarioInstanceVersion extends BackboneElement {
  versionId: FhirString;
  description: FhirMarkdown;
}

export interface ExampleScenarioInstanceContainedInstance extends BackboneElement {
  resourceId: FhirString;
  versionId?: FhirString;
}

export interface ExampleScenarioInstance extends BackboneElement {
  resourceId: FhirString;
  resourceType: FhirCode;
  name?: FhirString;
  description?: FhirMarkdown;
  version?: ExampleScenarioInstanceVersion[];
  containedInstance?: ExampleScenarioInstanceContainedInstance[];
}

export interface ExampleScenarioProcessStepOperation extends BackboneElement {
  number: FhirString;
  type?: FhirString;
  name?: FhirString;
  initiator?: FhirString;
  receiver?: FhirString;
  description?: FhirMarkdown;
  initiatorActive?: FhirBoolean;
  receiverActive?: FhirBoolean;
  request?: ExampleScenarioInstanceContainedInstance;
  response?: ExampleScenarioInstanceContainedInstance;
}

export interface ExampleScenarioProcessStepAlternative extends BackboneElement {
  title: FhirString;
  description?: FhirMarkdown;
  step?: ExampleScenarioProcessStep[];
}

export interface ExampleScenarioProcessStep extends BackboneElement {
  process?: ExampleScenarioProcess[];
  pause?: FhirBoolean;
  operation?: ExampleScenarioProcessStepOperation;
  alternative?: ExampleScenarioProcessStepAlternative[];
}

export interface ExampleScenarioProcess extends BackboneElement {
  title: FhirString;
  description?: FhirMarkdown;
  preConditions?: FhirMarkdown;
  postConditions?: FhirMarkdown;
  step?: ExampleScenarioProcessStep[];
}

export interface ExampleScenario extends DomainResource {
  resourceType: "ExampleScenario";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  copyright?: FhirMarkdown;
  purpose?: FhirMarkdown;
  actor?: ExampleScenarioActor[];
  instance?: ExampleScenarioInstance[];
  process?: ExampleScenarioProcess[];
  workflow?: FhirCanonical[];
}

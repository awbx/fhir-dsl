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
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ExampleScenarioActor extends BackboneElement {
  key: FhirString;
  type: FhirCode;
  title: FhirString;
  description?: FhirMarkdown;
}

export interface ExampleScenarioInstanceVersion extends BackboneElement {
  key: FhirString;
  title: FhirString;
  description?: FhirMarkdown;
  content?: Reference;
}

export interface ExampleScenarioInstanceContainedInstance extends BackboneElement {
  instanceReference: FhirString;
  versionReference?: FhirString;
}

export interface ExampleScenarioInstance extends BackboneElement {
  key: FhirString;
  structureType: Coding;
  structureVersion?: FhirString;
  structureProfileCanonical?: FhirCanonical;
  structureProfileUri?: FhirUri;
  title: FhirString;
  description?: FhirMarkdown;
  content?: Reference;
  version?: ExampleScenarioInstanceVersion[];
  containedInstance?: ExampleScenarioInstanceContainedInstance[];
}

export interface ExampleScenarioProcessStepOperation extends BackboneElement {
  type?: Coding;
  title: FhirString;
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
  number?: FhirString;
  process?: ExampleScenarioProcess;
  workflow?: FhirCanonical;
  operation?: ExampleScenarioProcessStepOperation;
  alternative?: ExampleScenarioProcessStepAlternative[];
  pause?: FhirBoolean;
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
  actor?: ExampleScenarioActor[];
  instance?: ExampleScenarioInstance[];
  process?: ExampleScenarioProcess[];
}

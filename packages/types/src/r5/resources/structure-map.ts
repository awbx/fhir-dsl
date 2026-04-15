import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirId,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirTime,
  FhirUri,
} from "../primitives.js";

export interface StructureMapStructure extends BackboneElement {
  url: FhirCanonical;
  mode: FhirCode;
  alias?: FhirString;
  documentation?: FhirString;
}

export interface StructureMapConst extends BackboneElement {
  name?: FhirId;
  value?: FhirString;
}

export interface StructureMapGroupInput extends BackboneElement {
  name: FhirId;
  type?: FhirString;
  mode: FhirCode;
  documentation?: FhirString;
}

export interface StructureMapGroupRuleSource extends BackboneElement {
  context: FhirId;
  min?: FhirInteger;
  max?: FhirString;
  type?: FhirString;
  defaultValue?: FhirString;
  element?: FhirString;
  listMode?: FhirCode;
  variable?: FhirId;
  condition?: FhirString;
  check?: FhirString;
  logMessage?: FhirString;
}

export interface StructureMapGroupRuleTargetParameter extends BackboneElement {
  valueId?: FhirId;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueDecimal?: FhirDecimal;
  valueDate?: FhirDate;
  valueTime?: FhirTime;
  valueDateTime?: FhirDateTime;
}

export interface StructureMapGroupRuleTarget extends BackboneElement {
  context?: FhirString;
  element?: FhirString;
  variable?: FhirId;
  listMode?: FhirCode[];
  listRuleId?: FhirId;
  transform?: FhirCode;
  parameter?: StructureMapGroupRuleTargetParameter[];
}

export interface StructureMapGroupRuleDependent extends BackboneElement {
  name: FhirId;
  parameter: StructureMapGroupRuleTargetParameter[];
}

export interface StructureMapGroupRule extends BackboneElement {
  name?: FhirId;
  source: StructureMapGroupRuleSource[];
  target?: StructureMapGroupRuleTarget[];
  rule?: StructureMapGroupRule[];
  dependent?: StructureMapGroupRuleDependent[];
  documentation?: FhirString;
}

export interface StructureMapGroup extends BackboneElement {
  name: FhirId;
  extends?: FhirId;
  typeMode?: FhirCode;
  documentation?: FhirString;
  input: StructureMapGroupInput[];
  rule?: StructureMapGroupRule[];
}

export interface StructureMap extends DomainResource {
  resourceType: "StructureMap";
  url: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
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
  copyrightLabel?: FhirString;
  structure?: StructureMapStructure[];
  import?: FhirCanonical[];
  const?: StructureMapConst[];
  group: StructureMapGroup[];
}

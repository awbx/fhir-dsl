import type {
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Period,
  UsageContext,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirMarkdown, FhirString } from "../primitives.js";

export interface NamingSystemUniqueId extends BackboneElement {
  type: FhirCode;
  value: FhirString;
  preferred?: FhirBoolean;
  comment?: FhirString;
  period?: Period;
}

export interface NamingSystem extends DomainResource {
  resourceType: "NamingSystem";
  name: FhirString;
  status: FhirCode;
  kind: FhirCode;
  date: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  responsible?: FhirString;
  type?: CodeableConcept;
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  usage?: FhirString;
  uniqueId: NamingSystemUniqueId[];
}

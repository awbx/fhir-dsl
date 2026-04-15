import type { CodeableConcept, Coding, ContactDetail, DomainResource, Identifier, UsageContext } from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
  FhirUrl,
} from "../primitives.js";

export interface ActorDefinition extends DomainResource {
  resourceType: "ActorDefinition";
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
  type: FhirCode;
  documentation?: FhirMarkdown;
  reference?: FhirUrl[];
  capabilities?: FhirCanonical;
  derivedFrom?: FhirCanonical[];
}

import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  ExtendedContactDetail,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirMarkdown, FhirString } from "../primitives.js";

export interface OrganizationQualification extends BackboneElement {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference<"Organization">;
}

export interface Organization extends DomainResource {
  resourceType: "Organization";
  identifier?: Identifier[];
  active?: FhirBoolean;
  type?: CodeableConcept[];
  name?: FhirString;
  alias?: FhirString[];
  description?: FhirMarkdown;
  contact?: ExtendedContactDetail[];
  partOf?: Reference<"Organization">;
  endpoint?: Reference<"Endpoint">[];
  qualification?: OrganizationQualification[];
}

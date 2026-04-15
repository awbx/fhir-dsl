import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirDateTime, FhirMarkdown } from "../primitives.js";

export interface RegulatedAuthorizationCase extends BackboneElement {
  identifier?: Identifier;
  type?: CodeableConcept;
  status?: CodeableConcept;
  datePeriod?: Period;
  dateDateTime?: FhirDateTime;
  application?: RegulatedAuthorizationCase[];
}

export interface RegulatedAuthorization extends DomainResource {
  resourceType: "RegulatedAuthorization";
  identifier?: Identifier[];
  subject?: Reference<
    | "MedicinalProductDefinition"
    | "BiologicallyDerivedProduct"
    | "NutritionProduct"
    | "PackagedProductDefinition"
    | "ManufacturedItemDefinition"
    | "Ingredient"
    | "SubstanceDefinition"
    | "DeviceDefinition"
    | "ResearchStudy"
    | "ActivityDefinition"
    | "PlanDefinition"
    | "ObservationDefinition"
    | "Practitioner"
    | "Organization"
    | "Location"
  >[];
  type?: CodeableConcept;
  description?: FhirMarkdown;
  region?: CodeableConcept[];
  status?: CodeableConcept;
  statusDate?: FhirDateTime;
  validityPeriod?: Period;
  indication?: CodeableReference[];
  intendedUse?: CodeableConcept;
  basis?: CodeableConcept[];
  holder?: Reference<"Organization">;
  regulator?: Reference<"Organization">;
  attachedDocument?: Reference<"DocumentReference">[];
  case?: RegulatedAuthorizationCase;
}

import type {
  Age,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  ContactDetail,
  DomainResource,
  Dosage,
  Duration,
  Expression,
  Identifier,
  Period,
  Quantity,
  Range,
  Reference,
  RelatedArtifact,
  Timing,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ActivityDefinitionParticipant extends BackboneElement {
  type?: FhirCode;
  typeCanonical?: FhirCanonical;
  typeReference?: Reference<
    | "CareTeam"
    | "Device"
    | "DeviceDefinition"
    | "Endpoint"
    | "Group"
    | "HealthcareService"
    | "Location"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
  >;
  role?: CodeableConcept;
  function?: CodeableConcept;
}

export interface ActivityDefinitionDynamicValue extends BackboneElement {
  path: FhirString;
  expression: Expression;
}

export interface ActivityDefinition extends DomainResource {
  resourceType: "ActivityDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<
    | "Group"
    | "MedicinalProductDefinition"
    | "SubstanceDefinition"
    | "AdministrableProductDefinition"
    | "ManufacturedItemDefinition"
    | "PackagedProductDefinition"
  >;
  subjectCanonical?: FhirCanonical;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  topic?: CodeableConcept[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  library?: FhirCanonical[];
  kind?: FhirCode;
  profile?: FhirCanonical;
  code?: CodeableConcept;
  intent?: FhirCode;
  priority?: FhirCode;
  doNotPerform?: FhirBoolean;
  timingTiming?: Timing;
  timingAge?: Age;
  timingRange?: Range;
  timingDuration?: Duration;
  asNeededBoolean?: FhirBoolean;
  asNeededCodeableConcept?: CodeableConcept;
  location?: CodeableReference;
  participant?: ActivityDefinitionParticipant[];
  productReference?: Reference<"Medication" | "Ingredient" | "Substance" | "SubstanceDefinition">;
  productCodeableConcept?: CodeableConcept;
  quantity?: Quantity;
  dosage?: Dosage[];
  bodySite?: CodeableConcept[];
  specimenRequirement?: FhirCanonical[];
  observationRequirement?: FhirCanonical[];
  observationResultRequirement?: FhirCanonical[];
  transform?: FhirCanonical;
  dynamicValue?: ActivityDefinitionDynamicValue[];
}

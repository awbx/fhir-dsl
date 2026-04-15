import type { FhirBoolean, FhirCanonical, FhirCode, FhirDate, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { Age, BackboneElement, CodeableConcept, ContactDetail, DomainResource, Dosage, Duration, Expression, Identifier, Period, Quantity, Range, Reference, RelatedArtifact, Timing, UsageContext } from "../datatypes.js";

export interface ActivityDefinitionParticipant extends BackboneElement {
  type: FhirCode;
  role?: CodeableConcept;
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
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirString;
  copyright?: FhirMarkdown;
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
  timingDateTime?: FhirDateTime;
  timingAge?: Age;
  timingPeriod?: Period;
  timingRange?: Range;
  timingDuration?: Duration;
  location?: Reference<"Location">;
  participant?: ActivityDefinitionParticipant[];
  productReference?: Reference<"Medication" | "Substance">;
  productCodeableConcept?: CodeableConcept;
  quantity?: Quantity;
  dosage?: Dosage[];
  bodySite?: CodeableConcept[];
  specimenRequirement?: Reference<"SpecimenDefinition">[];
  observationRequirement?: Reference<"ObservationDefinition">[];
  observationResultRequirement?: Reference<"ObservationDefinition">[];
  transform?: FhirCanonical;
  dynamicValue?: ActivityDefinitionDynamicValue[];
}

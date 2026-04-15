import type {
  Age,
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Range,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface AllergyIntoleranceParticipant extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "Device" | "Organization" | "CareTeam"
  >;
}

export interface AllergyIntoleranceReaction extends BackboneElement {
  substance?: CodeableConcept;
  manifestation: CodeableReference[];
  description?: FhirString;
  onset?: FhirDateTime;
  severity?: FhirCode;
  exposureRoute?: CodeableConcept;
  note?: Annotation[];
}

export interface AllergyIntolerance extends DomainResource {
  resourceType: "AllergyIntolerance";
  identifier?: Identifier[];
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  type?: CodeableConcept;
  category?: FhirCode[];
  criticality?: FhirCode;
  code?: CodeableConcept;
  patient: Reference<"Patient">;
  encounter?: Reference<"Encounter">;
  onsetDateTime?: FhirDateTime;
  onsetAge?: Age;
  onsetPeriod?: Period;
  onsetRange?: Range;
  onsetString?: FhirString;
  recordedDate?: FhirDateTime;
  participant?: AllergyIntoleranceParticipant[];
  lastOccurrence?: FhirDateTime;
  note?: Annotation[];
  reaction?: AllergyIntoleranceReaction[];
}

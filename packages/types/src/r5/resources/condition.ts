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
import type { FhirDateTime, FhirString } from "../primitives.js";

export interface ConditionParticipant extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "Device" | "Organization" | "CareTeam"
  >;
}

export interface ConditionStage extends BackboneElement {
  summary?: CodeableConcept;
  assessment?: Reference<"ClinicalImpression" | "DiagnosticReport" | "Observation">[];
  type?: CodeableConcept;
}

export interface Condition extends DomainResource {
  resourceType: "Condition";
  identifier?: Identifier[];
  clinicalStatus: CodeableConcept;
  verificationStatus?: CodeableConcept;
  category?: CodeableConcept[];
  severity?: CodeableConcept;
  code?: CodeableConcept;
  bodySite?: CodeableConcept[];
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  onsetDateTime?: FhirDateTime;
  onsetAge?: Age;
  onsetPeriod?: Period;
  onsetRange?: Range;
  onsetString?: FhirString;
  abatementDateTime?: FhirDateTime;
  abatementAge?: Age;
  abatementPeriod?: Period;
  abatementRange?: Range;
  abatementString?: FhirString;
  recordedDate?: FhirDateTime;
  participant?: ConditionParticipant[];
  stage?: ConditionStage[];
  evidence?: CodeableReference[];
  note?: Annotation[];
}

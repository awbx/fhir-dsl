import type { FhirDateTime, FhirString } from "../primitives.js";
import type { Age, Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Range, Reference } from "../datatypes.js";

export interface ConditionStage extends BackboneElement {
  summary?: CodeableConcept;
  assessment?: Reference<"ClinicalImpression" | "DiagnosticReport" | "Observation">[];
  type?: CodeableConcept;
}

export interface ConditionEvidence extends BackboneElement {
  code?: CodeableConcept[];
  detail?: Reference<"Resource">[];
}

export interface Condition extends DomainResource {
  resourceType: "Condition";
  identifier?: Identifier[];
  clinicalStatus?: CodeableConcept;
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
  recorder?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson">;
  asserter?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson">;
  stage?: ConditionStage[];
  evidence?: ConditionEvidence[];
  note?: Annotation[];
}

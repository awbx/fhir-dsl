import type { FhirBoolean, FhirCanonical, FhirCode, FhirDate, FhirDateTime, FhirString, FhirUri } from "../primitives.js";
import type { Age, Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Range, Reference } from "../datatypes.js";

export interface FamilyMemberHistoryCondition extends BackboneElement {
  code: CodeableConcept;
  outcome?: CodeableConcept;
  contributedToDeath?: FhirBoolean;
  onsetAge?: Age;
  onsetRange?: Range;
  onsetPeriod?: Period;
  onsetString?: FhirString;
  note?: Annotation[];
}

export interface FamilyMemberHistory extends DomainResource {
  resourceType: "FamilyMemberHistory";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  status: FhirCode;
  dataAbsentReason?: CodeableConcept;
  patient: Reference<"Patient">;
  date?: FhirDateTime;
  name?: FhirString;
  relationship: CodeableConcept;
  sex?: CodeableConcept;
  bornPeriod?: Period;
  bornDate?: FhirDate;
  bornString?: FhirString;
  ageAge?: Age;
  ageRange?: Range;
  ageString?: FhirString;
  estimatedAge?: FhirBoolean;
  deceasedBoolean?: FhirBoolean;
  deceasedAge?: Age;
  deceasedRange?: Range;
  deceasedDate?: FhirDate;
  deceasedString?: FhirString;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "AllergyIntolerance" | "QuestionnaireResponse" | "DiagnosticReport" | "DocumentReference">[];
  note?: Annotation[];
  condition?: FamilyMemberHistoryCondition[];
}

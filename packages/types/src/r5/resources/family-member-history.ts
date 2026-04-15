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
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface FamilyMemberHistoryParticipant extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "Device" | "Organization" | "CareTeam"
  >;
}

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

export interface FamilyMemberHistoryProcedure extends BackboneElement {
  code: CodeableConcept;
  outcome?: CodeableConcept;
  contributedToDeath?: FhirBoolean;
  performedAge?: Age;
  performedRange?: Range;
  performedPeriod?: Period;
  performedString?: FhirString;
  performedDateTime?: FhirDateTime;
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
  participant?: FamilyMemberHistoryParticipant[];
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
  reason?: CodeableReference[];
  note?: Annotation[];
  condition?: FamilyMemberHistoryCondition[];
  procedure?: FamilyMemberHistoryProcedure[];
}

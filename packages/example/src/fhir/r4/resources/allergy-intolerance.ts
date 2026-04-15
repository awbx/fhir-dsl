import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";
import type { Age, Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Range, Reference } from "../datatypes.js";

export interface AllergyIntoleranceReaction extends BackboneElement {
  substance?: CodeableConcept;
  manifestation: CodeableConcept[];
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
  type?: FhirCode;
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
  recorder?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson">;
  asserter?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole">;
  lastOccurrence?: FhirDateTime;
  note?: Annotation[];
  reaction?: AllergyIntoleranceReaction[];
}

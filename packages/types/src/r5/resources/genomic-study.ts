import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";

export interface GenomicStudyAnalysisInput extends BackboneElement {
  file?: Reference<"DocumentReference">;
  type?: CodeableConcept;
  generatedByIdentifier?: Identifier;
  generatedByReference?: Reference<"GenomicStudy">;
}

export interface GenomicStudyAnalysisOutput extends BackboneElement {
  file?: Reference<"DocumentReference">;
  type?: CodeableConcept;
}

export interface GenomicStudyAnalysisPerformer extends BackboneElement {
  actor?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Device">;
  role?: CodeableConcept;
}

export interface GenomicStudyAnalysisDevice extends BackboneElement {
  device?: Reference<"Device">;
  function?: CodeableConcept;
}

export interface GenomicStudyAnalysis extends BackboneElement {
  identifier?: Identifier[];
  methodType?: CodeableConcept[];
  changeType?: CodeableConcept[];
  genomeBuild?: CodeableConcept;
  instantiatesCanonical?: FhirCanonical;
  instantiatesUri?: FhirUri;
  title?: FhirString;
  focus?: Reference<"Resource">[];
  specimen?: Reference<"Specimen">[];
  date?: FhirDateTime;
  note?: Annotation[];
  protocolPerformed?: Reference<"Procedure" | "Task">;
  regionsStudied?: Reference<"DocumentReference" | "Observation">[];
  regionsCalled?: Reference<"DocumentReference" | "Observation">[];
  input?: GenomicStudyAnalysisInput[];
  output?: GenomicStudyAnalysisOutput[];
  performer?: GenomicStudyAnalysisPerformer[];
  device?: GenomicStudyAnalysisDevice[];
}

export interface GenomicStudy extends DomainResource {
  resourceType: "GenomicStudy";
  identifier?: Identifier[];
  status: FhirCode;
  type?: CodeableConcept[];
  subject: Reference<"Patient" | "Group" | "Substance" | "BiologicallyDerivedProduct" | "NutritionProduct">;
  encounter?: Reference<"Encounter">;
  startDate?: FhirDateTime;
  basedOn?: Reference<"ServiceRequest" | "Task">[];
  referrer?: Reference<"Practitioner" | "PractitionerRole">;
  interpreter?: Reference<"Practitioner" | "PractitionerRole">[];
  reason?: CodeableReference[];
  instantiatesCanonical?: FhirCanonical;
  instantiatesUri?: FhirUri;
  note?: Annotation[];
  description?: FhirMarkdown;
  analysis?: GenomicStudyAnalysis[];
}

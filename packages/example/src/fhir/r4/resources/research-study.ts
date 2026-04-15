import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
} from "../datatypes.js";
import type { FhirCode, FhirMarkdown, FhirString } from "../primitives.js";

export interface ResearchStudyArm extends BackboneElement {
  name: FhirString;
  type?: CodeableConcept;
  description?: FhirString;
}

export interface ResearchStudyObjective extends BackboneElement {
  name?: FhirString;
  type?: CodeableConcept;
}

export interface ResearchStudy extends DomainResource {
  resourceType: "ResearchStudy";
  identifier?: Identifier[];
  title?: FhirString;
  protocol?: Reference<"PlanDefinition">[];
  partOf?: Reference<"ResearchStudy">[];
  status: FhirCode;
  primaryPurposeType?: CodeableConcept;
  phase?: CodeableConcept;
  category?: CodeableConcept[];
  focus?: CodeableConcept[];
  condition?: CodeableConcept[];
  contact?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  keyword?: CodeableConcept[];
  location?: CodeableConcept[];
  description?: FhirMarkdown;
  enrollment?: Reference<"Group">[];
  period?: Period;
  sponsor?: Reference<"Organization">;
  principalInvestigator?: Reference<"Practitioner" | "PractitionerRole">;
  site?: Reference<"Location">[];
  reasonStopped?: CodeableConcept;
  note?: Annotation[];
  arm?: ResearchStudyArm[];
  objective?: ResearchStudyObjective[];
}

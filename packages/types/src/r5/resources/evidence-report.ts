import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  Narrative,
  Period,
  Quantity,
  Range,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";

export interface EvidenceReportSubjectCharacteristic extends BackboneElement {
  code: CodeableConcept;
  valueReference?: Reference<"Resource">;
  valueCodeableConcept?: CodeableConcept;
  valueBoolean?: FhirBoolean;
  valueQuantity?: Quantity;
  valueRange?: Range;
  exclude?: FhirBoolean;
  period?: Period;
}

export interface EvidenceReportSubject extends BackboneElement {
  characteristic?: EvidenceReportSubjectCharacteristic[];
  note?: Annotation[];
}

export interface EvidenceReportRelatesToTarget extends BackboneElement {
  url?: FhirUri;
  identifier?: Identifier;
  display?: FhirMarkdown;
  resource?: Reference<"Resource">;
}

export interface EvidenceReportRelatesTo extends BackboneElement {
  code: FhirCode;
  target: EvidenceReportRelatesToTarget;
}

export interface EvidenceReportSection extends BackboneElement {
  title?: FhirString;
  focus?: CodeableConcept;
  focusReference?: Reference<"Resource">;
  author?: Reference<
    "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Device" | "Group" | "Organization"
  >[];
  text?: Narrative;
  mode?: FhirCode;
  orderedBy?: CodeableConcept;
  entryClassifier?: CodeableConcept[];
  entryReference?: Reference<"Resource">[];
  entryQuantity?: Quantity[];
  emptyReason?: CodeableConcept;
  section?: EvidenceReportSection[];
}

export interface EvidenceReport extends DomainResource {
  resourceType: "EvidenceReport";
  url?: FhirUri;
  status: FhirCode;
  useContext?: UsageContext[];
  identifier?: Identifier[];
  relatedIdentifier?: Identifier[];
  citeAsReference?: Reference<"Citation">;
  citeAsMarkdown?: FhirMarkdown;
  type?: CodeableConcept;
  note?: Annotation[];
  relatedArtifact?: RelatedArtifact[];
  subject: EvidenceReportSubject;
  publisher?: FhirString;
  contact?: ContactDetail[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatesTo?: EvidenceReportRelatesTo[];
  section?: EvidenceReportSection[];
}

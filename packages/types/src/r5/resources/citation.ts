import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirPositiveInt,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface CitationSummary extends BackboneElement {
  style?: CodeableConcept;
  text: FhirMarkdown;
}

export interface CitationClassification extends BackboneElement {
  type?: CodeableConcept;
  classifier?: CodeableConcept[];
}

export interface CitationStatusDate extends BackboneElement {
  activity: CodeableConcept;
  actual?: FhirBoolean;
  period: Period;
}

export interface CitationCitedArtifactVersion extends BackboneElement {
  value: FhirString;
  baseCitation?: Reference<"Citation">;
}

export interface CitationCitedArtifactStatusDate extends BackboneElement {
  activity: CodeableConcept;
  actual?: FhirBoolean;
  period: Period;
}

export interface CitationCitedArtifactTitle extends BackboneElement {
  type?: CodeableConcept[];
  language?: CodeableConcept;
  text: FhirMarkdown;
}

export interface CitationCitedArtifactAbstract extends BackboneElement {
  type?: CodeableConcept;
  language?: CodeableConcept;
  text: FhirMarkdown;
  copyright?: FhirMarkdown;
}

export interface CitationCitedArtifactPart extends BackboneElement {
  type?: CodeableConcept;
  value?: FhirString;
  baseCitation?: Reference<"Citation">;
}

export interface CitationCitedArtifactRelatesTo extends BackboneElement {
  type: FhirCode;
  classifier?: CodeableConcept[];
  label?: FhirString;
  display?: FhirString;
  citation?: FhirMarkdown;
  document?: Attachment;
  resource?: FhirCanonical;
  resourceReference?: Reference;
}

export interface CitationCitedArtifactPublicationFormPublishedIn extends BackboneElement {
  type?: CodeableConcept;
  identifier?: Identifier[];
  title?: FhirString;
  publisher?: Reference<"Organization">;
  publisherLocation?: FhirString;
}

export interface CitationCitedArtifactPublicationForm extends BackboneElement {
  publishedIn?: CitationCitedArtifactPublicationFormPublishedIn;
  citedMedium?: CodeableConcept;
  volume?: FhirString;
  issue?: FhirString;
  articleDate?: FhirDateTime;
  publicationDateText?: FhirString;
  publicationDateSeason?: FhirString;
  lastRevisionDate?: FhirDateTime;
  language?: CodeableConcept[];
  accessionNumber?: FhirString;
  pageString?: FhirString;
  firstPage?: FhirString;
  lastPage?: FhirString;
  pageCount?: FhirString;
  copyright?: FhirMarkdown;
}

export interface CitationCitedArtifactWebLocation extends BackboneElement {
  classifier?: CodeableConcept[];
  url?: FhirUri;
}

export interface CitationCitedArtifactClassification extends BackboneElement {
  type?: CodeableConcept;
  classifier?: CodeableConcept[];
  artifactAssessment?: Reference<"ArtifactAssessment">[];
}

export interface CitationCitedArtifactContributorshipEntryContributionInstance extends BackboneElement {
  type: CodeableConcept;
  time?: FhirDateTime;
}

export interface CitationCitedArtifactContributorshipEntry extends BackboneElement {
  contributor: Reference<"Practitioner" | "Organization">;
  forenameInitials?: FhirString;
  affiliation?: Reference<"Organization" | "PractitionerRole">[];
  contributionType?: CodeableConcept[];
  role?: CodeableConcept;
  contributionInstance?: CitationCitedArtifactContributorshipEntryContributionInstance[];
  correspondingContact?: FhirBoolean;
  rankingOrder?: FhirPositiveInt;
}

export interface CitationCitedArtifactContributorshipSummary extends BackboneElement {
  type?: CodeableConcept;
  style?: CodeableConcept;
  source?: CodeableConcept;
  value: FhirMarkdown;
}

export interface CitationCitedArtifactContributorship extends BackboneElement {
  complete?: FhirBoolean;
  entry?: CitationCitedArtifactContributorshipEntry[];
  summary?: CitationCitedArtifactContributorshipSummary[];
}

export interface CitationCitedArtifact extends BackboneElement {
  identifier?: Identifier[];
  relatedIdentifier?: Identifier[];
  dateAccessed?: FhirDateTime;
  version?: CitationCitedArtifactVersion;
  currentState?: CodeableConcept[];
  statusDate?: CitationCitedArtifactStatusDate[];
  title?: CitationCitedArtifactTitle[];
  abstract?: CitationCitedArtifactAbstract[];
  part?: CitationCitedArtifactPart;
  relatesTo?: CitationCitedArtifactRelatesTo[];
  publicationForm?: CitationCitedArtifactPublicationForm[];
  webLocation?: CitationCitedArtifactWebLocation[];
  classification?: CitationCitedArtifactClassification[];
  contributorship?: CitationCitedArtifactContributorship;
  note?: Annotation[];
}

export interface Citation extends DomainResource {
  resourceType: "Citation";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  summary?: CitationSummary[];
  classification?: CitationClassification[];
  note?: Annotation[];
  currentState?: CodeableConcept[];
  statusDate?: CitationStatusDate[];
  relatedArtifact?: RelatedArtifact[];
  citedArtifact?: CitationCitedArtifact;
}

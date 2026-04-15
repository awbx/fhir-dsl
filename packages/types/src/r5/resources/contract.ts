import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  DomainResource,
  Identifier,
  Money,
  Period,
  Quantity,
  Reference,
  Signature,
  Timing,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirTime,
  FhirUnsignedInt,
  FhirUri,
} from "../primitives.js";

export interface ContractContentDefinition extends BackboneElement {
  type: CodeableConcept;
  subType?: CodeableConcept;
  publisher?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  publicationDate?: FhirDateTime;
  publicationStatus: FhirCode;
  copyright?: FhirMarkdown;
}

export interface ContractTermSecurityLabel extends BackboneElement {
  number?: FhirUnsignedInt[];
  classification: Coding;
  category?: Coding[];
  control?: Coding[];
}

export interface ContractTermOfferParty extends BackboneElement {
  reference: Reference<
    "Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Device" | "Group" | "Organization"
  >[];
  role: CodeableConcept;
}

export interface ContractTermOfferAnswer extends BackboneElement {
  valueBoolean?: FhirBoolean;
  valueDecimal?: FhirDecimal;
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueDateTime?: FhirDateTime;
  valueTime?: FhirTime;
  valueString?: FhirString;
  valueUri?: FhirUri;
  valueAttachment?: Attachment;
  valueCoding?: Coding;
  valueQuantity?: Quantity;
  valueReference?: Reference<"Resource">;
}

export interface ContractTermOffer extends BackboneElement {
  identifier?: Identifier[];
  party?: ContractTermOfferParty[];
  topic?: Reference<"Resource">;
  type?: CodeableConcept;
  decision?: CodeableConcept;
  decisionMode?: CodeableConcept[];
  answer?: ContractTermOfferAnswer[];
  text?: FhirString;
  linkId?: FhirString[];
  securityLabelNumber?: FhirUnsignedInt[];
}

export interface ContractTermAssetContext extends BackboneElement {
  reference?: Reference<"Resource">;
  code?: CodeableConcept[];
  text?: FhirString;
}

export interface ContractTermAssetValuedItem extends BackboneElement {
  entityCodeableConcept?: CodeableConcept;
  entityReference?: Reference<"Resource">;
  identifier?: Identifier;
  effectiveTime?: FhirDateTime;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  points?: FhirDecimal;
  net?: Money;
  payment?: FhirString;
  paymentDate?: FhirDateTime;
  responsible?: Reference<"Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  recipient?: Reference<"Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  linkId?: FhirString[];
  securityLabelNumber?: FhirUnsignedInt[];
}

export interface ContractTermAsset extends BackboneElement {
  scope?: CodeableConcept;
  type?: CodeableConcept[];
  typeReference?: Reference<"Resource">[];
  subtype?: CodeableConcept[];
  relationship?: Coding;
  context?: ContractTermAssetContext[];
  condition?: FhirString;
  periodType?: CodeableConcept[];
  period?: Period[];
  usePeriod?: Period[];
  text?: FhirString;
  linkId?: FhirString[];
  answer?: ContractTermOfferAnswer[];
  securityLabelNumber?: FhirUnsignedInt[];
  valuedItem?: ContractTermAssetValuedItem[];
}

export interface ContractTermActionSubject extends BackboneElement {
  reference: Reference<
    "Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Device" | "Group" | "Organization"
  >[];
  role?: CodeableConcept;
}

export interface ContractTermAction extends BackboneElement {
  doNotPerform?: FhirBoolean;
  type: CodeableConcept;
  subject?: ContractTermActionSubject[];
  intent: CodeableConcept;
  linkId?: FhirString[];
  status: CodeableConcept;
  context?: Reference<"Encounter" | "EpisodeOfCare">;
  contextLinkId?: FhirString[];
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  requester?: Reference<
    "Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Device" | "Group" | "Organization"
  >[];
  requesterLinkId?: FhirString[];
  performerType?: CodeableConcept[];
  performerRole?: CodeableConcept;
  performer?: Reference<
    | "RelatedPerson"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "CareTeam"
    | "Device"
    | "Substance"
    | "Organization"
    | "Location"
  >;
  performerLinkId?: FhirString[];
  reason?: CodeableReference[];
  reasonLinkId?: FhirString[];
  note?: Annotation[];
  securityLabelNumber?: FhirUnsignedInt[];
}

export interface ContractTerm extends BackboneElement {
  identifier?: Identifier;
  issued?: FhirDateTime;
  applies?: Period;
  topicCodeableConcept?: CodeableConcept;
  topicReference?: Reference<"Resource">;
  type?: CodeableConcept;
  subType?: CodeableConcept;
  text?: FhirString;
  securityLabel?: ContractTermSecurityLabel[];
  offer: ContractTermOffer;
  asset?: ContractTermAsset[];
  action?: ContractTermAction[];
  group?: ContractTerm[];
}

export interface ContractSigner extends BackboneElement {
  type: Coding;
  party: Reference<"Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  signature: Signature[];
}

export interface ContractFriendly extends BackboneElement {
  contentAttachment?: Attachment;
  contentReference?: Reference<"Composition" | "DocumentReference" | "QuestionnaireResponse">;
}

export interface ContractLegal extends BackboneElement {
  contentAttachment?: Attachment;
  contentReference?: Reference<"Composition" | "DocumentReference" | "QuestionnaireResponse">;
}

export interface ContractRule extends BackboneElement {
  contentAttachment?: Attachment;
  contentReference?: Reference<"DocumentReference">;
}

export interface Contract extends DomainResource {
  resourceType: "Contract";
  identifier?: Identifier[];
  url?: FhirUri;
  version?: FhirString;
  status?: FhirCode;
  legalState?: CodeableConcept;
  instantiatesCanonical?: Reference<"Contract">;
  instantiatesUri?: FhirUri;
  contentDerivative?: CodeableConcept;
  issued?: FhirDateTime;
  applies?: Period;
  expirationType?: CodeableConcept;
  subject?: Reference<"Resource">[];
  authority?: Reference<"Organization">[];
  domain?: Reference<"Location">[];
  site?: Reference<"Location">[];
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  alias?: FhirString[];
  author?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "Organization">;
  scope?: CodeableConcept;
  topicCodeableConcept?: CodeableConcept;
  topicReference?: Reference<"Resource">;
  type?: CodeableConcept;
  subType?: CodeableConcept[];
  contentDefinition?: ContractContentDefinition;
  term?: ContractTerm[];
  supportingInfo?: Reference<"Resource">[];
  relevantHistory?: Reference<"Provenance">[];
  signer?: ContractSigner[];
  friendly?: ContractFriendly[];
  legal?: ContractLegal[];
  rule?: ContractRule[];
  legallyBindingAttachment?: Attachment;
  legallyBindingReference?: Reference<"Composition" | "DocumentReference" | "QuestionnaireResponse" | "Contract">;
}

import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirUri } from "../primitives.js";

export interface ConsentPolicy extends BackboneElement {
  authority?: FhirUri;
  uri?: FhirUri;
}

export interface ConsentVerification extends BackboneElement {
  verified: FhirBoolean;
  verifiedWith?: Reference<"Patient" | "RelatedPerson">;
  verificationDate?: FhirDateTime;
}

export interface ConsentProvisionActor extends BackboneElement {
  role: CodeableConcept;
  reference: Reference<
    "Device" | "Group" | "CareTeam" | "Organization" | "Patient" | "Practitioner" | "RelatedPerson" | "PractitionerRole"
  >;
}

export interface ConsentProvisionData extends BackboneElement {
  meaning: FhirCode;
  reference: Reference<"Resource">;
}

export interface ConsentProvision extends BackboneElement {
  type?: FhirCode;
  period?: Period;
  actor?: ConsentProvisionActor[];
  action?: CodeableConcept[];
  securityLabel?: Coding[];
  purpose?: Coding[];
  class?: Coding[];
  code?: CodeableConcept[];
  dataPeriod?: Period;
  data?: ConsentProvisionData[];
  provision?: ConsentProvision[];
}

export interface Consent extends DomainResource {
  resourceType: "Consent";
  identifier?: Identifier[];
  status: FhirCode;
  scope: CodeableConcept;
  category: CodeableConcept[];
  patient?: Reference<"Patient">;
  dateTime?: FhirDateTime;
  performer?: Reference<"Organization" | "Patient" | "Practitioner" | "RelatedPerson" | "PractitionerRole">[];
  organization?: Reference<"Organization">[];
  sourceAttachment?: Attachment;
  sourceReference?: Reference<"Consent" | "DocumentReference" | "Contract" | "QuestionnaireResponse">;
  policy?: ConsentPolicy[];
  policyRule?: CodeableConcept;
  verification?: ConsentVerification[];
  provision?: ConsentProvision;
}

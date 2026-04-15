import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Expression,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime, FhirUrl } from "../primitives.js";

export interface ConsentPolicyBasis extends BackboneElement {
  reference?: Reference<"Resource">;
  url?: FhirUrl;
}

export interface ConsentVerification extends BackboneElement {
  verified: FhirBoolean;
  verificationType?: CodeableConcept;
  verifiedBy?: Reference<"Organization" | "Practitioner" | "PractitionerRole">;
  verifiedWith?: Reference<"Patient" | "RelatedPerson">;
  verificationDate?: FhirDateTime[];
}

export interface ConsentProvisionActor extends BackboneElement {
  role?: CodeableConcept;
  reference?: Reference<
    "Device" | "Group" | "CareTeam" | "Organization" | "Patient" | "Practitioner" | "RelatedPerson" | "PractitionerRole"
  >;
}

export interface ConsentProvisionData extends BackboneElement {
  meaning: FhirCode;
  reference: Reference<"Resource">;
}

export interface ConsentProvision extends BackboneElement {
  period?: Period;
  actor?: ConsentProvisionActor[];
  action?: CodeableConcept[];
  securityLabel?: Coding[];
  purpose?: Coding[];
  documentType?: Coding[];
  resourceType?: Coding[];
  code?: CodeableConcept[];
  dataPeriod?: Period;
  data?: ConsentProvisionData[];
  expression?: Expression;
  provision?: ConsentProvision[];
}

export interface Consent extends DomainResource {
  resourceType: "Consent";
  identifier?: Identifier[];
  status: FhirCode;
  category?: CodeableConcept[];
  subject?: Reference<"Patient" | "Practitioner" | "Group">;
  date?: FhirDate;
  period?: Period;
  grantor?: Reference<
    | "CareTeam"
    | "HealthcareService"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "RelatedPerson"
    | "PractitionerRole"
  >[];
  grantee?: Reference<
    | "CareTeam"
    | "HealthcareService"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "RelatedPerson"
    | "PractitionerRole"
  >[];
  manager?: Reference<"HealthcareService" | "Organization" | "Patient" | "Practitioner">[];
  controller?: Reference<"HealthcareService" | "Organization" | "Patient" | "Practitioner">[];
  sourceAttachment?: Attachment[];
  sourceReference?: Reference<"Consent" | "DocumentReference" | "Contract" | "QuestionnaireResponse">[];
  regulatoryBasis?: CodeableConcept[];
  policyBasis?: ConsentPolicyBasis;
  policyText?: Reference<"DocumentReference">[];
  verification?: ConsentVerification[];
  decision?: FhirCode;
  provision?: ConsentProvision[];
}

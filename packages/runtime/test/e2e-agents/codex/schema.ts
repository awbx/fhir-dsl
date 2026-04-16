import type {
  CodeableConcept,
  CompositeParam,
  DateParam,
  DomainResource,
  FhirCode,
  HumanName,
  NumberParam,
  Quantity,
  QuantityParam,
  Reference,
  ReferenceParam,
  Resource,
  StringParam,
  TokenParam,
  UriParam,
} from "@fhir-dsl/types";

export type AdministrativeGender = "male" | "female" | "other" | "unknown";
export type ObservationStatus = "registered" | "preliminary" | "final";
export type ObservationCode = "1234-5" | "6789-0";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  name?: HumanName[];
  birthDate?: string;
  gender?: FhirCode<AdministrativeGender>;
  managingOrganization?: Reference<"Organization">;
  generalPractitioner?: Reference<"Practitioner">[];
}

export interface VipPatient extends Patient {
  meta?: Patient["meta"] & { profile: ["http://example.test/fhir/StructureDefinition/vip-patient"] };
  vipTag: true;
}

export interface Observation extends DomainResource {
  resourceType: "Observation";
  status: FhirCode<ObservationStatus>;
  code?: CodeableConcept<ObservationCode>;
  subject?: Reference<"Patient">;
  performer?: Reference<"Practitioner">[];
  valueQuantity?: Quantity;
}

export interface Practitioner extends DomainResource {
  resourceType: "Practitioner";
  name?: HumanName[];
}

export interface Organization extends DomainResource {
  resourceType: "Organization";
  name?: string;
}

export type ComboCodeValueParam = CompositeParam<{
  code: TokenParam<ObservationCode>;
  "value-quantity": QuantityParam;
}>;

export interface PatientSearchParams {
  name: StringParam;
  birthdate: DateParam;
  gender: TokenParam<AdministrativeGender>;
  identifier: TokenParam<`sys|${string}`>;
  organization: ReferenceParam;
  website: UriParam;
  "risk-score": NumberParam;
  weight: QuantityParam;
}

export interface ObservationSearchParams {
  code: TokenParam<ObservationCode>;
  status: TokenParam<ObservationStatus>;
  date: DateParam;
  subject: ReferenceParam;
  performer: ReferenceParam;
  combo: ComboCodeValueParam;
}

export interface PractitionerSearchParams {
  name: StringParam;
}

export interface OrganizationSearchParams {
  name: StringParam;
}

export interface TestSchema {
  resources: {
    Patient: Patient;
    Observation: Observation;
    Practitioner: Practitioner;
    Organization: Organization;
  };
  searchParams: {
    Patient: PatientSearchParams;
    Observation: ObservationSearchParams;
    Practitioner: PractitionerSearchParams;
    Organization: OrganizationSearchParams;
  };
  includes: {
    Patient: {
      organization: "Organization";
      "general-practitioner": "Practitioner";
    };
    Observation: {
      subject: "Patient";
      performer: "Practitioner";
    };
  };
  revIncludes: {
    Patient: {
      Observation: "subject";
    };
  };
  profiles: {
    Patient: {
      vip: VipPatient;
    };
  };
}

export type TestResource = TestSchema["resources"][keyof TestSchema["resources"]] & Resource;

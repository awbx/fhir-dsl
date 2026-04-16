import type { FhirSchema } from "@fhir-dsl/core";
import type {
  CompositeParam,
  DateParam,
  HumanName,
  Identifier,
  NumberParam,
  QuantityParam,
  Reference,
  ReferenceParam,
  StringParam,
  TokenParam,
  UriParam,
} from "@fhir-dsl/types";

export interface TestPatient {
  resourceType: "Patient";
  id?: string;
  active?: boolean;
  name?: HumanName[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  identifier?: Identifier[];
  managingOrganization?: Reference;
  generalPractitioner?: Reference[];
}

export interface TestVipPatient extends TestPatient {
  meta?: { profile?: string[]; tag?: { system?: string; code?: string }[] };
  extension?: { url: string; valueString?: string }[];
}

export interface TestObservation {
  resourceType: "Observation";
  id?: string;
  status:
    | "registered"
    | "preliminary"
    | "final"
    | "amended"
    | "corrected"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  code: { coding?: { system?: string; code?: string; display?: string }[]; text?: string };
  subject?: Reference;
  performer?: Reference[];
  valueQuantity?: { value?: number; unit?: string; system?: string; code?: string };
  effectiveDateTime?: string;
}

export interface TestOrganization {
  resourceType: "Organization";
  id?: string;
  name?: string;
  type?: { coding?: { system?: string; code?: string }[] }[];
}

export interface TestPractitioner {
  resourceType: "Practitioner";
  id?: string;
  name?: HumanName[];
  qualification?: { code: { coding?: { system?: string; code?: string }[] } }[];
}

export interface TestCondition {
  resourceType: "Condition";
  id?: string;
  subject?: Reference;
  code?: { coding?: { system?: string; code?: string }[] };
}

export type TestResource = TestPatient | TestObservation | TestOrganization | TestPractitioner | TestCondition;

type PatientSearchParams = {
  name: StringParam;
  family: StringParam;
  given: StringParam;
  birthdate: DateParam;
  gender: TokenParam<"male" | "female" | "other" | "unknown">;
  active: TokenParam<"true" | "false">;
  identifier: TokenParam;
  organization: ReferenceParam;
  "general-practitioner": ReferenceParam;
  website: UriParam;
  "risk-score": NumberParam;
  weight: QuantityParam;
  dna: CompositeParam<{
    gene: TokenParam;
    allele: TokenParam;
  }>;
  _id: TokenParam;
};

type ObservationSearchParams = {
  status: TokenParam<
    "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown"
  >;
  code: TokenParam;
  subject: ReferenceParam;
  performer: ReferenceParam;
  "value-quantity": QuantityParam;
  date: DateParam;
  combo: CompositeParam<{
    code: TokenParam;
    "value-quantity": QuantityParam;
  }>;
};

type OrganizationSearchParams = {
  name: StringParam;
  type: TokenParam;
};

type PractitionerSearchParams = {
  name: StringParam;
  qualification: TokenParam;
};

type ConditionSearchParams = {
  subject: ReferenceParam;
  code: TokenParam;
};

export interface TestSchema extends FhirSchema {
  resources: {
    Patient: TestPatient;
    Observation: TestObservation;
    Organization: TestOrganization;
    Practitioner: TestPractitioner;
    Condition: TestCondition;
  };
  searchParams: {
    Patient: PatientSearchParams;
    Observation: ObservationSearchParams;
    Organization: OrganizationSearchParams;
    Practitioner: PractitionerSearchParams;
    Condition: ConditionSearchParams;
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
    Condition: {
      subject: "Patient";
    };
  };
  revIncludes: {
    Patient: {
      Observation: "subject";
      Condition: "subject";
    };
    Organization: {
      Patient: "organization";
    };
    Practitioner: {
      Patient: "general-practitioner";
    };
  };
  profiles: {
    Patient: {
      vip: TestVipPatient;
    };
  };
}

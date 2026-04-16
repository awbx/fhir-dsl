import type { Bundle, BundleEntry } from "@fhir-dsl/types";
import type {
  TestCondition,
  TestObservation,
  TestOrganization,
  TestPatient,
  TestPractitioner,
  TestResource,
  TestVipPatient,
} from "./schema.js";

export const patientAlice: TestPatient = {
  resourceType: "Patient",
  id: "pat-alice",
  active: true,
  name: [{ family: "Smith", given: ["Alice"] }],
  gender: "female",
  birthDate: "1990-04-12",
  managingOrganization: { reference: "Organization/org-acme" },
};

export const patientBob: TestPatient = {
  resourceType: "Patient",
  id: "pat-bob",
  active: true,
  name: [{ family: "Smith", given: ["Bob"] }],
  gender: "male",
  birthDate: "1984-09-30",
};

export const vipPatient: TestVipPatient = {
  resourceType: "Patient",
  id: "pat-vip",
  active: true,
  name: [{ family: "Valor", given: ["Vera"] }],
  gender: "female",
  birthDate: "1970-01-01",
  meta: { profile: ["https://example.test/StructureDefinition/vip-patient"], tag: [{ code: "vip" }] },
  extension: [{ url: "https://example.test/vip-tier", valueString: "platinum" }],
};

export const observationBodyWeight: TestObservation = {
  resourceType: "Observation",
  id: "obs-weight",
  status: "final",
  code: { coding: [{ system: "http://loinc.org", code: "29463-7", display: "Body Weight" }] },
  subject: { reference: "Patient/pat-alice" },
  performer: [{ reference: "Practitioner/prc-1" }],
  valueQuantity: { value: 72, unit: "kg", system: "http://unitsofmeasure.org", code: "kg" },
  effectiveDateTime: "2024-02-10T10:00:00Z",
};

export const organizationAcme: TestOrganization = {
  resourceType: "Organization",
  id: "org-acme",
  name: "Acme Clinic",
  type: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/organization-type", code: "prov" }] }],
};

export const practitioner1: TestPractitioner = {
  resourceType: "Practitioner",
  id: "prc-1",
  name: [{ family: "Doe", given: ["Jane"] }],
};

export const conditionHypertension: TestCondition = {
  resourceType: "Condition",
  id: "cnd-hyp",
  subject: { reference: "Patient/pat-alice" },
  code: { coding: [{ system: "http://snomed.info/sct", code: "38341003" }] },
};

export type SearchMode = "match" | "include" | "outcome";

export function bundleOf(...entries: { resource: TestResource; mode?: SearchMode }[]): Bundle {
  const bundleEntries: BundleEntry[] = entries.map((e) => ({
    resource: e.resource,
    search: { mode: e.mode ?? "match" },
  }));
  return {
    resourceType: "Bundle",
    type: "searchset",
    entry: bundleEntries,
  };
}

export function pagedBundle(nextUrl: string, ...entries: { resource: TestResource; mode?: SearchMode }[]): Bundle {
  const bundle = bundleOf(...entries);
  bundle.link = [{ relation: "next", url: nextUrl }];
  return bundle;
}

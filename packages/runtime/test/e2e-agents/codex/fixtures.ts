import type { Bundle, BundleEntry } from "@fhir-dsl/types";
import type { Observation, Organization, Patient, Practitioner, VipPatient } from "./schema.js";

export const patient1: Patient = {
  resourceType: "Patient",
  id: "pat-1",
  gender: "male",
  name: [{ family: "Smith", given: ["John"] }],
  managingOrganization: { reference: "Organization/org-1" },
  generalPractitioner: [{ reference: "Practitioner/prac-1" }],
};

export const vipPatient: VipPatient = {
  ...patient1,
  id: "vip-1",
  vipTag: true,
  meta: {
    profile: ["http://example.test/fhir/StructureDefinition/vip-patient"] as [
      "http://example.test/fhir/StructureDefinition/vip-patient",
    ],
  },
};

export const observation1: Observation = {
  resourceType: "Observation",
  id: "obs-1",
  status: "final",
  code: { coding: [{ code: "1234-5" }] },
  subject: { reference: "Patient/pat-1" },
  performer: [{ reference: "Practitioner/prac-1" }],
  valueQuantity: { value: 72, unit: "kg" },
};

export const practitioner1: Practitioner = {
  resourceType: "Practitioner",
  id: "prac-1",
  name: [{ family: "Care", given: ["Pat"] }],
};

export const organization1: Organization = {
  resourceType: "Organization",
  id: "org-1",
  name: "Test Health",
};

export function bundleOf(...entries: BundleEntry[]): Bundle {
  const bundle: Bundle = {
    resourceType: "Bundle",
    type: "searchset",
    entry: entries,
  };
  return bundle;
}

import type { Patient, Observation } from "#/fhir/r4";

export const samplePatient: Patient = {
	resourceType: "Patient",
	id: "smith-1",
	active: true,
	name: [
		{ use: "official", family: "Smith", given: ["Jane", "Q."] },
		{ use: "nickname", given: ["Janie"] },
	],
	gender: "female",
	birthDate: "1985-04-12",
	telecom: [
		{ system: "email", value: "jane.smith@example.com", use: "home" },
		{ system: "phone", value: "+1-555-0100", use: "mobile" },
	],
	address: [
		{ use: "home", city: "Boston", state: "MA", postalCode: "02101", country: "US" },
	],
};

export const sampleBpObservation: Observation = {
	resourceType: "Observation",
	id: "bp-1",
	status: "final",
	code: {
		coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel" }],
	},
	subject: { reference: "Patient/smith-1" },
	effectiveDateTime: "2026-04-30T08:30:00Z",
	component: [
		{
			code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic" }] },
			valueQuantity: { value: 132, unit: "mm[Hg]", system: "http://unitsofmeasure.org", code: "mm[Hg]" },
		},
		{
			code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic" }] },
			valueQuantity: { value: 84, unit: "mm[Hg]", system: "http://unitsofmeasure.org", code: "mm[Hg]" },
		},
	],
};

export const sampleMassObservation: Observation = {
	resourceType: "Observation",
	id: "mass-1",
	status: "final",
	code: { coding: [{ system: "http://loinc.org", code: "29463-7", display: "Body weight" }] },
	subject: { reference: "Patient/smith-1" },
	effectiveDateTime: "2026-04-30T08:30:00Z",
	valueQuantity: { value: 5, unit: "mg", system: "http://unitsofmeasure.org", code: "mg" },
};

export const sampleUsCorePatient: Patient = {
	resourceType: "Patient",
	id: "uscore-1",
	meta: {
		profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
	},
	identifier: [{ system: "http://hospital.org/mrn", value: "12345" }],
	name: [{ use: "official", family: "Doe", given: ["John"] }],
	gender: "male",
	birthDate: "1972-09-08",
};

export const SAMPLES = {
	"R4 Patient (Smith)": samplePatient,
	"R4 Observation (BP, mm[Hg])": sampleBpObservation,
	"R4 Observation (5 mg → UCUM)": sampleMassObservation,
	"US Core Patient": sampleUsCorePatient,
} as const;

export type SampleName = keyof typeof SAMPLES;

export const SNIPPETS: Record<string, string> = {
	"Compile path": `// Type-safe path navigation. Compiles to a FHIRPath string.
const expr = fhirpath("Patient")
  .name.where($ => $.use.eq("official"))
  .given;

return { compile: expr.compile(), evaluate: expr.evaluate(resource) };`,
	"UCUM Quantity equality": `// 5 'mg' equals 0.005 'g' through the native UCUM core.
const expr = fhirpath("Observation")
  .valueQuantity
  .where($ => $.eq({ value: 0.005, unit: "g" }))
  .exists();

return { compile: expr.compile(), evaluate: expr.evaluate(resource) };`,
	"UCUM offset units throw": `// Celsius is an offset unit — UCUM throws instead of guessing.
const expr = fhirpath("Observation")
  .valueQuantity
  .where($ => $.eq({ value: 37, unit: "Cel" }))
  .exists();

try {
  return { compile: expr.compile(), evaluate: expr.evaluate(resource) };
} catch (err) {
  return { error: { kind: err.kind, message: err.message } };
}`,
	"Invert path: setValue": `// Build a NEW resource with the path updated. Original is untouched.
const path = fhirpath("Patient")
  .name.where($ => $.use.eq("official"))
  .given;

const next = path.setValue(resource, ["Maximilian"]);
const patch = path.createPatch(resource, ["Maximilian"]);
return { next, patch };`,
	"Profile conformance": `// Terminology resolver hooks dispatch through EvalOptions.terminology.
const expr = fhirpath("Patient")
  .conformsTo("http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient");

return {
  compile: expr.compile(),
  evaluate: expr.evaluate(resource, {
    terminology: {
      conformsTo: (r, profile) =>
        Array.isArray(r.meta?.profile) && r.meta.profile.includes(profile),
    },
  }),
};`,
};

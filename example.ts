import { createFhirClient } from "@fhir-dsl/core";

// Create a type-safe FHIR client
const fhir = createFhirClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: {
    type: "bearer",
    credentials: "my-token",
  },
});

// --- Search with type-safe parameters ---

async function searchPatients() {
  const result = await fhir
    .search("Patient")
    .where("name", "eq", "John")
    .where("birthdate", "ge", "1990-01-01")
    .where("gender", "eq", "male")
    .sort("birthdate", "desc")
    .count(10)
    .include("general-practitioner")
    .include("organization")
    .execute();

  // result.data is Patient[] (typed!)
  for (const patient of result.data) {
    console.log(patient.resourceType); // "Patient"
    console.log(patient.name?.[0]?.family);
    console.log(patient.birthDate);
    console.log(patient.gender);
  }

  // result.included - in a full build with all resources generated,
  // this would be typed as (Organization | Practitioner | PractitionerRole)[]
  // For MVP with only 3 resources, unresolved includes appear as never[]
  console.log("Included count:", result.included.length);
  console.log("Total:", result.total);
}

// --- Search Observations ---

async function searchObservations() {
  const result = await fhir
    .search("Observation")
    .where("code", "eq", "8867-4")
    .where("date", "ge", "2024-01-01")
    .where("status", "eq", "final")
    .include("subject")
    .include("encounter")
    .execute();

  for (const obs of result.data) {
    console.log(obs.resourceType); // "Observation"
    console.log(obs.code.coding?.[0]?.code);
    console.log(obs.valueQuantity?.value);
    console.log(obs.status);
  }
}

// --- Read a single resource by ID ---

async function readPatient() {
  const patient = await fhir.read("Patient", "123").execute();

  console.log(patient.name?.[0]?.given);
  console.log(patient.birthDate);
}

// --- Compile a query without executing (useful for debugging) ---

function compileQuery() {
  const query = fhir
    .search("Encounter")
    .where("date", "ge", "2024-01-01")
    .where("status", "eq", "finished")
    .where("type", "eq", "consultation")
    .include("patient")
    .sort("date", "desc")
    .count(20)
    .compile();

  console.log("Method:", query.method);
  console.log("Path:", query.path);
  console.log("Params:", query.params);
}

// --- Profile-constrained queries ---

async function searchUSCorePatients() {
  // Using a profile narrows the return type to USCorePatient
  const result = await fhir
    .search("Patient", "us-core")
    .where("name", "eq", "Smith")
    .where("gender", "eq", "female")
    .execute();

  for (const patient of result.data) {
    // USCorePatient guarantees these are present (non-optional):
    console.log(patient.identifier[0].system); // required in US Core
    console.log(patient.identifier[0].value); // required in US Core
    console.log(patient.name[0].family); // required in US Core
    console.log(patient.gender); // required in US Core
  }
}

async function searchVitalSigns() {
  const result = await fhir
    .search("Observation", "us-core-vital-signs")
    .where("category", "eq", "vital-signs")
    .where("patient", "eq", "Patient/123")
    .execute();

  for (const obs of result.data) {
    // USCoreVitalSignsObservation guarantees category, code, subject
    console.log(obs.category[0].coding[0].code); // "vital-signs"
    console.log(obs.subject.reference); // required in US Core
    console.log(obs.valueQuantity?.value);
  }
}

// --- Transaction builder ---

async function transactionExample() {
  const result = await fhir
    .transaction()
    .create({
      resourceType: "Patient",
      name: [{ family: "Doe", given: ["Jane"] }],
      gender: "female",
      birthDate: "1990-05-15",
    })
    .update({
      resourceType: "Observation",
      id: "obs-123",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "8867-4" }] },
    })
    .delete("Appointment", "appt-456")
    .execute();

  console.log("Transaction result:", result.type); // "transaction-response"
  console.log("Entries:", result.entry?.length);
}

// @ts-expect-error - 'invalid-profile' is not a valid profile for Patient
fhir.search("Patient", "invalid-profile");

// -------------------------------------------------------
// TYPE SAFETY EXAMPLES - The following would cause TS errors:
// -------------------------------------------------------

// @ts-expect-error - 'invalid-resource' is not a valid resource type
fhir.search("InvalidResource");

// @ts-expect-error - 'invalid-param' is not a valid search parameter for Patient
fhir.search("Patient").where("invalid-param", "eq", "value");

// @ts-expect-error - 'gt' is not a valid prefix for string params
fhir.search("Patient").where("name", "gt", "John");

// @ts-expect-error - 'invalid-include' is not a valid include for Patient
fhir.search("Patient").include("invalid-include");

// Run examples
searchPatients();
searchObservations();
readPatient();
compileQuery();
searchUSCorePatients();
searchVitalSigns();
transactionExample();

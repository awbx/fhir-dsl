// ============================================================
// fhir-dsl example — like Kysely, types are generated, not shipped.
//
// Step 1: Generate types
//   fhir-dsl generate --version r4 --out ./src/fhir --ig hl7.fhir.us.core@6.1.0
//
// Step 2: Import the pre-typed client and start querying
// ============================================================

import { createClient } from "./fhir/r4/client.js";

// Create a type-safe FHIR client — all types flow from your generated schema
const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: "my-token" },
});

// --- Search with full IntelliSense ---

async function searchPatients() {
  const result = await fhir
    .search("Patient") //  autocompletes all 146 resource types
    .where("name", "eq", "Smith") //  "name" autocompletes, "eq" is valid for string params
    .where("birthdate", "ge", "1990-01-01") //  "ge" valid for date params
    .where("gender", "eq", "male") //  token param
    .sort("birthdate", "desc")
    .count(10)
    .include("general-practitioner") //  autocompletes valid includes
    .include("organization")
    .execute();

  // result.data is Patient[] — fully typed
  for (const patient of result.data) {
    console.log(patient.resourceType); // "Patient"
    console.log(patient.name?.[0]?.family);
    console.log(patient.birthDate);
    console.log(patient.gender);
  }

  console.log("Total:", result.total);
}

// --- Profile-constrained queries (US Core) ---

async function searchUSCorePatients() {
  // Second arg selects a profile — autocompletes from ProfileRegistry
  const result = await fhir
    .search("Patient", "us-core-patient")
    .where("name", "eq", "Smith")
    .execute();

  for (const patient of result.data) {
    // Type is USCorePatientProfile — gender is narrowed to FhirCode (required)
    console.log(patient.gender);
    console.log(patient.name?.[0]?.family);
  }
}

// --- Search Observations with US Core Lab profile ---

async function searchLabResults() {
  const result = await fhir
    .search("Observation", "us-core-observation-lab")
    .where("code", "eq", "4548-4") // HbA1c
    .where("date", "ge", "2024-01-01")
    .where("status", "eq", "final")
    .include("subject")
    .execute();

  for (const obs of result.data) {
    console.log(obs.code.coding?.[0]?.display);
    console.log(obs.valueQuantity?.value, obs.valueQuantity?.unit);
    console.log(obs.status);
  }
}

// --- Read a single resource ---

async function readPatient() {
  const patient = await fhir.read("Patient", "123").execute();
  console.log(patient.name?.[0]?.given);
  console.log(patient.birthDate);
}

// --- Compile without executing (debugging) ---

function inspectQuery() {
  const query = fhir
    .search("Encounter")
    .where("date", "ge", "2024-01-01")
    .where("status", "eq", "finished")
    .include("patient")
    .sort("date", "desc")
    .count(20)
    .compile();

  console.log("Method:", query.method); // "GET"
  console.log("Path:", query.path); // "Encounter"
  console.log("Params:", query.params);
}

// --- Transactions ---

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

  console.log("Transaction result:", result.type);
  console.log("Entries:", result.entry?.length);
}

// --- Type Safety — these would cause TS compile errors: ---

// @ts-expect-error — 'Foo' is not a valid resource type
fhir.search("Foo");

// @ts-expect-error — 'nope' is not a valid search param for Patient
fhir.search("Patient").where("nope", "eq", "x");

// @ts-expect-error — 'gt' is not a valid prefix for string params
fhir.search("Patient").where("name", "gt", "John");

// @ts-expect-error — 'bad-include' is not a valid include for Patient
fhir.search("Patient").include("bad-include");

// @ts-expect-error — 'nonexistent-profile' is not a valid profile for Patient
fhir.search("Patient", "nonexistent-profile");

// Run
searchPatients();
searchUSCorePatients();
searchLabResults();
readPatient();
inspectQuery();
transactionExample();

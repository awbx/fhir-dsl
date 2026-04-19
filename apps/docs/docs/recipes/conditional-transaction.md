---
sidebar_position: 9
title: "Conditional Transaction"
description: "Atomic transaction with conditional create, conditional update, and conditional delete; walk the typed response bundle to discover assigned ids."
---

# Conditional Transaction

## Problem

A nightly reconciliation job needs to: (a) create a Patient only if no
existing record shares the MRN, (b) update a ScheduledAppointment only
if it already exists, (c) delete any Appointments whose status is
`entered-in-error`. All-or-nothing: if any operation fails, none should
commit. `transaction()` gives you that atomicity, and the conditional
helpers (`ifNoneExist`, `ifMatch`) wire the If-* headers the server
needs to resolve "does this exist?" server-side.

## Prerequisites

- Generated client at `./fhir/r4`
- Packages: `@fhir-dsl/core`
- Server: supports the `transaction` Bundle type (HAPI does; some
  read-only servers don't). Some servers implement `batch` but not
  `transaction` — those lack atomicity.

## Steps

### 1. Open a transaction

`fhir.transaction()` returns a `TransactionBuilder<S>` which chains
`create`, `update`, `delete`, `patch`, `$if`, `$call` just like the
search builder. It's immutable: each chain call returns a new builder.

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({ baseUrl: "https://hapi.fhir.org/baseR4" });

const tx = fhir.transaction();
```

### 2. Conditional create with `ifNoneExist`

`ifNoneExist` accepts either a raw query string (`"identifier=..."`) or
a condition array. The server runs that search first and only creates
the resource if nothing matched.

```ts
const withPatient = tx.$call((t) =>
  t
    .create({
      resourceType: "Patient",
      identifier: [{ system: "http://hospital.example/mrn", value: "MRN-42" }],
      name: [{ family: "Doe", given: ["Jane"] }],
      gender: "female",
      birthDate: "1990-05-15",
    })
    // Either form works; the array form is fully typed.
    .ifNoneExist([["identifier", "eq", "http://hospital.example/mrn|MRN-42"]]),
);
```

### 3. Conditional update with `ifMatch`

`update` writes if the resource exists; `ifMatch("W/\"3\"")` makes it
optimistic — the write fails with `412 Precondition Failed` if the
ETag has moved.

```ts
const withUpdate = withPatient.$call((t) =>
  t
    .update({
      resourceType: "Appointment",
      id: "appt-123",
      status: "booked",
      participant: [
        { actor: { reference: "Patient/example" }, status: "accepted" },
      ],
    })
    .ifMatch('W/"3"'),
);
```

### 4. Conditional delete

`delete` by type + id is the basic form. For a conditional delete ("any
resource matching this query"), call the runtime executor directly —
the typed builder only exposes id-targeted delete.

```ts
const withDelete = withUpdate.delete("Appointment", "appt-456");
```

### 5. Add a conditional step with `$if`

`$if(cond, fn)` skips the callback when `cond === false`. Combined with
`$call`, this is the Kysely-style fragment composer that keeps each
branch a first-class builder.

```ts
const onlyInReconciliation = process.env.JOB === "nightly-reconcile";

const final = withDelete.$if(onlyInReconciliation, (t) =>
  t
    .create({
      resourceType: "AuditEvent",
      type: { code: "rest", system: "http://terminology.hl7.org/CodeSystem/audit-event-type" },
      action: "E",
      recorded: new Date().toISOString(),
      source: { observer: { reference: "Device/reconciliation-bot" } },
    }),
);
```

### 6. Execute and walk the typed response

A transaction response is a `Bundle` of type `transaction-response`.
Each entry's `response.status` carries the HTTP-like status
(`"201 Created"`, `"200 OK"`, `"412 Precondition Failed"`), and
`response.location` carries the canonical URL of the created/updated
resource — this is how you discover the server-assigned id after a
`create`.

```ts
const result = await final.execute();

for (const [i, entry] of (result.entry ?? []).entries()) {
  console.log(`#${i}`, entry.response?.status, entry.response?.location);
  if (entry.resource?.resourceType === "Patient" && entry.resource.id) {
    // Persist the new id for downstream jobs
    savedPatientId = entry.resource.id;
  }
}
```

### 7. Handle partial failure (there is none — it's all-or-nothing)

Transactions are atomic: if any entry returns 4xx/5xx, the server
rolls back the entire bundle. `execute()` throws `FhirRequestError`
with the server's OperationOutcome attached. For independent ops where
partial failure is OK, use `batch()` — same API, same shape, no
rollback.

```ts
import { FhirRequestError } from "@fhir-dsl/core";

try {
  const result = await final.execute();
} catch (e) {
  if (e instanceof FhirRequestError && e.status === 409) {
    console.error("Conflict — MRN already exists, ifNoneExist returned multiple matches");
  }
  throw e;
}
```

## Final snippet

```ts
import { createClient, FhirRequestError } from "@fhir-dsl/core";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
});

type ReconcileInput = {
  mrn: string;
  patient: Omit<{ resourceType: "Patient" } & Record<string, unknown>, "id">;
  appointmentId: string;
  appointmentEtag: string;
  appointmentDraft: { resourceType: "Appointment"; id: string; status: string };
  staleAppointmentId: string;
};

export async function reconcile(input: ReconcileInput) {
  try {
    const result = await fhir
      .transaction()
      .$call((tx) =>
        tx
          .create({
            ...input.patient,
            identifier: [
              {
                system: "http://hospital.example/mrn",
                value: input.mrn,
              },
            ],
          })
          .ifNoneExist([["identifier", "eq", `http://hospital.example/mrn|${input.mrn}`]]),
      )
      .$call((tx) =>
        tx.update(input.appointmentDraft).ifMatch(input.appointmentEtag),
      )
      .delete("Appointment", input.staleAppointmentId)
      .$if(process.env.JOB === "nightly-reconcile", (tx) =>
        tx.create({
          resourceType: "AuditEvent",
          type: {
            code: "rest",
            system: "http://terminology.hl7.org/CodeSystem/audit-event-type",
          },
          action: "E",
          recorded: new Date().toISOString(),
          source: {
            observer: { reference: "Device/reconciliation-bot" },
          },
        }),
      )
      .execute();

    const summary = { patientId: undefined as string | undefined, appointmentStatus: "" };
    for (const entry of result.entry ?? []) {
      if (entry.resource?.resourceType === "Patient" && entry.resource.id) {
        summary.patientId = entry.resource.id;
      }
      if (entry.response?.status?.startsWith("412")) {
        throw new Error("Appointment ETag moved — caller should retry");
      }
    }
    return summary;
  } catch (e) {
    if (e instanceof FhirRequestError) {
      console.error("Transaction rejected", e.status, e.body);
    }
    throw e;
  }
}
```

## Troubleshooting

- **`412 Precondition Failed` on the `ifMatch` entry** → the resource
  moved between your read and the transaction. Fetch fresh ETag and
  retry.
- **`ifNoneExist` matches multiple resources** → server returns 412; the
  condition is ambiguous. Tighten the query until it matches exactly
  zero or one.
- **Create always writes (never skips)** → your `ifNoneExist` query is
  wrong. Compile the transaction with `.compile()` and inspect the
  Bundle's `entry[].request.ifNoneExist` string.
- **Server returns 400 "batch vs transaction"** → some servers implement
  `batch` but not `transaction`. Switch to `fhir.batch()` if atomicity
  isn't required; switch servers if it is.
- **URN references don't resolve** → the transaction builder assigns
  `urn:uuid:...` fullUrls automatically so inter-entry references
  resolve server-side. If you hand-write references before the builder
  assigns ids, use `{ reference: "urn:uuid:<your-uuid>" }` and set the
  same uuid as the entry's `fullUrl`.

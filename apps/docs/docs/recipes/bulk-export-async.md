---
sidebar_position: 2
title: "Bulk Export (Async)"
description: "Trigger the FHIR $export operation with Prefer: respond-async, poll Content-Location until 200, and download the NDJSON payload links."
---

# Bulk Export (Async)

## Problem

You need every Observation for a population cohort and the server supports
the Bulk Data `$export` operation. Bulk export is mandatory async: the
server answers `202 Accepted` immediately, hands back a status URL via
`Content-Location`, and expects the client to poll until it returns a
manifest of NDJSON file URLs. This recipe wires the full round trip.

## Prerequisites

- Generated client at `./fhir/r4`
- Packages: `@fhir-dsl/core`, `@fhir-dsl/runtime`
- Server: supports Bulk Data Access IG (`$export` at system, Patient, or
  Group scope). Backend Services auth is typically required — see the
  Backend Services recipe (Recipe 7 covers refresh; the SMART docs cover
  JWT assertion clients).

## Steps

### 1. Configure the client with async polling

`FhirClientConfig.async` (an `AsyncPollingConfig`) controls how often and
how long the client waits on a 202 before giving up.

```ts
import { createFhirClient } from "@fhir-dsl/core";
import type { GeneratedSchema } from "./fhir/r4/client.js";

const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  auth: { type: "bearer", credentials: process.env.BACKEND_TOKEN! },
  async: { pollingInterval: 2000, maxAttempts: 300 }, // up to 10 minutes
});
```

Defaults are `pollingInterval: 2000` ms and `maxAttempts: 60` (two
minutes). Bulk exports regularly take longer — raise the cap.

### 2. Kick off `$export` with `Prefer: respond-async`

The `operation(name, options)` call is positional: the first argument is
the operation name (with leading `$`); the second is the options bag.
Use `execute({ prefer: { respondAsync: true } })` — the executor honours
`202 + Content-Location` automatically.

```ts
const kickoff = await fhir.operation("$export", {
  scope: { kind: "system" },
  // system scope exports everything the token can see; use
  // { kind: "type", resourceType: "Patient" } or
  // { kind: "instance", resourceType: "Group", id: "cohort-1" } to narrow.
  parameters: {
    _type: "Observation,Condition",
    _since: "2024-01-01T00:00:00Z",
  },
}).execute({ prefer: { respondAsync: true } });
```

### 3. Understand what came back

If the server finished within the polling budget, `kickoff` is the
**completion manifest** already — a `Parameters`-shaped JSON with an
`output` array of `{ type, url }` entries. If the client hit
`maxAttempts` first, it throws `AsyncPollingTimeoutError` carrying the
last-seen status URL so you can resume later.

```ts
import { AsyncPollingTimeoutError } from "@fhir-dsl/core";

try {
  const manifest = kickoff as {
    transactionTime: string;
    request: string;
    output: { type: string; url: string }[];
    error?: { type: string; url: string }[];
  };
  console.log(manifest.output.length, "NDJSON files ready");
} catch (e) {
  if (e instanceof AsyncPollingTimeoutError) {
    // Store e.contentLocation and resume polling in a later job
    throw e;
  }
}
```

### 4. Download each NDJSON file

The manifest URLs are not FHIR endpoints — they are signed object-storage
links. Fetch them with the runtime's `FhirExecutor` (which keeps auth
and redirect safety) OR plain `fetch` when the URLs are already signed.

```ts
import { FhirExecutor } from "@fhir-dsl/runtime";

const executor = new FhirExecutor({
  baseUrl: "https://fhir.example/r4",
  auth: { type: "bearer", credentials: process.env.BACKEND_TOKEN! },
});

async function downloadNdjson(url: string): Promise<unknown[]> {
  const res = await fetch(url, {
    headers: { Accept: "application/fhir+ndjson" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as unknown);
}
```

### 5. Clean up the export job

Per the Bulk Data IG, the server MAY expire the job manifest. Delete it
eagerly when done to release storage.

```ts
await fetch(kickoff.request, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${process.env.BACKEND_TOKEN!}` },
});
```

## Final snippet

```ts
import { createFhirClient, AsyncPollingTimeoutError } from "@fhir-dsl/core";
import type { GeneratedSchema } from "./fhir/r4/client.js";

const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  auth: { type: "bearer", credentials: process.env.BACKEND_TOKEN! },
  async: { pollingInterval: 2000, maxAttempts: 300 },
});

type BulkManifest = {
  transactionTime: string;
  request: string;
  requiresAccessToken: boolean;
  output: { type: string; url: string }[];
  error?: { type: string; url: string }[];
};

export async function bulkExport(types: string[], since?: string) {
  const parameters: Record<string, string> = { _type: types.join(",") };
  if (since) parameters._since = since;

  let manifest: BulkManifest;
  try {
    manifest = (await fhir
      .operation("$export", { scope: { kind: "system" }, parameters })
      .execute({ prefer: { respondAsync: true } })) as BulkManifest;
  } catch (e) {
    if (e instanceof AsyncPollingTimeoutError) {
      throw new Error(`Bulk export still running; status URL persists`);
    }
    throw e;
  }

  const resources = new Map<string, unknown[]>();
  for (const file of manifest.output) {
    const res = await fetch(file.url, {
      headers: {
        Accept: "application/fhir+ndjson",
        Authorization: `Bearer ${process.env.BACKEND_TOKEN!}`,
      },
    });
    if (!res.ok) throw new Error(`${file.type}: ${res.status}`);
    const body = await res.text();
    const rows = body.split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const bucket = resources.get(file.type) ?? [];
    bucket.push(...rows);
    resources.set(file.type, bucket);
  }

  // Courteous cleanup
  await fetch(manifest.request, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.BACKEND_TOKEN!}` },
  });

  return resources;
}
```

## Troubleshooting

- **`AsyncPollingTimeoutError` thrown immediately** → `maxAttempts`
  default is 60 (~2 min). Raise it. Store the status URL from the error
  and resume in a second process.
- **NDJSON 401 after token refreshed** → some servers embed the access
  token in the signed URL itself; others require it on every request.
  Check `manifest.requiresAccessToken` — if `false`, do NOT send
  `Authorization`, or the CDN will reject the request.
- **Manifest has `error` entries** → these are NDJSON files of
  OperationOutcome records, one per row that failed to export. Parse
  them the same way as `output`, but surface to the caller.
- **Empty `output` array** → export ran but matched nothing; that's
  valid. Distinguish from failure by checking `transactionTime` is set.
- **Kickoff returns 200 instantly** → the server chose synchronous mode;
  the body is the manifest. No polling happened. This is legal behaviour.

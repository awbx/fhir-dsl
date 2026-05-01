---
id: streaming
title: Streaming & Lazy Loading
description: Stream large FHIR Bundles page-by-page with async iterables, AbortSignal cancellation, and back-pressure-aware consumption.
sidebar_label: Streaming & Lazy Loading
---

# Streaming & Lazy Loading

FHIR APIs often return large Bundle resources with paginated results. Loading everything into memory at once isn't practical for large datasets. The `.stream()` method provides lazy, paginated iteration over search results.

## Quick Start

```typescript
for await (const patient of fhir.search("Patient").stream()) {
  console.log(patient.id, patient.name);
}
```

This fetches results page by page, automatically following Bundle pagination links, without loading the entire dataset into memory.

## Eager vs Lazy Execution

Every search query supports two execution modes:

### Eager (existing)

`.execute()` fetches a single page and returns all results at once:

```typescript
const result = await fhir
  .search("Observation")
  .where("status", "eq", "final")
  .execute();

// result.data contains the full first page
console.log(result.data.length);
```

### Lazy (new)

`.stream()` returns an `AsyncIterable` that yields individual resources across all pages:

```typescript
const stream = fhir
  .search("Observation")
  .where("status", "eq", "final")
  .stream();

for await (const observation of stream) {
  // Each observation is yielded one at a time
  console.log(observation.code?.text);
}
```

## How Pagination Works

FHIR servers return paginated results as Bundles with `link` entries:

```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "entry": [{ "resource": { "resourceType": "Patient", "id": "1" } }],
  "link": [
    { "relation": "next", "url": "https://fhir.example.com/Patient?_page=2" }
  ]
}
```

When streaming, the DSL automatically:

1. Executes the initial search query
2. Yields each resource from the Bundle entries
3. Follows the `next` link to fetch the next page
4. Repeats until no `next` link exists

No manual pagination handling is needed.

## Type Safety

Streaming preserves full type inference. The yielded type matches your query:

```typescript
// AsyncIterable<Patient & Resource>
const patients = fhir.search("Patient").stream();

// AsyncIterable<Observation & Resource>
const observations = fhir
  .search("Observation")
  .where("status", "eq", "final")
  .stream();
```

### Profile-Aware Streaming

Profile-narrowed types carry through to the stream:

```typescript
const vitals = fhir
  .search(
    "Observation",
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs"
  )
  .where("patient", "eq", "Patient/123")
  .stream();

// Each item is typed as the US Core Vital Signs profile
for await (const vital of vitals) {
  console.log(vital.effectiveDateTime);
}
```

## Cancellation

Pass an `AbortSignal` to cancel a stream mid-iteration:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  for await (const patient of fhir.search("Patient").stream({ signal: controller.signal })) {
    console.log(patient.id);
  }
} catch (error) {
  if (error instanceof DOMException && error.name === "AbortError") {
    console.log("Stream cancelled");
  }
}
```

This is useful for:

- Timeouts on long-running queries
- User-initiated cancellation in UIs
- Processing only the first N results across pages

## Chaining with Stream

`.stream()` works with all existing query builder methods:

```typescript
for await (const obs of fhir
  .search("Observation")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .where("date", "ge", "2024-01-01")
  .sort("date", "desc")
  .count(50)
  .stream()
) {
  console.log(obs.code?.text, obs.effectiveDateTime);
}
```

:::note
The `.count()` method controls the page size (how many resources the server returns per Bundle page), not the total number of streamed results.
:::

## Collecting Stream Results

If you need all results in an array but still want automatic pagination:

```typescript
const allPatients: Patient[] = [];

for await (const patient of fhir.search("Patient").where("active", "eq", "true").stream()) {
  allPatients.push(patient);
}
```

## When to Use Stream vs Execute

| Scenario | Use |
|---|---|
| Display a single page of results | `.execute()` |
| Need `included` resources | `.execute()` |
| Need `total` count or raw Bundle | `.execute()` |
| Process large datasets | `.stream()` |
| Export or migrate data | `.stream()` |
| Memory-constrained environments | `.stream()` |
| ETL pipelines | `.stream()` |

:::tip
`.stream()` skips included resources (entries with `search.mode = "include"`) and yields only primary match results. If you need included resources, use `.execute()` and handle pagination manually with the runtime's `paginate()` utility.
:::

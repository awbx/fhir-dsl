# @fhir-dsl/runtime

Runtime execution layer for `fhir-dsl` queries — HTTP client, pagination, and error handling.

## Install

```bash
npm install @fhir-dsl/runtime
```

## Usage

### FhirExecutor

Executes compiled queries against a FHIR server:

```ts
import { FhirExecutor } from "@fhir-dsl/runtime";

const executor = new FhirExecutor({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: "your-token" },
});

const bundle = await executor.execute({
  method: "GET",
  path: "Patient",
  params: [{ name: "family", value: "Smith" }],
});
```

### Pagination

Handle paginated FHIR Bundle responses:

```ts
import { FhirExecutor, paginate, fetchAllPages } from "@fhir-dsl/runtime";

const executor = new FhirExecutor({ baseUrl: "https://hapi.fhir.org/baseR4" });
const firstBundle = await executor.execute(query);

// Stream pages with an async generator
for await (const page of paginate(executor, firstBundle)) {
  console.log(`Processing ${page.length} resources`);
}

// Or collect all pages at once
const allResources = await fetchAllPages(executor, firstBundle);
```

### Bundle Unwrapping

Parse a FHIR Bundle into typed primary and included resources:

```ts
import { unwrapBundle } from "@fhir-dsl/runtime";

const result = unwrapBundle<Patient, Practitioner>(bundle);
// result.data      — Patient[]
// result.included  — Practitioner[]
// result.total     — number | undefined
// result.hasNext   — boolean
// result.nextUrl   — string | undefined
// result.raw       — original Bundle
```

### Error Handling

```ts
import { FhirError } from "@fhir-dsl/runtime";

try {
  await executor.execute(query);
} catch (error) {
  if (error instanceof FhirError) {
    console.error(error.status, error.statusText);
    for (const issue of error.issues) {
      console.error(issue.severity, issue.diagnostics);
    }
  }
}
```

## Configuration

```ts
interface FhirClientConfig {
  baseUrl: string;
  auth?: { type: "bearer" | "basic"; credentials: string };
  headers?: Record<string, string>;
  fetch?: typeof globalThis.fetch; // custom fetch implementation
}
```

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)

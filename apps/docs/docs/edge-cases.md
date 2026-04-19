---
sidebar_position: 99
title: "Edge Cases and Gotchas"
description: "Every surprising behavior the fhir-dsl client and FHIR spec conspire to produce, with the cause, the workaround, and a reference snippet."
---

# Edge Cases and Gotchas

A consolidated catalogue of surprises — each entry spells out the
**Symptom** you'll hit, the **Why** behind it, and the **Workaround or
expected behavior**. Read it once top-to-bottom before shipping.

---

## Polymorphic `value[x]` in search and FHIRPath

**Symptom.** `Observation.value[x]` shows up as multiple optional JSON
keys (`valueQuantity`, `valueString`, `valueBoolean`, …) at runtime, and
search params like `value-quantity` / `value-string` are distinct.
FHIRPath navigation on `.value` misses everything.

**Why.** FHIR JSON encodes polymorphic fields with a type suffix on the
key (`valueQuantity`). The generator emits a union of optional fields.
FHIRPath treats `.value` as a logical polymorphic root — you must use
`ofType(Type)` to pick a branch.

**Workaround.** On the TypeScript side, discriminate via `in` checks or
optional chains: `if (obs.valueQuantity) ...`. On the search side, pick
the correct typed param (`value-quantity`, `value-string`). In FHIRPath,
use `ofType("Quantity")`:

```ts
const qty = fhirpath<Observation>("Observation").value.ofType("Quantity");
console.log(qty.compile()); // Observation.value.ofType(Quantity)
```

---

## Null / undefined / empty-collection propagation in FHIRPath

**Symptom.** `fp.name.family.upper().evaluate(patient)` returns `[]`
when the patient has no `name` — no error, no `undefined`. But
`exists()` returns `[false]` and `count()` returns `[0]`.

**Why.** FHIRPath §4.5 three-valued logic: operations on an empty
collection propagate the empty collection, *except* `exists()`,
`empty()`, `count()`, and `iif()`, which collapse emptiness to a
boolean/number. This is "empty in → empty out" by design.

**Workaround.** Either test `.exists()` before chaining, or use `iif`:

```ts
fp.iif(fp.name.family.exists(), "has", "none").evaluate(patient);
// ["none"] when family is missing
```

Strict mode (`evaluate(r, { strict: true })`) raises
`FhirPathEvaluationError` for §4.5 singleton-eval violations instead of
silently returning `[]`.

---

## Empty bundles (no `entry`, no `total`)

**Symptom.** `page.data` is `[]`, `page.total` is `undefined`,
`page.link` is `undefined` — no obvious way to distinguish "no
matches" from "server returned a broken bundle".

**Why.** FHIR R4 §3.2.1.3.3 lets servers omit `entry`, `total`, and
`link` on searchsets. The TS types mark all three optional.

**Expected behavior.** Treat `page.data.length === 0` as "no matches";
treat `page.total === undefined` as "unknown total, not zero".
Don't loop on `link.next` when it's absent — the iterator in
`stream()` already stops cleanly.

```ts
const page = await fhir.search("Patient").count(50).execute();
console.log("matched", page.data.length);
console.log("total:", page.total ?? "unknown");
```

---

## Missing `Reference` resolution (404 or deleted target)

**Symptom.** `fhir.read("Patient", id)` throws
`FhirRequestError { status: 404 }` because the reference pointed at a
resource that was deleted or versioned out.

**Why.** FHIR references are weak: the target may be gone, historical,
or contained in another bundle altogether. The client doesn't silently
skip — you get an error so you can decide.

**Workaround.** Filter-catch by status:

```ts
const patient = await fhir
  .read("Patient", id)
  .execute()
  .catch((e) => {
    if (e?.status === 404 || e?.status === 410) return undefined;
    throw e;
  });
```

When the reference count is high, switch to `_include` so the server
resolves the targets in one shot. See the "Parallel Reference Fetch"
recipe.

---

## Spec mismatches (server returns R4 fields on an R5 endpoint)

**Symptom.** You generate against `r5` but the server is running
`r4b` behind the scenes; `patient.contact[].name.use` is a string your
schema no longer accepts.

**Why.** Some servers advertise one version in the CapabilityStatement
but serialise resources with older field shapes — migrations lag, or
the server normalises across versions.

**Workaround.** Run client-side `.validate()` to catch these early.
Confirm the server's actual version by reading
`CapabilityStatement.fhirVersion`. Regenerate against the matching
version rather than papering over the mismatch.

```ts
const caps = await fhir.capabilities().execute();
console.log(caps.fhirVersion); // e.g. "4.0.1"
```

---

## `.usePost()` auto-upgrade at 1900 UTF-8 bytes

**Symptom.** Your search is compiled to a POST even though you didn't
call `.usePost()`. `query.method === "POST"`, `path === "Patient/_search"`,
`headers["Content-Type"] === "application/x-www-form-urlencoded"`.

**Why.** FHIR R4 §3.1.0.1.5.1 lets servers cap URL length.
`SearchQueryBuilder.compile()` measures the UTF-8 byte length of the
compiled URL and silently flips to a form-encoded POST past
`DEFAULT_AUTO_POST_THRESHOLD = 1900` bytes. `_format` and `_pretty`
stay on the query string.

**Workaround.**

- **Force-disable** with `.usePost(false)` — but the threshold still
  wins if the URL is actually too long.
- **Force-enable** with `.usePost()` — sends POST regardless of length.
- **Inspect** with `.getUrlByteLimit()` to read the active cap.
- **When it matters**: servers that don't support `POST _search` (rare,
  mostly read-only proxies). Chop the `whereIn` / `_id` list into
  smaller batches and union client-side.

```ts
const byte = fhir.search("Patient").getUrlByteLimit(); // 1900
const builder = fhir.search("Patient").whereIn("_id", hundredsOfIds);
const q = builder.compile();
console.log(q.method); // "POST"
```

---

## Cross-origin `Authorization` strip during paginated redirects

**Symptom.** The second page of a search returns 401. Same request
worked for the first page.

**Why.** RFC 6750 §5.3 prohibits sending a Bearer token to an origin it
wasn't issued for. `FhirExecutor` compares the target URL's origin to
the configured `baseUrl` and drops `Authorization` when they differ —
typical when the server's `next` link points at a CDN or load balancer
on a different host.

**Expected behavior.** Configure the server to emit same-origin `next`
URLs; or if the CDN is trusted and accepts the token, pre-sign the
URL server-side so it doesn't need the header. Do not work around
this by forcing `Authorization` cross-origin — you'll leak the token.

Related: if you override `fetch` with `{ redirect: "manual" }`, the
auth-strip protection is bypassed; you're on your own for redirect
safety.

---

## Condition tree OR falling back to `_filter`

**Symptom.** `where(eb => eb.or([["status","eq","final"], ["code","eq","1234-5"]]))`
compiles to a single `_filter` param and some servers return 400.

**Why.** Cross-param OR cannot be expressed as a native searchset
param — the only FHIR-portable "OR" is same-param comma-joining
(§3.1.0.1.5.7). The DSL falls back to `_filter` (§3.1.0.1.5.6) which
HAPI supports but Epic and several vendors reject.

**Workaround.** Issue two separate searches and merge client-side, or
keep the OR within one param:

```ts
// Portable — same param, comma-join
fhir.search("Observation").whereIn("status", ["final", "amended"]);

// Portable — two queries, merge client-side
const [a, b] = await Promise.all([
  fhir.search("Observation").where("status", "eq", "final").execute(),
  fhir.search("Observation").where("code", "eq", "1234-5").execute(),
]);
```

Test `_filter` support against your target servers before relying on it.

---

## `:not` emitted as `not(x eq v)` inside `_filter`

**Symptom.** When a condition tree routes to `_filter`, the negation
shows up as `_filter=not(status eq 'entered-in-error')` rather than
`_filter=status ne 'entered-in-error'`.

**Why.** FHIR's `:not` modifier *includes* resources whose parameter is
null (unknown status counts as "not equal to X"). `_filter ne`
excludes them. To keep the two forms semantically identical, the DSL
rewrites `:not` inside `_filter` to `not(x eq v)` so null-valued rows
match either way.

**Consequence.** Rows with null `status` appear in the results — often
what you want, occasionally not. If you need to *exclude* nulls, add
`whereMissing("status", false)` alongside the negation.

```ts
fhir
  .search("Observation")
  .where("status", "not", "entered-in-error")
  .whereMissing("status", false); // also require status present
```

---

## Async pattern 202 `Content-Location` polling

**Symptom.**
`AsyncPollingTimeoutError` thrown after 120 seconds; OR pending job
URL returns 404 when you try to poll it later; OR polling hammers the
server every 200 ms and gets rate-limited.

**Why.** The async executor polls `Content-Location` until a non-202
status, capped by `AsyncPollingConfig { pollingInterval = 2000 ms,
maxAttempts = 60 }` — two minutes by default. Bulk export jobs
regularly take longer. The status URL may also expire server-side
(FHIR doesn't mandate a TTL).

**Workaround.** Raise the cap for heavy ops:

```ts
const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  async: { pollingInterval: 2000, maxAttempts: 300 }, // 10 minutes
});
```

Catch `AsyncPollingTimeoutError`, persist the status URL, and resume
polling in a separate worker. Honour `Retry-After` — the client already
does (§7231 HTTP-date or delta-seconds via `parseRetryAfter`).

---

## `_count` server cap and enforcing client-side cap

**Symptom.** You pass `.count(500)` and get back 100 rows per page.

**Why.** Servers are allowed to cap `_count` at whatever they like
(typical: 100, 200, 1000). FHIR R4 §3.1.0.3.1 allows servers to
restrict page size regardless of the client's request.

**Workaround.** Don't rely on `data.length === requested count`.
Check the actual length; follow `link.next` for the rest. When you
want to enforce a client-side upper bound, cap yourself:

```ts
const page = await fhir.search("Patient").count(50).execute();
console.log("requested 50, got", page.data.length);
// Cap with summary("count") if you only want the count
const countOnly = await fhir.search("Patient").total("accurate").summary("count").execute();
```

---

## HTTP retry/backoff on transient failures

**Symptom.** 429 / 503 responses used to fail the request; now they
succeed after a delay — but `maxAttempts` still caps you out on
long-running outages.

**Why.** `FhirClientConfig.retry` enables retry on `429` and `503` by
default with `maxAttempts: 3`, `baseBackoffMs: 100`,
`maxBackoffMs: 30000`, full-jitter backoff (via `computeBackoffMs`).
`Retry-After` is honoured when present.

**Workaround.** Tune `retry` for your workload; disable it for
operations you never want retried (idempotency concerns around
create/update):

```ts
const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  retry: {
    maxAttempts: 5,
    baseBackoffMs: 250,
    maxBackoffMs: 60_000,
    retryStatuses: new Set([429, 503]),
    respectRetryAfter: true,
  },
});

// Disable per-request:
const fhirNoRetry = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  retry: false,
});
```

For write operations, consider enabling retry only on GETs — a retried
POST can create duplicates unless the endpoint is idempotent
(`If-None-Exist` helps for conditional creates).

---

## Thenable detection on FHIRPath expressions

**Symptom.** `await someFhirPathExpr` returns the expression itself,
not a promise resolution. Looks like nothing happened.

**Why.** `FhirPathExpr` is a Proxy. It deliberately returns `undefined`
for the `then` property so awaiting an expression doesn't accidentally
trigger thenable detection. Expressions are terminal-only values —
call `.evaluate(resource)` to get an array of results.

**Workaround.** Always terminate with `.compile()` (→ `string`) or
`.evaluate(resource)` (→ `unknown[]`). Both return plain values you
can await, log, and serialise.

---

## FHIRPath `$total` dual semantics

**Symptom.** Inside `where`/`select`/`repeat`, `$total` is a number
(collection length). Inside `aggregate`, `$total` is the accumulator
and starts as the `init` value.

**Why.** FHIRPath spec: `$total` means different things in different
iteration frames. The evaluator inspects the enclosing frame and
returns the right value — but the type system can't always know which
you're in.

**Workaround.** When in doubt, pass an explicit `init` to `aggregate`
so you know the starting type:

```ts
import { $total, fhirpath } from "@fhir-dsl/fhirpath";

const sum = fhirpath<O>("O").component.v.aggregate(
  ($this) => ($this as unknown).add($total),
  0, // $total starts as 0 — a number
);
```

---

## `_field` primitive-extension siblings

**Symptom.** You want the extension on a primitive
(`Patient.name[0].family`), which FHIR stores as a `_family` sibling,
but `fhirpath<Patient>("Patient").name.family.extension` is
type-hostile (you try to navigate `extension` off a string).

**Why.** FHIR JSON §2.1.9 encodes primitive extensions on a sibling
object keyed `_field`. The evaluator's primitive-box layer merges
`family` and `_family` into one logical element with `.extension`
navigation. The builder reserves `.extension` for the sugar.

**Workaround.** Drop to raw ops:

```ts
import { evaluate } from "@fhir-dsl/fhirpath";

const exts = evaluate(
  [
    { type: "nav", prop: "name" },
    { type: "nav", prop: "family" },
    { type: "nav", prop: "extension" },
  ],
  patient,
);
```

---

## Auto-POST upgrade cooperates with auth strip

**Symptom.** After the auto-POST upgrade (see above), a cross-origin
`next` link arrives and you get 401. Same symptom as the pure-GET
case — but confusingly the first page used POST.

**Why.** Auth-strip applies on *every* request, regardless of method.
Nothing special about POST.

**Workaround.** Same as above — configure the server to emit
same-origin links, or don't cross origins in pagination.

---

## Pagination cycle detection

**Symptom.** `paginate()` throws a cycle error; your stream ends
prematurely with a clear error message.

**Why.** `paginate()` maintains a set of visited `next` URLs. If the
server (or an intermediary) returns a `next` that points at a
previously fetched URL, pagination halts immediately.

**Workaround.** Inspect the cycle URL; it usually indicates a
misconfigured load balancer or a server bug. As a belt-and-braces
safeguard add a client-side page counter limit for long traversals.

---

## `total("accurate")` silently ignored

**Symptom.** You pass `.total("accurate")` and still get
`estimate`-level accuracy (or no total at all).

**Why.** `_total` is a hint, not a command. Servers MAY honour it;
many ignore it on unindexed queries because computing an accurate
total is expensive.

**Workaround.** Don't rely on `.total` for critical UI. Paginate with
`stream()` and count client-side when correctness matters. Use
`summary("count")` for the cheapest "how many rows match" query.

---

## `FhirRequestError` on non-JSON error bodies

**Symptom.** Some servers emit HTML error pages for 500s; the usual
`error.body.issue` access throws because `body` is `undefined`.

**Why.** `FhirExecutor` parses successful JSON responses into
`body`, and exposes non-JSON error responses as `responseText` on
the `FhirError` / `FhirRequestError`. This is deliberate — we don't
fail on non-JSON errors, but we don't pretend they're OperationOutcomes
either.

**Workaround.**

```ts
import { FhirRequestError } from "@fhir-dsl/core";

try {
  await fhir.read("Patient", id).execute();
} catch (e) {
  if (e instanceof FhirRequestError) {
    const outcome = (e.body as { issue?: unknown[] } | undefined)?.issue;
    if (outcome) console.error("OperationOutcome:", outcome);
    else console.error("Raw body:", (e as { responseText?: string }).responseText);
  }
  throw e;
}
```

---

## TransactionBuilder urn:uuid placeholders

**Symptom.** You write `subject: { reference: "Patient/new" }` in a
transaction entry and the server can't resolve it.

**Why.** The `id` is assigned by the server only after the transaction
runs. `TransactionBuilder` handles this by auto-assigning
`urn:uuid:<uuid>` fullUrls to each entry and rewriting references — but
only when you use the builder's `.create()` method. Hand-built
references stay as written.

**Workaround.** Let the builder handle ids — or if you must cross-
reference before the builder has run, generate a UUID yourself and
use it both as the `fullUrl` and as the `reference`:

```ts
const tmp = `urn:uuid:${crypto.randomUUID()}`;
await fhir.transaction()
  .$call((tx) =>
    tx.create({ resourceType: "Patient", /* ... */ } as const)
  )
  .create({
    resourceType: "Observation",
    status: "final",
    subject: { reference: tmp }, // must match an entry fullUrl
    code: { /* ... */ },
  })
  .execute();
```

---

## `.validate()` unavailable without `schemas`

**Symptom.** `.validate()` on a read/search throws
`ValidationUnavailableError` at `execute()` time — not at build time.

**Why.** The schema registry is resolved lazily so you can construct
builders at module load before `schemas` has been imported. The
validation terminal is the point of failure.

**Workaround.** Wire `schemas` in `FhirClientConfig` at client
construction. If you're intentionally running without validation, don't
call `.validate()`.

```ts
const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: FHIR_BASE,
  schemas, // required before .validate()
});
```

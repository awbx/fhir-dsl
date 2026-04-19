---
id: dsl-syntax
title: DSL Syntax
sidebar_label: DSL Syntax
sidebar_position: 2
---

# DSL Syntax

fhir-dsl exposes three core builder families — **search**, **read**, and **transaction / batch** — plus direct CRUD (`create`, `update`, `delete`, `patch`) and `operation()`. Every family follows the same shape: start with a `fhir.*(...)` call, chain **modifier** methods, and end at a **terminal** (`.compile()` / `.execute()` / `.stream()`).

## The fluent chain

Three rules describe the entire surface:

1. **Every chainable method returns a new builder.** Builders are immutable (see [Immutable Builders](./immutability.md)); the instance is never mutated. This means `const base = fhir.search("Patient"); base.where(...)` does **not** change `base`.
2. **Terminals never return a builder.** `.compile()` returns a `CompiledQuery`; `.execute()` returns a `Promise`; `.stream()` returns an `AsyncIterable`. Once you hit a terminal, the chain ends.
3. **Modifier methods chain indefinitely** and their return type stays the same shape, threading new generic slots through each call (`.include()` widens `Inc`, `.withProfile()` swaps `Prof`, `.select()` narrows `Sel` — see [Types & Generics](./types-and-generics.md)).

```typescript
const result = await fhir
  .search("Patient")                                // start
  .where("family", "eq", "Smith")                   // modifier
  .where("birthdate", "ge", "1990-01-01")           // modifier
  .include("general-practitioner")                  // modifier (widens Inc)
  .sort("birthdate", "desc")                        // modifier
  .count(10)                                        // modifier
  .offset(0)                                        // modifier
  .execute();                                       // terminal
```

:::note Gotcha — terminal means terminal
You cannot chain modifiers after `.compile()`. If you want to inspect and then run, call them on separate branches of the same (immutable) base builder:
```typescript
const base = fhir.search("Patient").where("family", "eq", "Smith");
console.log(base.compile());   // inspect
const page = await base.execute(); // run
```
:::

## Search Queries

### `where(param, operator, value)`

Adds a typed search parameter. The operator slot is constrained by the param's **type** (`string` / `token` / `date` / …), so TypeScript refuses illegal combinations at compile time:

```typescript
// String parameters: eq, contains, exact
.where("family", "eq", "Smith")
.where("name", "contains", "John")
.where("family", "exact", "O'Brien")

// Token parameters: eq, not, in, not-in, text, above, below, of-type, code-text
.where("status", "eq", "active")
.where("gender", "not", "unknown")
.where("code", "in", "http://example.com/ValueSet/my-codes")
.where("code", "code-text", "diabetes")

// Date parameters: eq, ne, gt, ge, lt, le, sa, eb, ap
.where("birthdate", "ge", "1990-01-01")
.where("date", "lt", "2024-12-31")

// Reference parameters: eq, identifier
.where("patient", "eq", "Patient/123")
.where("patient", "identifier", "http://hospital.example.org|MRN-123")

// Quantity parameters: eq, ne, gt, ge, lt, le, sa, eb, ap
.where("value-quantity", "gt", "5.4|http://unitsofmeasure.org|mg")

// Number parameters: eq, ne, gt, ge, lt, le
.where("probability", "gt", "0.8")

// URI parameters: eq, above, below
.where("url", "below", "http://example.com/fhir/")
```

:::note Prefixes vs. modifiers
FHIR splits these operators into two URL-level concepts:

- **Value-prefixes** (`gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap`, `ne`) attach to the value: `birthdate=gt2020`.
- **Modifiers** (`exact`, `contains`, `not`, `in`, `not-in`, `above`, `below`, `of-type`, `identifier`, `text`, `code-text`) attach to the parameter name: `family:exact=Smith`.

The builder routes each op to the correct slot automatically. If you read `CompiledQuery.params[*]`, prefixes land on `prefix` and modifiers land on `modifier` — never both on the same entry.
:::

### Multi-value (OR via comma)

Pass an array to `where(..., "eq", [...])` to express an OR across values. FHIR encodes this as a comma-separated list (`gender=male,female`), and the builder URL-encodes embedded commas in each value.

```typescript
// Equivalent to: Patient?gender=male,female
.where("gender", "eq", ["male", "female"])
.whereIn("gender", ["male", "female"])  // shorthand
```

OR-arrays are only valid with `eq` — combining an array with a non-`eq` operator throws at `compile()` time, since FHIR does not allow per-value prefixes inside an OR list.

### Functional `where` (composable conditions)

When you need OR across **different** parameters, nested groups, or want to extract reusable query fragments, pass a callback to `where(...)`. The callback receives a builder with `eb.and([...])` and `eb.or([...])` constructors and returns a `Condition` tree.

The compiler picks the most natural FHIR shape automatically:

| Tree shape | Compiled URL |
|---|---|
| Single tuple, or `eb.and([...tuples])` | One query param per tuple (FHIR's implicit AND) |
| `eb.or([...])` of `eq` tuples sharing one param-name | Single comma-joined param (`status=final,amended`) |
| Anything else (mixed fields, nested groups, non-`eq` inside an OR) | Single `_filter=<FHIRPath>` param |

```typescript
// Same-param OR — collapses to status=final,amended
fhir.search("Observation").where(eb =>
  eb.or([
    ["status", "eq", "final"],
    ["status", "eq", "amended"],
  ]),
);

// Mixed-field OR — falls back to _filter
fhir.search("Observation").where(eb =>
  eb.or([
    ["status", "eq", "final"],
    ["code", "eq", "1234-5"],
  ]),
);
// → Observation?_filter=status eq 'final' or code eq '1234-5'

// Nested groups
fhir.search("Observation").where(eb =>
  eb.and([
    ["subject", "eq", "Patient/123"],
    eb.or([
      ["status", "eq", "final"],
      ["status", "eq", "amended"],
    ]),
  ]),
);
```

**`_filter` operator support.** Inside the FHIR `_filter` grammar, `contains` becomes `co`, `not` becomes `ne`, and `not-in` becomes `ni`. The following operators have no equivalent in `_filter` and will throw if used inside an OR or nested group: `exact`, `above`, `below`, `of-type`, `text`, `identifier`, `code-text`, `missing`. Use the positional `where(...)` form for those.

**`_filter` server support varies.** Not every FHIR server implements `_filter` — that is why the builder only reaches for it when the simpler URL forms cannot express your query.

### `whereMissing(param, isMissing)`

Adds a `:missing` modifier to filter resources where a parameter is (or is not) populated:

```typescript
.whereMissing("birthdate", true)   // birthdate:missing=true
.whereMissing("birthdate", false)  // birthdate:missing=false
```

### `whereComposite(param, values)`

Searches using composite (multi-value) search parameters. Composite params combine multiple component values joined by `$` in the FHIR wire format:

```typescript
// Find observations with a specific code AND quantity value
const result = await fhir
  .search("Observation")
  .whereComposite("code-value-quantity", {
    code: "http://loinc.org|8480-6",
    "value-quantity": "60",
  })
  .execute();

// Compiles to: Observation?code-value-quantity=http://loinc.org|8480-6$60
```

Each component key and value type is validated at compile time. The generated types carry component metadata, so only valid component names are accepted and each value is typed according to its underlying search param type.

### `include(param, options?)` and `revinclude(source, param, options?)`

Includes related resources in the response, with typed targets:

```typescript
const result = await fhir
  .search("Patient")
  .include("general-practitioner")        // widens Inc with Practitioner | Organization | PractitionerRole
  .include("organization")
  .revinclude("Observation", "subject")   // widens Inc with Observation
  .execute();

// result.data:     Patient[]
// result.included: (Practitioner | Organization | PractitionerRole | Observation)[]
```

Both methods accept `{ iterate: true }` to follow include chains transitively — compiles to `_include:iterate` / `_revinclude:iterate`:

```typescript
.include("medication", { iterate: true })
```

### `whereChained` and `whereChain` — chained params

`whereChained` covers the one-hop case; `whereChain` handles 2–3 hops with each hop typed against the previous one:

```typescript
// One hop
.whereChained("subject", "Patient", "name", "eq", "Smith")
// → subject:Patient.name=Smith

// Two hops
.whereChain(
  [["encounter", "Encounter"], ["subject", "Patient"]],
  "name", "eq", "Smith",
)
// → encounter:Encounter.subject:Patient.name=Smith
```

Recursion is capped at three typed hops to keep TypeScript inference well-behaved. Deeper chains fall back to the untyped overload.

### `has(sourceResource, refParam, searchParam, op, value)` — reverse chain

Filters results based on properties of resources that **reference** them:

```typescript
.has("Observation", "subject", "code", "eq", "http://loinc.org|85354-9")
// → Patient?_has:Observation:subject:code=http://loinc.org|85354-9
```

`_has` filters the primary results — it does not add included resources. Use `revinclude` if you want the referencing resources in the response.

### Meta-parameter helpers

These methods wrap the FHIR meta search parameters (`_id`, `_lastUpdated`, `_tag`, `_security`, `_source`) and the result-shaping parameters (`_summary`, `_total`, `_contained`, `_containedType`).

```typescript
fhir
  .search("Patient")
  .whereId("123", "456")                       // _id=123,456
  .whereLastUpdated("ge", "2024-01-01")        // _lastUpdated=ge2024-01-01
  .withTag("http://acme.com/tags|vip")         // _tag=...
  .withSecurity("R")                           // _security=R
  .fromSource("https://acme.com/fhir")         // _source=...
  .summary("count")                            // _summary=count
  .total("accurate")                           // _total=accurate
  .contained("true")                           // _contained=true
  .containedType("container");                 // _containedType=container
```

The mode arguments are typed as their FHIR-defined literal unions (`"true" | "false" | "text" | "data" | "count"`, etc.).

### `sort`, `count`, `offset`

```typescript
.sort("birthdate", "desc")   // default: asc
.count(25)                   // _count=25
.offset(50)                  // _getpagesoffset=50
```

### `select(fields)`

Narrows the returned resources to the given top-level fields. Compiles to FHIR's [`_elements`](https://www.hl7.org/fhir/search.html#elements) search parameter and refines the result type via `Pick`:

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .select(["id", "name", "birthDate"])
  .execute();

// result.data[0] is typed as:
// { resourceType: "Patient"; id?: string; name?: HumanName[]; birthDate?: FhirDate }
```

Behavior:

- Only top-level element names are accepted — FHIR `_elements` does not support nested paths like `"name.given"`.
- `resourceType` is always preserved in the narrowed type.
- Calling `.select()` again replaces the previous selection; selections do not accumulate.
- Per the FHIR spec, servers return *at least* the requested elements — they may return more. The narrowed TypeScript type reflects what you asked for, not what the server is guaranteed to return.

### Escape hatches

When a query needs a feature outside the typed surface, the builder offers untyped pass-through methods. They emit raw URL parameters and skip schema validation — use them sparingly.

```typescript
fhir
  .search("Patient")
  .filter("name eq 'Smith' and birthdate gt 1990")  // _filter=...
  .namedQuery("everything", { start: "2024-01-01" }) // _query=everything&start=...
  .text("diabetes")                                  // _text=diabetes
  .content("blood pressure")                         // _content=...
  .inList("active-list");                            // _list=active-list
```

### Profile-aware search

Pass a generated profile name as the second argument to `search()` to narrow `Prof`:

```typescript
const result = await fhir
  .search("Patient", "us-core-patient")
  .where("family", "eq", "Jones")
  .execute();
// result.data: USCorePatient[] — profile-required fields (gender, identifier) are no longer optional
```

See [Types & Generics](./types-and-generics.md#prof---withprofile-and-search-overload) for how the `Prof` slot threads through `.select()`.

## Compile vs execute

Every search / read / transaction / operation builder splits **planning** from **running**:

```typescript
// Plan — no network I/O
const q = fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .compile();
// q = { method: "GET", path: "Patient", params: [{ name: "family", value: "Smith" }] }

// Run — fires fetch, parses bundle, returns typed result
const r = await fhir.search("Patient").where("family", "eq", "Smith").execute();
```

`CompiledQuery` is `{ method, path, params, headers?, body? }` (`packages/core/src/compiled-query.ts`). Log it, diff it in tests, or hand it to a custom transport.

## Search result type

`execute()` returns a `SearchResult`:

```typescript
interface SearchResult<Primary, Included> {
  data: Primary[];
  included: [Included] extends [never] ? [] : Included[];
  total?: number | undefined;
  link?: BundleLink[] | undefined;
  raw: unknown;            // raw Bundle, for escape hatches
}
```

Match-mode entries go to `data`; include-mode entries go to `included`. The raw Bundle is still available on `result.raw`.

## Streaming

`stream()` returns an `AsyncIterable` that yields individual resources across all pages, automatically following Bundle pagination links:

```typescript
for await (const patient of fhir.search("Patient").stream()) {
  console.log(patient.id);
}
```

Supports cancellation via `AbortSignal`:

```typescript
const controller = new AbortController();
for await (const patient of fhir.search("Patient").stream({ signal: controller.signal })) {
  if (shouldStop) controller.abort();
}
```

## POST _search

Long URLs (chained params, big OR lists, sensitive identifiers) can exceed proxy/server URL limits or leak data through access logs. `.usePost()` forces the compiled query to `POST <Resource>/_search` with `application/x-www-form-urlencoded`:

```typescript
const compiled = fhir
  .search("Patient")
  .whereIn("identifier", ["MRN-001", "MRN-002" /* ... */])
  .usePost()
  .compile();

// compiled.method === "POST"
// compiled.path   === "Patient/_search"
// compiled.headers["Content-Type"] === "application/x-www-form-urlencoded"
```

The builder also **auto-switches** to POST when the serialized GET URL exceeds **1900 UTF-8 bytes** (`DEFAULT_AUTO_POST_THRESHOLD`, `packages/core/src/search-query-builder.ts:61`). Override the ceiling with `.getUrlByteLimit(bytes)` — despite the name, this is a setter that returns a new builder.

## Composition: `$if` and `$call`

Two universal helpers let you compose queries dynamically without breaking out of the chain. They are available on every fluent builder (`search`, `read`, `transaction`, `batch`).

### `$if(condition, callback)`

Conditionally apply a callback. When `condition` is `true`, returns `callback(qb)`; otherwise returns the builder unchanged.

```typescript
const recent = req.query.from === "today";

const result = await fhir
  .search("Observation")
  .where("patient", "eq", "Patient/123")
  .$if(recent, (qb) => qb.where("date", "ge", new Date().toISOString().slice(0, 10)))
  .$if(req.query.includeSubject === "true", (qb) => qb.include("subject"))
  .execute();
```

The callback receives the same builder type via polymorphic `this`, so chaining inside the callback keeps every generic narrowed (includes, profile, `_elements` selection).

### `$call(callback)`

Always applies the transformer; returns whatever the callback returns. Lets you extract reusable query fragments.

```typescript
// Reusable fragment, defined once
const onlyFinal = <QB extends SearchQueryBuilder<any, any, any, any, any, any>>(qb: QB): QB =>
  qb.where("status", "eq", "final") as QB;

const labs   = await fhir.search("Observation").where("category", "eq", "laboratory").$call(onlyFinal).execute();
const vitals = await fhir.search("Observation").where("category", "eq", "vital-signs").$call(onlyFinal).execute();
```

See [Immutable Builders](./immutability.md) for more composition patterns.

## Read queries

Read a single resource by type and id:

```typescript
const patient = await fhir.read("Patient", "123").execute();
// patient: Patient

const query = fhir.read("Patient", "123").compile();
// { method: "GET", path: "Patient/123", params: [] }
```

`.ifNoneMatch(etag)` and `.ifModifiedSince(date)` add conditional read headers; the server replies `304` on an unchanged resource, surfaced as `FhirRequestError` so you can branch on `err.status`.

## Transactions

Group multiple operations into an atomic FHIR transaction:

```typescript
const result = await fhir
  .transaction()
  .create({ resourceType: "Patient", name: [{ family: "Doe" }], gender: "female" })
  .update({ resourceType: "Patient", id: "existing-123", name: [{ family: "Smith" }], gender: "male" })
  .delete("Observation", "obs-456")
  .execute();
```

`.compile()` returns a FHIR Bundle (`type: "transaction"`). Use `batch()` for the non-atomic variant.

## Operator reference

| Parameter Type | Valid Operators |
|---|---|
| `string` | `eq`, `contains`, `exact` |
| `token` | `eq`, `not`, `in`, `not-in`, `text`, `above`, `below`, `of-type`, `code-text` |
| `date` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `number` | `eq`, `ne`, `gt`, `ge`, `lt`, `le` |
| `quantity` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `reference` | `eq`, `identifier` |
| `uri` | `eq`, `above`, `below` |
| `composite` | N/A — use `whereComposite` with structured component values |

`:missing` is cross-cutting — use `.whereMissing(param, true | false)` rather than passing it through `where`.

## FHIR search spec coverage

Mapping of [FHIR search](https://fhir.hl7.org/fhir/search.html) features to the builder API:

| FHIR feature | Builder API |
|---|---|
| Equality / value-prefix ops (`gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap`, `ne`) | `.where(param, op, value)` |
| Modifiers `:exact`, `:contains`, `:not`, `:in`, `:not-in`, `:above`, `:below`, `:identifier`, `:of-type`, `:text`, `:code-text` | `.where(param, modifier, value)` |
| `:missing` | `.whereMissing(param, true \| false)` |
| OR via comma | `.where(param, "eq", [v1, v2])` or `.whereIn(param, [...])` |
| `_id`, `_lastUpdated`, `_tag`, `_security`, `_source` | `.whereId(...)`, `.whereLastUpdated(op, v)`, `.withTag(v)`, `.withSecurity(v)`, `.fromSource(uri)` |
| `_summary`, `_total`, `_contained`, `_containedType` | `.summary(mode)`, `.total(mode)`, `.contained(mode)`, `.containedType(mode)` |
| `_include`, `_revinclude` | `.include(...)`, `.revinclude(...)` |
| `_include:iterate`, `_revinclude:iterate` | `.include(spec, { iterate: true })`, `.revinclude(spec, { iterate: true })` |
| Chained params (multi-hop) | `.whereChain([hops], op, value)` |
| `_has` reverse-chain | `.has(rt, param, target, op, value)` |
| Composite params | `.whereComposite(name, components)` |
| `_filter` | `.filter(expr)` or compiled automatically by condition trees |
| `_query` | `.namedQuery(name, params?)` |
| `_text`, `_content`, `_list` | `.text(q)`, `.content(q)`, `.inList(listId)` |
| POST `_search` | `.usePost()` (auto-switch over 1900 UTF-8 bytes) |
| `_count`, `_sort` | `.count(n)`, `.sort(param, dir)` |
| `_elements` | `.select([...fields])` |
| `Prefer: respond-async` + 202 polling | `.execute({ prefer: { respondAsync: true } })` — see [Async Pattern](./async-pattern.md) |

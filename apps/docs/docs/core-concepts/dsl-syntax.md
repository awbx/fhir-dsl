---
id: dsl-syntax
title: DSL Syntax
sidebar_label: DSL Syntax
---

# DSL Syntax

fhir-dsl provides three builder types for interacting with FHIR servers: **search**, **read**, and **transaction**. Each follows a fluent, chainable API with full type safety.

## Search Queries

Search is the primary way to find resources. Start with `fhir.search()` and chain methods:

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .include("general-practitioner")
  .sort("birthdate", "desc")
  .count(10)
  .offset(0)
  .execute();
```

### `where(param, operator, value)`

Adds a search parameter with a typed operator and value:

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
.where("subject", "eq", "Patient/456")
.where("patient", "identifier", "http://hospital.example.org|MRN-123")

// Quantity parameters: eq, ne, gt, ge, lt, le, sa, eb, ap
.where("value-quantity", "gt", "5.4|http://unitsofmeasure.org|mg")

// Number parameters: eq, ne, gt, ge, lt, le
.where("probability", "gt", "0.8")

// URI parameters: eq, above, below
.where("url", "below", "http://example.com/fhir/")
```

The operator is constrained by the parameter type -- TypeScript won't let you use `"contains"` on a date parameter.

:::note Prefixes vs. modifiers
FHIR splits these operators into two URL-level concepts:

- **Value-prefixes** (`gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap`, `ne`) attach to the value: `birthdate=gt2020`.
- **Modifiers** (`exact`, `contains`, `not`, `in`, `not-in`, `above`, `below`, `of-type`, `identifier`, `text`, `code-text`) attach to the parameter name: `family:exact=Smith`.

The builder routes each op to the correct slot automatically. If you read `CompiledQuery.params[*]`, prefixes land on `prefix` and modifiers land on `modifier` -- never both on the same field.
:::

### Multi-value (OR via comma)

Pass an array to `where(..., "eq", [...])` to express an OR across values. FHIR encodes this as a comma-separated list (`gender=male,female`), and the builder URL-encodes embedded commas in each value.

```typescript
// Equivalent to: Patient?gender=male,female
.where("gender", "eq", ["male", "female"])
.whereIn("gender", ["male", "female"])  // shorthand
```

OR-arrays are only valid with `eq` -- combining an array with a non-eq operator throws at `compile()` time, since FHIR doesn't allow per-value prefixes inside an OR list.

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

**`_filter` server support varies.** Not every FHIR server implements `_filter` — that's why the builder only reaches for it when the simpler URL forms can't express your query.

### `whereMissing(param, isMissing)`

Adds a `:missing` modifier to filter resources where a parameter is (or isn't) populated:

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

```typescript
// Combine composite with regular where clauses
const result = await fhir
  .search("Observation")
  .where("status", "eq", "final")
  .whereComposite("code-value-quantity", {
    code: "http://loinc.org|8480-6",
    "value-quantity": "5.4|http://unitsofmeasure.org|mg",
  })
  .execute();
```

:::note
You can still use `.where()` with composite parameters by passing the pre-formatted `$`-separated string directly. `whereComposite` provides a structured, type-safe alternative.
:::

### `include(param)`

Includes related resources in the response:

```typescript
const result = await fhir
  .search("Patient")
  .include("general-practitioner")
  .include("organization")
  .execute();

// result.data: Patient[]
// result.included: typed included resources
```

Valid include parameters are derived from the resource's reference fields.

Pass `{ iterate: true }` to follow include chains transitively (compiles to `_include:iterate`):

```typescript
const result = await fhir
  .search("MedicationRequest")
  .include("medication")
  .include("medication", { iterate: true })  // _include:iterate=MedicationRequest:medication
  .execute();
```

### `revinclude(sourceResource, param)`

Includes resources that **reference** the search results (the reverse of `include`):

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .revinclude("Observation", "subject")
  .execute();

// result.data: Patient[]
// result.included: Observation[] (observations referencing these patients)
```

Both arguments are type-checked: `"Observation"` must be a resource that has a reference param targeting `Patient`, and `"subject"` must be that specific param.

`revinclude` accepts the same `{ iterate: true }` option as `include`.

### `whereChained(refParam, targetResource, targetParam, op, value)`

Searches through a reference to filter by properties of the referenced resource:

```typescript
// Find observations where the referenced patient's name is "Smith"
const result = await fhir
  .search("Observation")
  .whereChained("subject", "Patient", "name", "eq", "Smith")
  .execute();

// Compiles to: Observation?subject:Patient.name=Smith
```

All five arguments are type-checked:
1. `"subject"` must be a reference param on Observation
2. `"Patient"` must be a valid target of that reference
3. `"name"` must be a valid search param on Patient
4. `"eq"` must be a valid operator for string params
5. The value type matches the param type

```typescript
// Chain through with non-eq operators
.whereChained("subject", "Patient", "birthdate", "ge", "1990-01-01")
// Compiles to: subject:Patient.birthdate=ge1990-01-01
```

### `whereChain(hops, op, value)` — multi-hop chains

`whereChained` covers the one-hop case. For two or more hops, use `whereChain`:

```typescript
// Two hops: through Encounter -> Patient
fhir
  .search("Observation")
  .whereChain(
    [["encounter", "Encounter"], ["subject", "Patient"]],
    "name",
    "eq",
    "Smith",
  )
  .execute();
// Compiles to: encounter:Encounter.subject:Patient.name=Smith
```

Each hop is `[refParam, targetResource]` and is type-checked against the previous step. The trailing `(op, value)` is validated against the terminal search param. Recursion is capped at three hops to keep TS inference well-behaved.

### `has(sourceResource, refParam, searchParam, op, value)`

Filters results based on properties of resources that **reference** them (reverse chaining):

```typescript
// Find patients that have at least one final observation with a specific code
const result = await fhir
  .search("Patient")
  .has("Observation", "subject", "code", "eq", "http://loinc.org|85354-9")
  .execute();

// Compiles to: Patient?_has:Observation:subject:code=http://loinc.org|85354-9
```

All arguments are type-checked:
1. `"Observation"` must be a resource with a reference param targeting Patient
2. `"subject"` must be that reference param
3. `"code"` must be a valid search param on Observation
4. Operator and value are validated against the param type

```typescript
// Combine _has with regular where clauses
const result = await fhir
  .search("Patient")
  .where("active", "eq", "true")
  .has("Observation", "subject", "date", "ge", "2024-01-01")
  .execute();
```

:::note
`_has` filters the primary results — it doesn't add included resources. Use `revinclude` if you want the referencing resources in the response.
:::

### `sort(param, direction?)`

Sorts results by a search parameter:

```typescript
.sort("birthdate", "desc")   // Descending
.sort("family", "asc")       // Ascending (default)
.sort("family")              // Ascending (default)
```

### `count(n)` and `offset(n)`

Controls pagination:

```typescript
.count(25)    // Return up to 25 results
.offset(50)   // Skip the first 50 results
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
- `resourceType` is always preserved in the narrowed type (FHIR servers include it regardless).
- Calling `.select()` again replaces the previous selection; selections do not accumulate.
- Omitting `.select()` preserves the full resource in the result type.
- Per the FHIR spec, servers return *at least* the requested elements — they may return more. The narrowed TypeScript type reflects what you asked for, not what the server is guaranteed to return.

Compiled output:

```typescript
const query = fhir
  .search("Patient")
  .select(["id", "name"])
  .compile();

// {
//   method: "GET",
//   path: "Patient",
//   params: [{ name: "_elements", value: "id,name" }]
// }
```

### Search Result Type

`execute()` returns a `SearchResult`:

```typescript
interface SearchResult<Primary, Included> {
  data: Primary[];
  included: Included[];
  total: number | undefined;
}
```

### `stream(options?)`

Returns an `AsyncIterable` that yields individual resources across all pages, automatically following Bundle pagination links:

```typescript
for await (const patient of fhir.search("Patient").stream()) {
  console.log(patient.id);
}
```

Supports cancellation via `AbortSignal`:

```typescript
const controller = new AbortController();
for await (const patient of fhir.search("Patient").stream({ signal: controller.signal })) {
  console.log(patient.id);
}
```

See the [Streaming & Lazy Loading](/docs/guides/streaming) guide for full details.

## Meta-parameter helpers

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

The mode arguments to `summary`, `total`, `contained`, and `containedType` are typed as their FHIR-defined literal unions (`"true" | "false" | "text" | "data" | "count"`, etc.).

## Escape hatches

When a query needs a feature outside the typed surface, the builder offers untyped pass-through methods. They emit raw URL parameters and skip schema validation -- use them sparingly.

```typescript
fhir
  .search("Patient")
  .filter("name eq 'Smith' and birthdate gt 1990")  // _filter=...
  .namedQuery("everything", { start: "2024-01-01" }) // _query=everything&start=...
  .text("diabetes")        // _text=diabetes
  .content("blood pressure") // _content=...
  .inList("active-list");   // _list=active-list
```

- `.filter(expr)` -- FHIR `_filter` search expression.
- `.namedQuery(name, params?)` -- FHIR `_query` plus its named-query parameters.
- `.text(q)`, `.content(q)`, `.inList(listId)` -- the corresponding `_text`, `_content`, `_list` parameters.

## POST _search

Long URLs (chained params, big OR lists, sensitive identifiers) can exceed proxy/server URL limits or leak data through access logs. `.usePost()` switches the compiled query to `POST <Resource>/_search` with an `application/x-www-form-urlencoded` body:

```typescript
const compiled = fhir
  .search("Patient")
  .whereIn("identifier", ["MRN-001", "MRN-002", /* ... */])
  .usePost()
  .compile();

// compiled.method === "POST"
// compiled.path   === "Patient/_search"
// compiled.body   === "identifier=MRN-001%2CMRN-002..."
// compiled.headers["Content-Type"] === "application/x-www-form-urlencoded"
```

The builder also auto-switches to POST when the serialized GET URL would exceed ~1900 characters, so most callers never need to opt in explicitly.

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
const onlyFinal = <T extends { where: (p: "status", op: "eq", v: "final") => T }>(qb: T) =>
  qb.where("status", "eq", "final");

const labs = await fhir
  .search("Observation")
  .where("category", "eq", "laboratory")
  .$call(onlyFinal)
  .execute();

const vitals = await fhir
  .search("Observation")
  .where("category", "eq", "vital-signs")
  .$call(onlyFinal)
  .execute();
```

`$call` is also handy for committing to a non-builder result mid-chain — for example, `qb.$call((b) => b.compile())` returns the `CompiledQuery` directly.

## Read Queries

Read a single resource by type and ID:

```typescript
const patient = await fhir.read("Patient", "123").execute();
// patient: Patient
```

The returned type matches the resource type argument.

### Compile a Read

```typescript
const query = fhir.read("Patient", "123").compile();
// { method: "GET", path: "Patient/123", params: [] }
```

## Transactions

Group multiple operations into an atomic FHIR transaction:

```typescript
const result = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe" }],
    gender: "female",
  })
  .update({
    resourceType: "Patient",
    id: "existing-123",
    name: [{ family: "Smith" }],
    gender: "male",
  })
  .delete("Observation", "obs-456")
  .execute();
```

### `create(resource)`

Adds a POST entry to the transaction Bundle:

```typescript
.create({
  resourceType: "Observation",
  status: "final",
  code: { text: "Blood Pressure" },
  subject: { reference: "Patient/123" },
})
```

### `update(resource)`

Adds a PUT entry. The resource must have an `id`:

```typescript
.update({
  resourceType: "Patient",
  id: "123",
  name: [{ family: "Updated" }],
})
```

### `delete(resourceType, id)`

Adds a DELETE entry:

```typescript
.delete("Observation", "456")
```

### Compile a Transaction

```typescript
const bundle = fhir
  .transaction()
  .create({ resourceType: "Patient", name: [{ family: "Doe" }] })
  .compile();
// Returns a FHIR Bundle with type "transaction"
```

## Profile-Aware Queries

Pass a profile URL as the second argument to `search()` to get narrowed types:

```typescript
const result = await fhir
  .search("Patient", "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient")
  .where("name", "eq", "Smith")
  .execute();

// result.data is USCorePatientProfile[]
// Profile-required fields (like gender) are no longer optional
```

This uses the `ProfileRegistry` in your generated schema to resolve the correct type.

## Operator Reference

| Parameter Type | Valid Operators |
|---|---|
| `string` | `eq`, `contains`, `exact` |
| `token` | `eq`, `not`, `in`, `not-in`, `text`, `above`, `below`, `of-type`, `code-text` |
| `date` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `number` | `eq`, `ne`, `gt`, `ge`, `lt`, `le` |
| `quantity` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `reference` | `eq`, `identifier` |
| `uri` | `eq`, `above`, `below` |
| `composite` | N/A (use `whereComposite` with structured component values) |

`:missing` is cross-cutting -- use `.whereMissing(param, true | false)` rather than passing it through `where`.

:::note
Operators `sa` (starts after) and `eb` (ends before) are FHIR-specific date/quantity operators for interval comparisons. `ap` means approximately equal.
:::

## FHIR R5 search spec coverage

Mapping of [FHIR R5 search](https://fhir.hl7.org/fhir/search.html) features to the builder API:

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
| `_filter` (FHIRPath-like search expr) | `.filter(expr)` |
| `_query` (named queries) | `.namedQuery(name, params?)` |
| `_text`, `_content`, `_list` | `.text(q)`, `.content(q)`, `.inList(listId)` |
| POST `_search` | `.usePost()` (auto-switch over ~1900 chars) |
| `_count`, `_sort` | `.count(n)`, `.sort(param, dir)` |
| `_elements` | `.select([...fields])` |

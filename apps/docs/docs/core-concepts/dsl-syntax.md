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

// Token parameters: eq, not, in, not-in, text, above, below, of-type
.where("status", "eq", "active")
.where("gender", "not", "unknown")
.where("code", "in", "http://example.com/ValueSet/my-codes")

// Date parameters: eq, ne, gt, ge, lt, le, sa, eb, ap
.where("birthdate", "ge", "1990-01-01")
.where("date", "lt", "2024-12-31")

// Reference parameters: eq
.where("patient", "eq", "Patient/123")
.where("subject", "eq", "Patient/456")

// Quantity parameters: eq, ne, gt, ge, lt, le, sa, eb, ap
.where("value-quantity", "gt", "5.4|http://unitsofmeasure.org|mg")

// Number parameters: eq, ne, gt, ge, lt, le
.where("probability", "gt", "0.8")

// URI parameters: eq, above, below
.where("url", "below", "http://example.com/fhir/")
```

The operator is constrained by the parameter type -- TypeScript won't let you use `"contains"` on a date parameter.

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

### Search Result Type

`execute()` returns a `SearchResult`:

```typescript
interface SearchResult<Primary, Included> {
  data: Primary[];
  included: Included[];
  total: number | undefined;
}
```

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
| `token` | `eq`, `not`, `in`, `not-in`, `text`, `above`, `below`, `of-type` |
| `date` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `number` | `eq`, `ne`, `gt`, `ge`, `lt`, `le` |
| `quantity` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `reference` | `eq` |
| `uri` | `eq`, `above`, `below` |

:::note
Operators `sa` (starts after) and `eb` (ends before) are FHIR-specific date/quantity operators for interval comparisons. `ap` means approximately equal.
:::

---
id: transform
title: ".transform() — Typed Row Projection"
sidebar_label: Transform
description: "Project FHIR resources + included references into flat typed rows with auto-dereferencing dotted paths."
---

# `.transform()` — Typed Row Projection

`.transform(fn)` is the final projection step on a search builder. You hand it
a callback `t => ({...})` and get back a typed row per matched resource.
Any reference you've `.include()`d is auto-dereferenced through the bundle —
`t("subject.name.0.given.0", null)` walks through the Patient entry the server
returned alongside the Encounter, all with full type inference.

## Quick start

```ts
const rows = await fhir
  .search("Encounter")
  .include("patient")
  .include("practitioner")
  .transform((t) => ({
    id: t("id", null),
    status: t("status", "unknown"),
    patientId: t.ref("subject.reference"),
    patientName: t("subject.name.0.family", null),
    practitionerName: t("participant.0.actor.name.0.family", null),
  }))
  .execute();

for (const row of rows.data) {
  // row is fully typed: { id: string | null, status: string, patientId: string | null, ... }
}
```

Three rules govern the whole API:

1. **An `.include()` activates its target field.** Without `.include("patient")`,
   `subject` stays a `Reference` and `subject.name` doesn't compile. Add the
   include and `subject` becomes `Reference | Patient` — both sides are reachable.
2. **Paths use explicit numeric segments for arrays.** `name.0.given.0`, not
   `name.given`. The type system requires this so the runtime walks the
   same path the type describes.
3. **Nulls are sinkable.** If any segment along the path is `null` /
   `undefined` / missing, `t` returns the fallback without calling your `map`
   function. No try/catch, no optional chaining.

## The `t` namespace

### `t(path, fallback, map?)`

The main callable. Reads a single field. If the path is missing, returns
`fallback`. If present, optionally transforms the value through `map`.

```ts
t("status", "unknown"),                        // string | "unknown"
t("count", 0, (n) => n * 10),                  // number with map
t("birthDate", null, (d) => new Date(d)),      // Date | null
```

### `t.ref(path)`

Strips the `ResourceType/` prefix from a reference string. Returns the bare
id, or `null` if the path is missing or the value isn't a string. Paths
ending in `.reference`, `.type`, `.identifier`, `.display` are **not**
auto-dereferenced — you get the `Reference` field directly.

```ts
t.ref("subject.reference"),   // "123" (from "Patient/123")
t.ref("subject"),             // same — accepts the Reference itself
```

### `t.coding(path, system)`

Scans an array of `{ system?, code? }` and returns the first code whose
`system` matches. Typed against `CodeableConcept.coding` shapes.

```ts
t.coding("code.coding", "http://loinc.org"),   // "1234-5" or null
```

### `t.valueOf(path, system)`

Same shape for `{ system?, value? }` arrays — `ContactPoint`, `Identifier`.

```ts
t.valueOf("telecom", "email"),   // "alice@example.com" or null
```

### `t.enum(path, table, fallback)`

Look up a string value in a plain object or `Map`. Returns `fallback` if the
key is missing.

```ts
t.enum("gender", { male: "M", female: "F" }, "U"),   // "M" | "F" | "U"
```

## Auto-dereferencing

This is the feature that makes `.transform()` more than a typed `.map()`.

Given an Encounter with `subject: Reference<Patient>`, writing
`subject.name.0.given.0` would normally be a type error — `Reference` has no
`name` field. But when you call `.include("patient")`, the builder widens the
scope: `subject` becomes `Reference<Patient> | Patient`, so **both**
`subject.reference` (the Reference side) and `subject.name.0.family` (the
Patient side) compile.

At runtime, `t` builds a lookup map from the bundle's `included[]` entries
keyed by `"ResourceType/id"`. When your path hits an activated reference
field and the next segment isn't a Reference structural field, `t` swaps
in the included resource and keeps walking.

```ts
// Server returns: { entry: [ { resource: encounter, search: { mode: "match" } },
//                            { resource: patient,   search: { mode: "include" } } ] }

.include("patient")
.transform((t) => ({
  refId:       t.ref("subject.reference"),          // reads Reference.reference → "123"
  displayText: t("subject.display", null),          // reads Reference.display → "Ada L."
  givenName:   t("subject.name.0.given.0", null),   // dereferences into Patient → "Ada"
}))
```

If the reference doesn't resolve (server dropped the include, reference
points outside the bundle), the path returns `undefined` and `t` falls back
to your default. **Never throws.**

## Array-flattening expressions

Some search-param expressions traverse arrays transparently —
`Encounter.participant.actor` maps each participant's actor. In paths,
you still spell out the index you want:

```ts
.include("practitioner")
.transform((t) => ({
  firstPractitioner: t("participant.0.actor.name.0.family", null),
  secondPractitioner: t("participant.1.actor.name.0.family", null),
}))
```

The type system accepts any numeric segment; it's your job to pick one
that exists in the response. Missing indices return `undefined` and fall
back — no throw.

## Paths that point at the Reference itself

When auto-dereferencing is active, the Reference object is still reachable
through its structural fields (`reference`, `type`, `identifier`, `display`).
This lets you read both sides from the same builder:

```ts
.include("patient")
.transform((t) => ({
  patientId:   t.ref("subject.reference"),    // "123"
  refType:     t("subject.type", null),       // "Patient"
  display:     t("subject.display", null),    // "Ada Lovelace"
  familyName:  t("subject.name.0.family", null),  // auto-dereferences → "Lovelace"
}))
```

## Extending `t` with custom helpers

`t` is open for extension via declaration merging. Register an
implementation, then augment the `TExtensions<Scope>` interface so
TypeScript knows the helper exists:

```ts
import { registerTHelper } from "@fhir-dsl/core";

declare module "@fhir-dsl/core" {
  interface TExtensions<Scope> {
    age(path: Path<Scope>): number | null;
  }
}

registerTHelper("age", (ctx, ...args) => {
  const dob = ctx.walk(args[0] as string);
  if (typeof dob !== "string") return null;
  return new Date().getFullYear() - Number.parseInt(dob.slice(0, 4), 10);
});
```

Now every `t` closure has `t.age(path)`. `ctx.walk(path)` gives you the
same dereferencing machinery `t(path, ...)` uses — use it to read paths
through your helper.

Use `unregisterTHelper(name)` to remove a helper — useful for scoped tests.

## `execute()` vs `stream()`

`.transform()` returns a `TransformedQuery<Out>` with two terminals:

```ts
// All rows at once
const { data, total, link, raw } = await builder.transform(fn).execute();

// One row at a time
for await (const row of builder.transform(fn).stream()) {
  // row is Out
}
```

`stream()` yields rows as the underlying bundle pages are produced, so
large result sets don't need to sit in memory all at once.

## Hand-authored schemas

Auto-dereferencing is driven by the generator-emitted `includeExpressions`
map on your schema. If you're hand-writing a `FhirSchema`, add
`includeExpressions: Record<string, never>` to opt out of dereferencing —
`.transform()` still works, it just treats references as plain `Reference`
values without bundle lookups.

## When not to use `.transform()`

- **You need the full FHIR resource.** Use `.execute()` with typed
  includes — `SearchResult<Primary, Included>` gives you `data[]` and
  `included[]` separately.
- **The projection depends on external data** (e.g. joining a non-FHIR
  table). `.transform()` only sees the bundle — do the join after.
- **You want validation.** `.transform()` skips Standard Schema
  validation; chain `.validate()` before `.transform()` if you need it.

## Edge cases

- **Included resource missing from the bundle.** Path returns `undefined`,
  `t` returns the fallback. Servers sometimes drop includes for permissions
  or filtering — don't rely on presence.
- **`urn:uuid:` references.** Skipped; they don't participate in the
  `"ResourceType/id"` lookup scheme. The Reference fields are still readable
  via `t.ref` / `t("subject.reference", ...)`.
- **Multi-expression search params** (e.g. `Encounter.subject | Encounter.patient`).
  Both expressions activate in the scope and the runtime matches either
  at walk time.
- **Unparseable FHIRPath expressions** (`extension("url").value.as(Reference)`).
  The generator skips these and logs a warning — `.include()` still works,
  but the target field isn't auto-dereferenced. You can still read the
  `Reference` side normally.

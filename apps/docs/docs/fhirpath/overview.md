---
id: overview
title: FHIRPath Expression Builder
sidebar_label: Overview
---

# FHIRPath Expression Builder

`@fhir-dsl/fhirpath` provides a type-safe FHIRPath expression builder for TypeScript. Navigate FHIR resources with property access, build FHIRPath strings, and evaluate expressions -- all with full autocomplete and compile-time type safety.

## Installation

```bash
npm install @fhir-dsl/fhirpath
```

## Quick Start

```typescript
import { fhirpath } from "@fhir-dsl/fhirpath";
import type { Patient } from "./fhir/r4";

// Type-safe path navigation with autocomplete at every step
const expr = fhirpath<Patient>("Patient").name.family;
expr.compile();              // "Patient.name.family"
expr.evaluate(somePatient);  // ["Smith", "Doe"]
```

## Expression Predicates

Use callback expressions with `$this` for filtering, existence checks, and projections:

```typescript
// where() with expression predicate
fhirpath<Patient>("Patient")
  .name.where($this => $this.use.eq("official"))
  .family.compile();
// "Patient.name.where($this.use = 'official').family"

// Backward compatible simple form
fhirpath<Patient>("Patient")
  .name.where("use", "official")
  .family.compile();
// "Patient.name.where(use = 'official').family"

// exists() with criteria
fhirpath<Patient>("Patient")
  .name.exists($this => $this.use.eq("official"))
  .compile();
// "Patient.name.exists($this.use = 'official')"

// all() -- true if all items match
fhirpath<Patient>("Patient")
  .name.all($this => $this.family.exists())
  .compile();
// "Patient.name.all($this.family.exists())"

// select() -- project each element
fhirpath<Patient>("Patient")
  .name.select($this => $this.family)
  .compile();
// "Patient.name.select($this.family)"
```

## Comparison & Boolean Operators

Available inside expression predicates:

```typescript
// Comparison operators: eq, neq, lt, gt, lte, gte
$this.value.gt(100)        // $this.value > 100
$this.status.neq("draft")  // $this.status != 'draft'

// Boolean operators: and, or, xor, not, implies
$this.use.eq("official").and($this.family.exists())
$this.active.not()
```

## Collection Operations

### Subsetting

```typescript
fp.name.first()       // First element
fp.name.last()        // Last element
fp.name.single()      // Exactly one element (throws if > 1)
fp.name.tail()        // All but first
fp.name.skip(2)       // Skip first 2
fp.name.take(3)       // Take first 3
```

### Existence & Filtering

```typescript
fp.name.count()       // Number of elements
fp.name.exists()      // Non-empty?
fp.name.empty()       // Empty?
fp.name.distinct()    // Remove duplicates
fp.name.isDistinct()  // All values unique?
fp.name.allTrue()     // All items are true?
fp.name.anyTrue()     // Any item is true?
fp.name.allFalse()    // All items are false?
fp.name.anyFalse()    // Any item is false?
```

### Combining

```typescript
fp.name.union(otherExpr)     // Merge + deduplicate
fp.name.combine(otherExpr)   // Merge with duplicates
fp.name.intersect(otherExpr) // Elements in both
fp.name.exclude(otherExpr)   // Elements not in other
```

## String Functions

```typescript
fp.name.family.upper()                    // Uppercase
fp.name.family.lower()                    // Lowercase
fp.name.family.length()                   // String length
fp.name.family.startsWith("Sm")           // Starts with prefix?
fp.name.family.endsWith("th")             // Ends with suffix?
fp.name.family.contains("mit")            // Contains substring?
fp.name.family.indexOf("mi")              // Index of substring
fp.name.family.substring(0, 3)            // Extract substring
fp.name.family.replace("Smith", "Jones")  // Replace text
fp.name.family.matches("^S.*h$")          // Regex match
fp.name.family.replaceMatches("[aeiou]", "*")  // Regex replace
fp.name.family.toChars()                  // Split to characters
```

## Math Functions

```typescript
fp.valueQuantity.value.abs()       // Absolute value
fp.valueQuantity.value.ceiling()   // Round up
fp.valueQuantity.value.floor()     // Round down
fp.valueQuantity.value.round(2)    // Round to precision
fp.valueQuantity.value.truncate()  // Truncate to integer
fp.valueQuantity.value.sqrt()      // Square root
fp.valueQuantity.value.power(3)    // Raise to power
fp.valueQuantity.value.ln()        // Natural logarithm
fp.valueQuantity.value.log(10)     // Log with base
fp.valueQuantity.value.exp()       // e^x
```

## Conversion Functions

```typescript
fp.active.toBoolean()          // Convert to boolean
fp.active.toInteger()          // Convert to integer
fp.active.toDecimal()          // Convert to decimal
fp.active.toFhirString()       // Convert to string (FHIRPath toString)
fp.birthDate.toDate()          // Convert to date
fp.birthDate.toDateTime()      // Convert to dateTime
fp.active.convertsToBoolean()  // Can convert to boolean?
fp.active.convertsToInteger()  // Can convert to integer?
// ... and more convertsTo* variants
```

:::info
`toFhirString()` maps to FHIRPath's `toString()` function. The JS `toString()` method returns the compiled path string for serialization.
:::

## Type Narrowing with ofType()

Filter collections by FHIR type -- critical for polymorphic `value[x]` fields:

```typescript
fhirpath<Observation>("Observation")
  .value.ofType("Quantity").value
  .compile();
// "Observation.value.ofType(Quantity).value"
```

The `FhirTypeMap` interface is extensible via declaration merging to add your own types.

## Utility Functions

```typescript
fp.name.trace("debug")   // Debug trace (returns input unchanged)
fp.now()                  // Current dateTime
fp.today()                // Current date
fp.timeOfDay()            // Current time
fp.name.children()        // Immediate children
fp.name.descendants()     // All descendants
```

## Conditional: iif()

```typescript
fp.name.first().iif(
  $this => $this.use.eq("official"),  // criterion
  $this => $this.family,               // true result
  $this => $this.given,                // otherwise result
).compile();
// "Patient.name.first().iif($this.use = 'official', $this.family, $this.given)"
```

## Recursive Navigation: repeat()

```typescript
fhirpath<Organization>("Organization")
  .repeat($this => $this.partOf)
  .compile();
// "Organization.repeat($this.partOf)"
```

## FHIRPath Spec Coverage

The package implements approximately 85% of the [official FHIRPath specification](https://hl7.org/fhirpath/):

| Category | Functions | Status |
|---|---|---|
| Navigation | Property access, children, descendants | Implemented |
| Filtering | where, select, repeat, ofType | Implemented |
| Existence | exists, all, allTrue/anyTrue/allFalse/anyFalse, count, empty, distinct, isDistinct | Implemented |
| Subsetting | first, last, single, tail, skip, take, intersect, exclude | Implemented |
| Combining | union, combine | Implemented |
| String | indexOf, substring, startsWith, endsWith, contains, upper, lower, replace, matches, replaceMatches, length, toChars | Implemented |
| Math | abs, ceiling, exp, floor, ln, log, power, round, sqrt, truncate | Implemented |
| Conversion | toBoolean, toInteger, toDecimal, toString, toDate, toDateTime, toTime, toQuantity, convertsTo* | Implemented |
| Operators | `=`, `!=`, `<`, `>`, `<=`, `>=`, and, or, xor, not, implies, is, as | Implemented |
| Utility | trace, now, today, timeOfDay, iif | Implemented |
| Aggregate | aggregate() | Not yet |
| Equality | ~ (equivalent), !~ (not equivalent) | Not yet |
| Arithmetic | +, -, *, /, mod, div (standalone operators) | Not yet |

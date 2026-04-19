/**
 * Structured representation of each FHIRPath operation step.
 *
 * A compiled expression is an ordered array of PathOp values.
 * The evaluator walks them left-to-right against a resource.
 */

// --- Compiled sub-expression (used by where, select, all, etc.) ---

export interface CompiledPredicate {
  ops: PathOp[];
  compiledPath: string;
}

// --- Navigation ---

export type NavOp = { type: "nav"; prop: string } | { type: "children" } | { type: "descendants" };

// --- Filtering & Existence ---

export type FilterOp =
  | { type: "where"; predicate: CompiledPredicate }
  | { type: "where_simple"; field: string; value: string }
  | { type: "select"; projection: CompiledPredicate }
  | { type: "repeat"; projection: CompiledPredicate }
  | { type: "ofType"; typeName: string }
  | { type: "exists" }
  | { type: "exists_predicate"; predicate: CompiledPredicate }
  | { type: "all"; predicate: CompiledPredicate }
  | { type: "allTrue" }
  | { type: "anyTrue" }
  | { type: "allFalse" }
  | { type: "anyFalse" }
  | { type: "count" }
  | { type: "empty" }
  | { type: "distinct" }
  | { type: "isDistinct" }
  | { type: "subsetOf"; other: CompiledPredicate }
  | { type: "supersetOf"; other: CompiledPredicate };

// --- Subsetting ---

export type SubsetOp =
  | { type: "first" }
  | { type: "last" }
  | { type: "single" }
  | { type: "tail" }
  | { type: "skip"; num: number }
  | { type: "take"; num: number }
  | { type: "intersect"; other: CompiledPredicate }
  | { type: "exclude"; other: CompiledPredicate };

// --- Combining ---

export type CombineOp = { type: "union"; other: CompiledPredicate } | { type: "combine"; other: CompiledPredicate };

// --- String ---

export type StringOp =
  | { type: "indexOf"; substring: string }
  | { type: "substring"; start: number; length?: number }
  | { type: "startsWith"; prefix: string }
  | { type: "endsWith"; suffix: string }
  | { type: "str_contains"; substring: string }
  | { type: "upper" }
  | { type: "lower" }
  | { type: "replace"; pattern: string; substitution: string }
  | { type: "matches"; regex: string }
  | { type: "replaceMatches"; regex: string; substitution: string }
  | { type: "str_length" }
  | { type: "toChars" };

// --- Math ---

export type MathOp =
  | { type: "abs" }
  | { type: "ceiling" }
  | { type: "exp" }
  | { type: "floor" }
  | { type: "ln" }
  | { type: "log"; base: number }
  | { type: "power"; exponent: number }
  | { type: "round"; precision?: number }
  | { type: "sqrt" }
  | { type: "truncate" };

// --- Arithmetic (binary operators, §6.6) ---

export type ArithmeticOp =
  | { type: "add"; other: CompiledPredicate }
  | { type: "subtract"; other: CompiledPredicate }
  | { type: "multiply"; other: CompiledPredicate }
  | { type: "divide"; other: CompiledPredicate }
  | { type: "divTrunc"; other: CompiledPredicate }
  | { type: "mod"; other: CompiledPredicate }
  | { type: "concat"; other: CompiledPredicate };

// --- Conversion ---

export type ConversionOp =
  | { type: "toBoolean" }
  | { type: "toInteger" }
  | { type: "toDecimal" }
  | { type: "toFhirString" }
  | { type: "toDate" }
  | { type: "toDateTime" }
  | { type: "toTime" }
  | { type: "toQuantity"; unit?: string }
  | { type: "convertsToBoolean" }
  | { type: "convertsToInteger" }
  | { type: "convertsToDecimal" }
  | { type: "convertsToString" }
  | { type: "convertsToDate" }
  | { type: "convertsToDateTime" }
  | { type: "convertsToTime" }
  | { type: "convertsToQuantity" };

// --- Utility ---

export type UtilityOp =
  | { type: "trace"; name: string }
  | { type: "now" }
  | { type: "timeOfDay" }
  | { type: "today" }
  | { type: "iif"; criterion: CompiledPredicate; trueResult: CompiledPredicate; otherwiseResult?: CompiledPredicate };

// --- Operators (used inside predicate expressions) ---

export type OperatorOp =
  | { type: "eq"; value: unknown }
  | { type: "neq"; value: unknown }
  | { type: "lt"; value: unknown }
  | { type: "gt"; value: unknown }
  | { type: "lte"; value: unknown }
  | { type: "gte"; value: unknown }
  | { type: "and"; other: CompiledPredicate }
  | { type: "or"; other: CompiledPredicate }
  | { type: "xor"; other: CompiledPredicate }
  | { type: "not" }
  | { type: "implies"; other: CompiledPredicate }
  | { type: "is"; typeName: string }
  | { type: "as"; typeName: string };

// --- Literal (used in predicate expressions) ---

export type LiteralOp = { type: "literal"; value: unknown };

// --- Aggregates (§5.3) -----------------------------------------------------
//
// `aggregate(aggregator, init?)` walks the input collection and accumulates
// into `$total` (set to `init` or `{}` at the start, then the result of the
// aggregator after each iteration). `sum`/`min`/`max`/`avg` are STU-status
// numeric convenience aggregates.
export type AggregateOp =
  | { type: "aggregate"; aggregator: CompiledPredicate; init?: CompiledPredicate }
  | { type: "sum" }
  | { type: "min" }
  | { type: "max" }
  | { type: "avg" };

// --- FHIR-specific functions (§2.1.9 / FP.12) ---

export type FhirFnOp = { type: "hasValue" } | { type: "getValue" } | { type: "htmlChecks" } | { type: "resolve" };

// --- Environment / iteration variables (§5 intro / §9) ---

// `name` is the raw FHIRPath identifier including prefix: `%context`,
// `%resource`, `%rootResource`, `%ucum`, `$index`, `$total`, or any custom
// `%foo` supplied via the env bag. Lookup rules live in evaluator.ts.
export type VarOp = { type: "var"; name: string };

// --- Union of all ops ---

export type PathOp =
  | NavOp
  | FilterOp
  | SubsetOp
  | CombineOp
  | StringOp
  | MathOp
  | ArithmeticOp
  | ConversionOp
  | UtilityOp
  | OperatorOp
  | LiteralOp
  | VarOp
  | FhirFnOp
  | AggregateOp;

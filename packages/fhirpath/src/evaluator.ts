import { evalArithmetic } from "./eval/arithmetic.js";
import { evalCombining } from "./eval/combining.js";
import { evalConversion } from "./eval/conversion.js";
import { evalExistence } from "./eval/existence.js";
import { evalFiltering } from "./eval/filtering.js";
import { evalMath } from "./eval/math.js";
import { evalNav } from "./eval/nav.js";
import { evalOperator } from "./eval/operators.js";
import { evalString } from "./eval/strings.js";
import { evalSubsetting } from "./eval/subsetting.js";
import { type EvalContext, FhirPathEvaluationError, type IterationLocals } from "./eval/types.js";
import { evalUtility } from "./eval/utility.js";
import type { PathOp, VarOp } from "./ops.js";

export interface EvalOptions {
  /**
   * Strict mode raises `FhirPathEvaluationError` on multi-element
   * singleton-eval (§4.5) instead of returning `[]`. Default: false.
   */
  strict?: boolean;
  /**
   * Environment variable bag for `%foo` references (FP-VAR-010). Keys may be
   * supplied with or without the leading `%` — lookup tries both. Unknown
   * `%foo` references throw `FhirPathEvaluationError`.
   *
   * Built-in names (`%context`, `%resource`, `%rootResource`, `%ucum`) are
   * resolved from the evaluation context and do not require an env entry.
   */
  env?: Readonly<Record<string, unknown>>;
}

const UCUM_URI = "http://unitsofmeasure.org";

/**
 * Evaluate a sequence of FHIRPath operations against a resource.
 * Returns the resulting collection.
 */
export function evaluate(ops: PathOp[], resource: unknown, options?: EvalOptions): unknown[] {
  const ctx = buildEvalContext(resource, options);
  return runOps(ops, [resource], ctx);
}

function buildEvalContext(rootResource: unknown, options?: EvalOptions): EvalContext {
  const env = options?.env ?? {};
  const strict = options?.strict;
  const ctx: EvalContext = {
    rootResource,
    focus: rootResource,
    env,
    evaluateSub(innerOps, r, locals) {
      // Sub-evals re-focus on `r` (so and/or/xor right-hand eval sees the
      // current item), but preserve rootResource so %rootResource still
      // points at the original input.
      const subCtx: EvalContext = { ...ctx, focus: r };
      if (locals !== undefined) subCtx.iterationLocals = locals;
      return runOps(innerOps, [r], subCtx);
    },
    evaluateOps(innerOps, startCollection) {
      return runOps(innerOps, startCollection, ctx);
    },
    ...(strict !== undefined ? { strict } : {}),
  };
  return ctx;
}

function resolveVar(op: VarOp, ctx: EvalContext): unknown[] {
  const name = op.name;
  if (name === "$this") {
    // $this is handled by the predicate proxy at build time, but evaluate()
    // may still encounter a bare `{type:"var", name:"$this"}` — fall through
    // to a no-op (the current item is already the input collection).
    throw new FhirPathEvaluationError("$this is only valid inside a predicate; evaluate $this via the proxy");
  }
  if (name === "$index") {
    const locals: IterationLocals | undefined = ctx.iterationLocals;
    if (!locals) throw new FhirPathEvaluationError("$index is only defined inside where/select/repeat iteration");
    return [locals.index];
  }
  if (name === "$total") {
    const locals: IterationLocals | undefined = ctx.iterationLocals;
    if (!locals) throw new FhirPathEvaluationError("$total is only defined inside where/select/repeat iteration");
    return [locals.total];
  }
  // Built-in environment names.
  if (name === "%context" || name === "%resource" || name === "%rootResource") {
    return ctx.rootResource === undefined ? [] : [ctx.rootResource];
  }
  if (name === "%ucum") return [UCUM_URI];

  // User-supplied env bag. Accept both `%foo` and `foo` as keys for ergonomics.
  const stripped = name.startsWith("%") ? name.slice(1) : name;
  if (Object.hasOwn(ctx.env, name)) return wrap(ctx.env[name]);
  if (Object.hasOwn(ctx.env, stripped)) return wrap(ctx.env[stripped]);
  throw new FhirPathEvaluationError(`Undefined FHIRPath environment variable: ${name}`);
}

function wrap(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function runOps(ops: PathOp[], initial: unknown[], ctx: EvalContext): unknown[] {
  let collection = initial;
  for (const op of ops) {
    collection = dispatch(op, collection, ctx);
  }
  return collection;
}

function dispatch(op: PathOp, collection: unknown[], ctx: EvalContext): unknown[] {
  switch (op.type) {
    // --- Navigation ---
    case "nav":
    case "children":
    case "descendants":
      return evalNav(op, collection);

    // --- Filtering ---
    case "where":
    case "where_simple":
    case "select":
    case "repeat":
    case "ofType":
      return evalFiltering(op, collection, ctx);

    // --- Existence ---
    case "exists":
    case "exists_predicate":
    case "all":
    case "allTrue":
    case "anyTrue":
    case "allFalse":
    case "anyFalse":
    case "count":
    case "empty":
    case "distinct":
    case "isDistinct":
    case "subsetOf":
    case "supersetOf":
      return evalExistence(op, collection, ctx);

    // --- Subsetting ---
    case "first":
    case "last":
    case "single":
    case "tail":
    case "skip":
    case "take":
    case "intersect":
    case "exclude":
      return evalSubsetting(op, collection, ctx);

    // --- Combining ---
    case "union":
    case "combine":
      return evalCombining(op, collection, ctx);

    // --- String ---
    case "indexOf":
    case "substring":
    case "startsWith":
    case "endsWith":
    case "str_contains":
    case "upper":
    case "lower":
    case "replace":
    case "matches":
    case "replaceMatches":
    case "str_length":
    case "toChars":
      return evalString(op, collection);

    // --- Math ---
    case "abs":
    case "ceiling":
    case "exp":
    case "floor":
    case "ln":
    case "log":
    case "power":
    case "round":
    case "sqrt":
    case "truncate":
      return evalMath(op, collection);

    // --- Arithmetic (binary) ---
    case "add":
    case "subtract":
    case "multiply":
    case "divide":
    case "divTrunc":
    case "mod":
    case "concat":
      return evalArithmetic(op, collection, ctx);

    // --- Conversion ---
    case "toBoolean":
    case "toInteger":
    case "toDecimal":
    case "toFhirString":
    case "toDate":
    case "toDateTime":
    case "toTime":
    case "toQuantity":
    case "convertsToBoolean":
    case "convertsToInteger":
    case "convertsToDecimal":
    case "convertsToString":
    case "convertsToDate":
    case "convertsToDateTime":
    case "convertsToTime":
    case "convertsToQuantity":
      return evalConversion(op, collection);

    // --- Utility ---
    case "trace":
    case "now":
    case "timeOfDay":
    case "today":
    case "iif":
      return evalUtility(op, collection, ctx);

    // --- Operators ---
    case "eq":
    case "neq":
    case "lt":
    case "gt":
    case "lte":
    case "gte":
    case "and":
    case "or":
    case "xor":
    case "not":
    case "implies":
    case "is":
    case "as":
      return evalOperator(op, collection, ctx);

    // --- Literal ---
    case "literal":
      return [op.value];

    // --- Environment / iteration variables ---
    case "var":
      return resolveVar(op, ctx);
  }
}

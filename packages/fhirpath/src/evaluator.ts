import { evalCombining } from "./eval/combining.js";
import { evalConversion } from "./eval/conversion.js";
import { evalExistence } from "./eval/existence.js";
import { evalFiltering } from "./eval/filtering.js";
import { evalMath } from "./eval/math.js";
import { evalNav } from "./eval/nav.js";
import { evalOperator } from "./eval/operators.js";
import { evalString } from "./eval/strings.js";
import { evalSubsetting } from "./eval/subsetting.js";
import type { EvalContext } from "./eval/types.js";
import { evalUtility } from "./eval/utility.js";
import type { PathOp } from "./ops.js";

/**
 * Evaluate a sequence of FHIRPath operations against a resource.
 * Returns the resulting collection.
 */
export function evaluate(ops: PathOp[], resource: unknown): unknown[] {
  const ctx: EvalContext = {
    rootResource: resource,
    evaluateSub: evaluate,
    evaluateOps: (innerOps, startCollection) => runOps(innerOps, startCollection, ctx),
  };
  return runOps(ops, [resource], ctx);
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
  }
}

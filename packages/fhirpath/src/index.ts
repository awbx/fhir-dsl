export {
  $context,
  $index,
  $resource,
  $rootResource,
  $total,
  $ucum,
  envVar,
  fhirpath,
} from "./builder.js";
export { FhirPathEvaluationError } from "./eval/types.js";
export { type EvalOptions, evaluate } from "./evaluator.js";
export { createPredicateProxy, extractPredicate, PREDICATE_SYMBOL } from "./expression.js";
export type {
  ArithmeticOp,
  CombineOp,
  CompiledPredicate,
  ConversionOp,
  FhirFnOp,
  FilterOp,
  LiteralOp,
  MathOp,
  NavOp,
  OperatorOp,
  PathOp,
  StringOp,
  SubsetOp,
  UtilityOp,
  VarOp,
} from "./ops.js";
export type {
  FhirPathExpr,
  FhirPathOps,
  FhirPathPredicate,
  FhirPathResource,
  FhirTypeMap,
  IsPrimitive,
  NavKeys,
  PredicateOps,
  Unwrap,
} from "./types.js";

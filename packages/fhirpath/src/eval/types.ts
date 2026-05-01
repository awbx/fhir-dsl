import { FhirDslError } from "@fhir-dsl/utils";
import type { PathOp } from "../ops.js";

export interface IterationLocals {
  index: number;
  /**
   * `$total` carries different meanings depending on the iteration frame:
   * in `where`/`select`/`repeat` it is the size of the iterated collection
   * (a number); in `aggregate` it is the running accumulator (any value or
   * collection). `resolveVar` wraps it via FHIRPath collection semantics.
   */
  total: unknown;
}

/** Context passed to eval modules for recursive evaluation */
export interface EvalContext {
  /** The outermost resource — what `%rootResource` resolves to. Preserved
   *  across sub-evaluations so references from inside nested where/select
   *  predicates still see the original input. */
  rootResource: unknown;
  /** The starting resource for the current evaluation frame. Operators
   *  whose right-hand subexpressions are re-rooted against the current item
   *  (and/or/xor/implies, comparison-operand fetches) read from here. Reset
   *  on each sub-evaluation. This is what `%context` and `%resource`
   *  resolve to in the absence of a Bundle. */
  focus: unknown;
  /** User-supplied `%foo` env bag from evaluate({env}). Lookup strips the `%`. */
  env: Readonly<Record<string, unknown>>;
  /** `$index` / `$total` for the current where/select iteration, if any. */
  iterationLocals?: IterationLocals;
  /** Run `ops` with a single-item starting collection `[resource]`. If
   *  `locals` is supplied, they override the context's iterationLocals for
   *  the duration of the sub-evaluation (used by where/select). */
  evaluateSub: (ops: PathOp[], resource: unknown, locals?: IterationLocals) => unknown[];
  /** Run `ops` with an explicit starting collection. Required by operators
   * whose subexpressions operate on the focus as a whole (iif criterion,
   * where the spec says the criterion is evaluated on the input collection
   * rather than per-element). */
  evaluateOps: (ops: PathOp[], startCollection: unknown[]) => unknown[];
  /** Strict mode (§4.5): multi-element singleton-eval throws instead of
   *  silently returning `[]`. Default false (matches HAPI/fhirpath.js/Firely). */
  strict?: boolean;
  /** Optional reference resolver for `resolve()` outside a Bundle frame.
   *  Receives the canonical reference string (e.g. `"Patient/123"` or a
   *  full URL) and returns the target resource if it can be looked up
   *  synchronously, otherwise `undefined`. Issue #52. */
  resolveReference?: (reference: string) => unknown;
  /** Terminology resolvers for `conformsTo`, `memberOf`, `subsumes`,
   *  `subsumedBy`. Each method is independently optional — missing
   *  methods cause `FhirPathEvaluationError` when reached. Issue #52. */
  terminology?: TerminologyResolver;
}

/**
 * Synchronous terminology hooks consumed by FHIRPath terminology
 * functions. Callers that need network-bound terminology lookups should
 * pre-resolve into a local cache and expose it through these methods.
 *
 * `coding` may be a Coding, a CodeableConcept, or a `code` string.
 * `a`/`b` for subsumption are Codings or `code` strings.
 */
export interface TerminologyResolver {
  conformsTo?: (resource: unknown, profileUrl: string) => boolean;
  memberOf?: (coding: unknown, valueSetUrl: string) => boolean;
  subsumes?: (a: unknown, b: unknown) => boolean;
  subsumedBy?: (a: unknown, b: unknown) => boolean;
}

/** Thrown when strict-mode evaluation detects a spec violation. */
export class FhirPathEvaluationError extends FhirDslError<"fhirpath.evaluation", undefined> {
  readonly kind = "fhirpath.evaluation" as const;
  constructor(message: string) {
    super(message, undefined);
  }
}

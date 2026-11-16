import type { Expr } from "./ast.js";
import { FhirPathLexerError } from "./lexer.js";
import { FhirPathParseError, parseExpression } from "./parser.js";

// Parse cache for invariant expressions (#58). Generated validator schemas
// pass invariant *definitions* to `validateInvariants` on every call, so
// without a cache each validate() re-lexes and re-parses every invariant of
// every element. The AST depends only on the expression string, so that is
// the key. Parse failures are cached too, so an expression outside the
// supported subset is not re-parsed each time it is reported.
//
// The cache stores the underlying lexer/parse error, not the per-definition
// `FhirPathInvariantCompileError`: two definitions may share an expression
// under different keys, and each must still be reported with its own key.
//
// Cached ASTs are shared between callers, so they are frozen. The evaluator
// only reads AST nodes.

export type ParseOutcome =
  | { readonly ok: true; readonly ast: Expr }
  | { readonly ok: false; readonly error: FhirPathParseError | FhirPathLexerError };

/**
 * Upper bound on cached expressions. The full R4 core set has roughly 200
 * distinct invariant expressions, so generated schemas fit comfortably; the
 * bound only matters for callers that feed dynamic expressions.
 */
export const INVARIANT_CACHE_MAX = 1000;

// Eviction is FIFO: a Map iterates in insertion order, so the first key is
// the oldest entry. LRU (re-inserting on every hit) measured 10-20% slower on
// the hot path, and with the bound well above the generated set an evicted
// expression only costs one re-parse.
const cache = new Map<string, ParseOutcome>();

export function parseCached(expression: string): ParseOutcome {
  const hit = cache.get(expression);
  if (hit !== undefined) return hit;
  let outcome: ParseOutcome;
  try {
    outcome = { ok: true, ast: deepFreeze(parseExpression(expression)) };
  } catch (err) {
    // Anything other than a lexer/parse error is a bug, not a property of the
    // expression: let it propagate and do not cache it.
    if (!(err instanceof FhirPathParseError || err instanceof FhirPathLexerError)) throw err;
    outcome = { ok: false, error: err };
  }
  if (cache.size >= INVARIANT_CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(expression, outcome);
  return outcome;
}

/** Number of cached expressions. Internal; exposed for tests. */
export function invariantCacheSize(): number {
  return cache.size;
}

/** Whether an expression is currently cached. Internal; exposed for tests. */
export function isInvariantCached(expression: string): boolean {
  return cache.has(expression);
}

/** Drop every cached expression. Internal; exposed for tests. */
export function clearInvariantCache(): void {
  cache.clear();
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

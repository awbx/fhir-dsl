import { FhirDslError } from "@fhir-dsl/utils";
import type { Expr } from "./ast.js";
import { parseCached } from "./cache.js";
import { evaluateExpr, FhirPathInvariantEvalError } from "./evaluator.js";

// Phase 6 — public surface for the FHIR invariant subset of FHIRPath.
//
// Typical use:
//   const inv = compileInvariant({ key: "pat-1", expression: "name.exists()", severity: "error", human: "..." });
//   const result = inv.check(patient);
//   if (!result.passed) console.warn(result.message);
//
// The module also exposes `validateInvariants(resource, invariants)` which
// returns OperationOutcome-shaped issues, suitable for surfacing through
// the existing `@fhir-dsl/runtime` error channels.
//
// Parsed expressions are cached by expression string (see ./cache.ts), so
// passing the same definitions on every call does not re-parse them.

export interface InvariantDefinition {
  /** `ElementDefinition.constraint.key` (e.g. `pat-1`). */
  key: string;
  /** FHIRPath expression — must evaluate to a boolean. */
  expression: string;
  /** `error` or `warning` per the spec. */
  severity: "error" | "warning";
  /** Human-readable description; used as the OperationOutcome `diagnostics`. */
  human: string;
  /** Optional FHIRPath element where the invariant is anchored. */
  source?: string | undefined;
}

export interface CompiledInvariant {
  definition: InvariantDefinition;
  /** Parsed expression. Shared through the parse cache and frozen: do not mutate. */
  ast: Expr;
  /**
   * Evaluate the invariant against a resource. Returns:
   * - `passed: true` when the expression yields `true`,
   * - `passed: false` when the expression yields `false`, with a populated message,
   * - `passed: "indeterminate"` when the expression evaluates to empty (FHIRPath's null).
   */
  check(resource: unknown): InvariantResult;
}

export interface InvariantResult {
  passed: boolean | "indeterminate";
  key: string;
  severity: "error" | "warning";
  message: string;
}

export interface InvariantIssue {
  severity: "error" | "warning";
  code: "invariant";
  diagnostics: string;
  expression: string[];
  details: { text: string };
}

export interface OperationOutcome {
  resourceType: "OperationOutcome";
  issue: InvariantIssue[];
}

export function compileInvariant(definition: InvariantDefinition): CompiledInvariant {
  const parsed = parseCached(definition.expression);
  if (!parsed.ok) {
    throw new FhirPathInvariantCompileError(compileErrorMessage(definition, parsed.error), definition);
  }
  const { ast } = parsed;
  return {
    definition,
    ast,
    check: (resource) => checkAst(ast, definition, resource),
  };
}

export function validateInvariants(
  resource: unknown,
  invariants: readonly (CompiledInvariant | InvariantDefinition)[],
): OperationOutcome {
  const issues: InvariantIssue[] = [];
  for (const inv of invariants) {
    let definition: InvariantDefinition;
    let result: InvariantResult;
    if ("ast" in inv) {
      definition = inv.definition;
      result = inv.check(resource);
    } else {
      definition = inv;
      // Definitions go straight through the parse cache rather than
      // `compileInvariant`, so the hot path allocates no wrapper or error.
      const parsed = parseCached(definition.expression);
      if (!parsed.ok) {
        // An expression outside the supported subset must not crash validation
        // of the resource: report it the same way as an indeterminate result.
        issues.push({
          severity: "warning",
          code: "invariant",
          diagnostics: `${definition.key} could not be evaluated against this resource`,
          expression: [definition.expression],
          details: { text: compileErrorMessage(definition, parsed.error) },
        });
        continue;
      }
      result = checkAst(parsed.ast, definition, resource);
    }
    if (result.passed === false) {
      issues.push({
        severity: result.severity,
        code: "invariant",
        diagnostics: definition.human,
        expression: [definition.expression],
        details: { text: `${definition.key}: ${definition.human}` },
      });
    } else if (result.passed === "indeterminate") {
      // We surface indeterminate results as warnings — they signal an
      // expression couldn't be evaluated, which is rarely silent in FHIR
      // tooling.
      issues.push({
        severity: "warning",
        code: "invariant",
        diagnostics: `${definition.key} could not be evaluated against this resource`,
        expression: [definition.expression],
        details: { text: result.message },
      });
    }
  }
  return { resourceType: "OperationOutcome", issue: issues };
}

function checkAst(ast: Expr, definition: InvariantDefinition, resource: unknown): InvariantResult {
  try {
    const result = evaluateExpr(ast, { this: [resource], resource });
    if (result.length === 0) {
      return {
        passed: "indeterminate",
        key: definition.key,
        severity: definition.severity,
        message: `${definition.key}: ${definition.human}`,
      };
    }
    const passed = result[0] === true;
    return {
      passed,
      key: definition.key,
      severity: definition.severity,
      message: passed ? `${definition.key}: ok` : `${definition.key}: ${definition.human}`,
    };
  } catch (err) {
    if (err instanceof FhirPathInvariantEvalError) {
      return {
        passed: "indeterminate",
        key: definition.key,
        severity: definition.severity,
        message: `${definition.key}: evaluation error — ${err.message}`,
      };
    }
    throw err;
  }
}

function compileErrorMessage(definition: InvariantDefinition, err: Error): string {
  return `failed to compile ${definition.key}: ${err.message}`;
}

export class FhirPathInvariantCompileError extends FhirDslError<
  "fhirpath.invariant_compile",
  { definition: InvariantDefinition }
> {
  readonly kind = "fhirpath.invariant_compile" as const;
  readonly definition: InvariantDefinition;
  constructor(message: string, definition: InvariantDefinition) {
    super(message, { definition });
    this.definition = definition;
  }
}

export type { Expr } from "./ast.js";
export { parseExpression } from "./parser.js";

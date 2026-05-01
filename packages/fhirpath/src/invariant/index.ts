import { FhirDslError } from "@fhir-dsl/utils";
import type { Expr } from "./ast.js";
import { evaluateExpr, FhirPathInvariantEvalError } from "./evaluator.js";
import { FhirPathParseError, parseExpression } from "./parser.js";

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
  let ast: Expr;
  try {
    ast = parseExpression(definition.expression);
  } catch (err) {
    if (err instanceof FhirPathParseError) {
      throw new FhirPathInvariantCompileError(`failed to compile ${definition.key}: ${err.message}`, definition);
    }
    throw err;
  }
  return {
    definition,
    ast,
    check(resource) {
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
        const value = result[0];
        const passed = value === true;
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
    },
  };
}

export function validateInvariants(
  resource: unknown,
  invariants: readonly (CompiledInvariant | InvariantDefinition)[],
): OperationOutcome {
  const issues: InvariantIssue[] = [];
  for (const inv of invariants) {
    const compiled = "ast" in inv ? inv : compileInvariant(inv);
    const result = compiled.check(resource);
    if (result.passed === false) {
      issues.push({
        severity: result.severity,
        code: "invariant",
        diagnostics: compiled.definition.human,
        expression: [compiled.definition.expression],
        details: { text: `${compiled.definition.key}: ${compiled.definition.human}` },
      });
    } else if (result.passed === "indeterminate") {
      // We surface indeterminate results as warnings — they signal an
      // expression couldn't be evaluated, which is rarely silent in FHIR
      // tooling.
      issues.push({
        severity: "warning",
        code: "invariant",
        diagnostics: `${compiled.definition.key} could not be evaluated against this resource`,
        expression: [compiled.definition.expression],
        details: { text: result.message },
      });
    }
  }
  return { resourceType: "OperationOutcome", issue: issues };
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

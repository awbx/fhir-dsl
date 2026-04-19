import { assertModifierApplies } from "./modifier-validation.js";

// FHIR prefixes go on the value (date=gt2020). Modifiers go on the name (family:exact=Smith).
export const PREFIX_OPS: ReadonlySet<string> = new Set(["gt", "ge", "lt", "le", "sa", "eb", "ap", "ne"]);

export const MODIFIER_OPS: ReadonlySet<string> = new Set([
  "exact",
  "contains",
  "not",
  "of-type",
  "in",
  "not-in",
  "text",
  "above",
  "below",
  "identifier",
  "code-text",
  "missing",
  "iterate",
]);

// paramName enables modifier-applicability validation per §3.2.1.5.5 (BUG-025).
// Callers that lack the name (internal re-emit paths) can omit it; unknown names
// skip validation.
export function classifyOp(op: string, paramName?: string): { prefix?: string; modifier?: string } {
  if (op === "eq") return {};
  if (PREFIX_OPS.has(op)) return { prefix: op };
  if (MODIFIER_OPS.has(op)) {
    if (paramName !== undefined) assertModifierApplies(paramName, op);
    return { modifier: op };
  }
  return { prefix: op };
}

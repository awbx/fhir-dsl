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

export function classifyOp(op: string): { prefix?: string; modifier?: string } {
  if (op === "eq") return {};
  if (PREFIX_OPS.has(op)) return { prefix: op };
  if (MODIFIER_OPS.has(op)) return { modifier: op };
  return { prefix: op };
}

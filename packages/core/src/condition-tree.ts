import { escapeSearchValue } from "./_internal/escape-search-value.js";
import { classifyOp } from "./_internal/op-classifier.js";
import type { CompiledSearchParam } from "./compiled-query.js";
import { type Condition, type ConditionGroup, type ConditionTuple, isConditionGroup } from "./where-builder.js";

/**
 * Compiles a Condition tree into one or more `CompiledSearchParam`s.
 *
 * Routing:
 *   1. AND of all-tuples → one param per tuple (FHIR's implicit AND).
 *   2. OR of all-tuples sharing one param-name + all `eq` → one comma-joined param.
 *   3. Otherwise → a single `_filter=<FHIRPath expr>` param.
 */
export function compileConditionTree<SP>(root: Condition<SP>): CompiledSearchParam[] {
  const node: ConditionGroup<SP> = isConditionGroup(root) ? root : { type: "and", conditions: [root] };

  if (node.type === "and" && node.conditions.every((c) => !isConditionGroup(c))) {
    return (node.conditions as ReadonlyArray<ConditionTuple<SP>>).map(tupleToParam);
  }

  if (node.type === "or" && node.conditions.every((c) => !isConditionGroup(c))) {
    const tuples = node.conditions as ReadonlyArray<ConditionTuple<SP>>;
    if (tuples.length > 0) {
      const [firstName, firstOp] = tuples[0]!;
      const allSameNameAndEq = tuples.every(([name, op]) => name === firstName && op === "eq");
      if (allSameNameAndEq && firstOp === "eq") {
        // §3.2.1.5.7: escape separator chars in each OR value before joining on `,`.
        return [
          {
            name: firstName as string,
            value: tuples.map(([, , v]) => escapeSearchValue(v as string | number)).join(","),
          },
        ];
      }
    }
  }

  return [{ name: "_filter", value: emitFilter(node) }];
}

function tupleToParam<SP>(tuple: ConditionTuple<SP>): CompiledSearchParam {
  const [name, op, value] = tuple;
  return { name: name as string, ...classifyOp(op as string), value: value as string | number };
}

// --- _filter expression emitter (FHIRPath-like) ---

const FILTER_OP_MAP: Readonly<Record<string, string>> = {
  eq: "eq",
  ne: "ne",
  gt: "gt",
  ge: "ge",
  lt: "lt",
  le: "le",
  sa: "sa",
  eb: "eb",
  ap: "ap",
  contains: "co",
  not: "ne",
  in: "in",
  "not-in": "ni",
};

const FILTER_UNSUPPORTED_OPS: ReadonlySet<string> = new Set([
  "exact",
  "above",
  "below",
  "of-type",
  "text",
  "identifier",
  "code-text",
  "missing",
]);

function emitFilter<SP>(node: Condition<SP>, parentIsGroup = false): string {
  if (!isConditionGroup(node)) {
    return emitTuple(node);
  }
  const joiner = node.type === "and" ? " and " : " or ";
  const inner = node.conditions.map((c) => emitFilter(c, true)).join(joiner);
  return parentIsGroup && node.conditions.length > 1 ? `(${inner})` : inner;
}

function emitTuple<SP>(tuple: ConditionTuple<SP>): string {
  const [name, op, value] = tuple;
  const opStr = String(op);
  if (FILTER_UNSUPPORTED_OPS.has(opStr)) {
    throw new Error(
      `where(...): operator "${opStr}" cannot be expressed in FHIR _filter. Use the positional where(param, "${opStr}", value) form instead.`,
    );
  }
  const mapped = FILTER_OP_MAP[opStr];
  if (!mapped) {
    throw new Error(`where(...): unknown operator "${opStr}".`);
  }
  return `${String(name)} ${mapped} ${formatFilterValue(value)}`;
}

const DATE_PREFIX_RE = /^\d{4}(-\d{2}(-\d{2})?)?(T|$)/;

function formatFilterValue(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const s = String(value);
  if (DATE_PREFIX_RE.test(s)) return s;
  return `'${s.replaceAll("'", "''")}'`;
}

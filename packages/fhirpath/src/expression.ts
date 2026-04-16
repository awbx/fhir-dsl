/**
 * Expression system for FHIRPath predicate callbacks.
 *
 * Used inside where(), select(), all(), exists(criteria), iif(), etc.
 * The callback receives a `$this` proxy that captures navigation and
 * comparison ops into a CompiledPredicate.
 */

import type { CompiledPredicate, PathOp } from "./ops.js";

/** Symbol used to extract internal ops from a predicate proxy */
export const PREDICATE_SYMBOL = Symbol.for("fhirpath.predicate");

/** Extract a CompiledPredicate from a predicate proxy result */
export function extractPredicate(proxy: unknown): CompiledPredicate {
  if (proxy != null && typeof proxy === "object" && PREDICATE_SYMBOL in proxy) {
    return (proxy as Record<symbol, CompiledPredicate>)[PREDICATE_SYMBOL]!;
  }
  throw new Error("Expected a FHIRPath predicate expression");
}

/** Create a predicate proxy representing `$this` inside expression callbacks */
export function createPredicateProxy(path: string, ops: PathOp[]): unknown {
  const predicate: CompiledPredicate = { ops, compiledPath: path };

  return new Proxy({} as Record<string | symbol, unknown>, {
    has(_, prop) {
      if (prop === PREDICATE_SYMBOL) return true;
      return false;
    },
    get(_, prop) {
      // Hidden symbol for extraction
      if (prop === PREDICATE_SYMBOL) return predicate;

      // Symbols
      if (typeof prop === "symbol") {
        if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag) return () => path;
        return undefined;
      }

      // Prevent thenable detection
      if (prop === "then") return undefined;

      // Serialization
      if (prop === "toJSON" || prop === "toString") return () => path;

      // --- Comparison operators ---

      if (prop === "eq") {
        return (value: unknown) =>
          createPredicateProxy(`${path} = ${formatValue(value)}`, [...ops, { type: "eq", value: resolveValue(value) }]);
      }
      if (prop === "neq") {
        return (value: unknown) =>
          createPredicateProxy(`${path} != ${formatValue(value)}`, [
            ...ops,
            { type: "neq", value: resolveValue(value) },
          ]);
      }
      if (prop === "lt") {
        return (value: unknown) =>
          createPredicateProxy(`${path} < ${formatValue(value)}`, [...ops, { type: "lt", value: resolveValue(value) }]);
      }
      if (prop === "gt") {
        return (value: unknown) =>
          createPredicateProxy(`${path} > ${formatValue(value)}`, [...ops, { type: "gt", value: resolveValue(value) }]);
      }
      if (prop === "lte") {
        return (value: unknown) =>
          createPredicateProxy(`${path} <= ${formatValue(value)}`, [
            ...ops,
            { type: "lte", value: resolveValue(value) },
          ]);
      }
      if (prop === "gte") {
        return (value: unknown) =>
          createPredicateProxy(`${path} >= ${formatValue(value)}`, [
            ...ops,
            { type: "gte", value: resolveValue(value) },
          ]);
      }

      // --- Boolean operators ---

      if (prop === "and") {
        return (other: unknown) => {
          const otherPred = extractPredicate(other);
          return createPredicateProxy(`${path} and ${otherPred.compiledPath}`, [
            ...ops,
            { type: "and", other: otherPred },
          ]);
        };
      }
      if (prop === "or") {
        return (other: unknown) => {
          const otherPred = extractPredicate(other);
          return createPredicateProxy(`${path} or ${otherPred.compiledPath}`, [
            ...ops,
            { type: "or", other: otherPred },
          ]);
        };
      }
      if (prop === "xor") {
        return (other: unknown) => {
          const otherPred = extractPredicate(other);
          return createPredicateProxy(`${path} xor ${otherPred.compiledPath}`, [
            ...ops,
            { type: "xor", other: otherPred },
          ]);
        };
      }
      if (prop === "not") {
        return () => createPredicateProxy(`${path}.not()`, [...ops, { type: "not" }]);
      }
      if (prop === "implies") {
        return (other: unknown) => {
          const otherPred = extractPredicate(other);
          return createPredicateProxy(`${path} implies ${otherPred.compiledPath}`, [
            ...ops,
            { type: "implies", other: otherPred },
          ]);
        };
      }

      // --- String functions on predicates ---

      if (prop === "contains") {
        return (substring: string) =>
          createPredicateProxy(`${path}.contains('${substring}')`, [...ops, { type: "str_contains", substring }]);
      }
      if (prop === "startsWith") {
        return (prefix: string) =>
          createPredicateProxy(`${path}.startsWith('${prefix}')`, [...ops, { type: "startsWith", prefix }]);
      }
      if (prop === "endsWith") {
        return (suffix: string) =>
          createPredicateProxy(`${path}.endsWith('${suffix}')`, [...ops, { type: "endsWith", suffix }]);
      }
      if (prop === "matches") {
        return (regex: string) =>
          createPredicateProxy(`${path}.matches('${regex}')`, [...ops, { type: "matches", regex }]);
      }

      // --- Existence functions on predicates ---

      if (prop === "exists") {
        return () => createPredicateProxy(`${path}.exists()`, [...ops, { type: "exists" }]);
      }
      if (prop === "empty") {
        return () => createPredicateProxy(`${path}.empty()`, [...ops, { type: "empty" }]);
      }
      if (prop === "count") {
        return () => createPredicateProxy(`${path}.count()`, [...ops, { type: "count" }]);
      }

      // --- Type operators ---

      if (prop === "is") {
        return (typeName: string) => createPredicateProxy(`${path} is ${typeName}`, [...ops, { type: "is", typeName }]);
      }
      if (prop === "as") {
        return (typeName: string) => createPredicateProxy(`${path} as ${typeName}`, [...ops, { type: "as", typeName }]);
      }

      // --- Property navigation (default) ---
      return createPredicateProxy(`${path}.${prop}`, [...ops, { type: "nav", prop }]);
    },
  });
}

function resolveValue(value: unknown): unknown {
  if (value != null && typeof value === "object" && PREDICATE_SYMBOL in value) {
    return extractPredicate(value);
  }
  return value;
}

function formatValue(value: unknown): string {
  if (value != null && typeof value === "object" && PREDICATE_SYMBOL in value) {
    return extractPredicate(value).compiledPath;
  }
  if (typeof value === "string") return `'${value}'`;
  return String(value);
}

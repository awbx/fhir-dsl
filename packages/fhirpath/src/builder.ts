import { evaluate } from "./evaluator.js";
import { createPredicateProxy, extractPredicate, PREDICATE_SYMBOL } from "./expression.js";
import type { CompiledPredicate, PathOp } from "./ops.js";
import type { FhirPathExpr, FhirPathResource } from "./types.js";

// --- Nullary functions: called with no arguments, return () => proxy ---

const NULLARY_FNS: Record<string, { opType: string; compile: (path: string) => string }> = {
  first: { opType: "first", compile: (p) => `${p}.first()` },
  last: { opType: "last", compile: (p) => `${p}.last()` },
  single: { opType: "single", compile: (p) => `${p}.single()` },
  tail: { opType: "tail", compile: (p) => `${p}.tail()` },
  distinct: { opType: "distinct", compile: (p) => `${p}.distinct()` },
  isDistinct: { opType: "isDistinct", compile: (p) => `${p}.isDistinct()` },
  allTrue: { opType: "allTrue", compile: (p) => `${p}.allTrue()` },
  anyTrue: { opType: "anyTrue", compile: (p) => `${p}.anyTrue()` },
  allFalse: { opType: "allFalse", compile: (p) => `${p}.allFalse()` },
  anyFalse: { opType: "anyFalse", compile: (p) => `${p}.anyFalse()` },
  upper: { opType: "upper", compile: (p) => `${p}.upper()` },
  lower: { opType: "lower", compile: (p) => `${p}.lower()` },
  toChars: { opType: "toChars", compile: (p) => `${p}.toChars()` },
  abs: { opType: "abs", compile: (p) => `${p}.abs()` },
  ceiling: { opType: "ceiling", compile: (p) => `${p}.ceiling()` },
  exp: { opType: "exp", compile: (p) => `${p}.exp()` },
  floor: { opType: "floor", compile: (p) => `${p}.floor()` },
  ln: { opType: "ln", compile: (p) => `${p}.ln()` },
  sqrt: { opType: "sqrt", compile: (p) => `${p}.sqrt()` },
  truncate: { opType: "truncate", compile: (p) => `${p}.truncate()` },
  toBoolean: { opType: "toBoolean", compile: (p) => `${p}.toBoolean()` },
  toInteger: { opType: "toInteger", compile: (p) => `${p}.toInteger()` },
  toDecimal: { opType: "toDecimal", compile: (p) => `${p}.toDecimal()` },
  toDate: { opType: "toDate", compile: (p) => `${p}.toDate()` },
  toDateTime: { opType: "toDateTime", compile: (p) => `${p}.toDateTime()` },
  toTime: { opType: "toTime", compile: (p) => `${p}.toTime()` },
  convertsToBoolean: { opType: "convertsToBoolean", compile: (p) => `${p}.convertsToBoolean()` },
  convertsToInteger: { opType: "convertsToInteger", compile: (p) => `${p}.convertsToInteger()` },
  convertsToDecimal: { opType: "convertsToDecimal", compile: (p) => `${p}.convertsToDecimal()` },
  convertsToString: { opType: "convertsToString", compile: (p) => `${p}.convertsToString()` },
  convertsToDate: { opType: "convertsToDate", compile: (p) => `${p}.convertsToDate()` },
  convertsToDateTime: { opType: "convertsToDateTime", compile: (p) => `${p}.convertsToDateTime()` },
  convertsToTime: { opType: "convertsToTime", compile: (p) => `${p}.convertsToTime()` },
  convertsToQuantity: { opType: "convertsToQuantity", compile: (p) => `${p}.convertsToQuantity()` },
  not: { opType: "not", compile: (p) => `${p}.not()` },
  children: { opType: "children", compile: (p) => `${p}.children()` },
  descendants: { opType: "descendants", compile: (p) => `${p}.descendants()` },
};

function buildPredicate(callback: (proxy: unknown) => unknown): CompiledPredicate {
  const $this = createPredicateProxy("$this", []);
  const result = callback($this);
  return extractPredicate(result);
}

function exprFromOther(other: unknown): CompiledPredicate {
  if (other != null && typeof other === "object" && PREDICATE_SYMBOL in other) {
    return extractPredicate(other);
  }
  // It's a FhirPathExpr — extract via the hidden symbol on its proxy
  const compiled = (other as any).compile();
  const ops = (other as any)[Symbol.for("fhirpath.ops")];
  return { ops: ops ?? [], compiledPath: compiled ?? "" };
}

function createExprProxy<T>(path: string, ops: PathOp[]): FhirPathExpr<T> {
  return new Proxy({} as FhirPathExpr<T>, {
    get(_, prop) {
      // --- Symbols ---
      if (typeof prop === "symbol") {
        if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag) return () => path;
        if (prop === Symbol.for("fhirpath.ops")) return ops;
        if (prop === PREDICATE_SYMBOL) return { ops, compiledPath: path };
        return undefined;
      }

      // Prevent thenable detection
      if (prop === "then") return undefined;

      // Serialization
      if (prop === "toJSON" || prop === "toString") return () => path;

      // --- Core ops ---

      if (prop === "compile") return () => path;

      if (prop === "evaluate") return (resource: unknown) => evaluate(ops, resource);

      // --- Nullary functions ---

      if (prop in NULLARY_FNS) {
        const fn = NULLARY_FNS[prop]!;
        return () => createExprProxy(fn.compile(path), [...ops, { type: fn.opType } as PathOp]);
      }

      // --- where(field, value) or where(predicate) ---

      if (prop === "where") {
        return (...args: unknown[]) => {
          if (typeof args[0] === "function") {
            const pred = buildPredicate(args[0] as (p: unknown) => unknown);
            return createExprProxy(`${path}.where(${pred.compiledPath})`, [...ops, { type: "where", predicate: pred }]);
          }
          // Legacy: where(field, value)
          const field = args[0] as string;
          const value = args[1] as string;
          return createExprProxy(`${path}.where(${field} = '${value}')`, [
            ...ops,
            { type: "where_simple", field, value },
          ]);
        };
      }

      // --- exists() or exists(predicate) ---

      if (prop === "exists") {
        return (...args: unknown[]) => {
          if (args.length > 0 && typeof args[0] === "function") {
            const pred = buildPredicate(args[0] as (p: unknown) => unknown);
            return createExprProxy(`${path}.exists(${pred.compiledPath})`, [
              ...ops,
              { type: "exists_predicate", predicate: pred },
            ]);
          }
          return createExprProxy(`${path}.exists()`, [...ops, { type: "exists" }]);
        };
      }

      // --- all(predicate) ---

      if (prop === "all") {
        return (callback: (p: unknown) => unknown) => {
          const pred = buildPredicate(callback);
          return createExprProxy(`${path}.all(${pred.compiledPath})`, [...ops, { type: "all", predicate: pred }]);
        };
      }

      // --- select(projection) ---

      if (prop === "select") {
        return (callback: (p: unknown) => unknown) => {
          const pred = buildPredicate(callback);
          return createExprProxy(`${path}.select(${pred.compiledPath})`, [
            ...ops,
            { type: "select", projection: pred },
          ]);
        };
      }

      // --- repeat(projection) ---

      if (prop === "repeat") {
        return (callback: (p: unknown) => unknown) => {
          const pred = buildPredicate(callback);
          return createExprProxy(`${path}.repeat(${pred.compiledPath})`, [
            ...ops,
            { type: "repeat", projection: pred },
          ]);
        };
      }

      // --- count / empty ---

      if (prop === "count") return () => createExprProxy(`${path}.count()`, [...ops, { type: "count" }]);
      if (prop === "empty") return () => createExprProxy(`${path}.empty()`, [...ops, { type: "empty" }]);

      // --- ofType(type) ---

      if (prop === "ofType") {
        return (typeName: string) =>
          createExprProxy(`${path}.ofType(${typeName})`, [...ops, { type: "ofType", typeName }]);
      }

      // --- Collection ops that take another expression ---

      if (prop === "union" || prop === "combine" || prop === "intersect" || prop === "exclude") {
        return (other: unknown) => {
          const otherPred = exprFromOther(other);
          return createExprProxy(`${path}.${prop}(${otherPred.compiledPath})`, [
            ...ops,
            { type: prop, other: otherPred },
          ]);
        };
      }

      if (prop === "subsetOf" || prop === "supersetOf") {
        return (other: unknown) => {
          const otherPred = exprFromOther(other);
          return createExprProxy(`${path}.${prop}(${otherPred.compiledPath})`, [
            ...ops,
            { type: prop, other: otherPred },
          ]);
        };
      }

      // --- Numeric parameter functions ---

      if (prop === "skip") {
        return (num: number) => createExprProxy(`${path}.skip(${num})`, [...ops, { type: "skip", num }]);
      }
      if (prop === "take") {
        return (num: number) => createExprProxy(`${path}.take(${num})`, [...ops, { type: "take", num }]);
      }

      // --- String functions ---

      if (prop === "indexOf") {
        return (substring: string) =>
          createExprProxy(`${path}.indexOf('${substring}')`, [...ops, { type: "indexOf", substring }]);
      }
      if (prop === "substring") {
        return (start: number, length?: number) => {
          const compiled = length != null ? `${path}.substring(${start}, ${length})` : `${path}.substring(${start})`;
          const op =
            length != null ? { type: "substring" as const, start, length } : { type: "substring" as const, start };
          return createExprProxy(compiled, [...ops, op]);
        };
      }
      if (prop === "startsWith") {
        return (prefix: string) =>
          createExprProxy(`${path}.startsWith('${prefix}')`, [...ops, { type: "startsWith", prefix }]);
      }
      if (prop === "endsWith") {
        return (suffix: string) =>
          createExprProxy(`${path}.endsWith('${suffix}')`, [...ops, { type: "endsWith", suffix }]);
      }
      if (prop === "contains") {
        return (substring: string) =>
          createExprProxy(`${path}.contains('${substring}')`, [...ops, { type: "str_contains", substring }]);
      }
      if (prop === "matches") {
        return (regex: string) => createExprProxy(`${path}.matches('${regex}')`, [...ops, { type: "matches", regex }]);
      }
      if (prop === "replace") {
        return (pattern: string, substitution: string) =>
          createExprProxy(`${path}.replace('${pattern}', '${substitution}')`, [
            ...ops,
            { type: "replace", pattern, substitution },
          ]);
      }
      if (prop === "replaceMatches") {
        return (regex: string, substitution: string) =>
          createExprProxy(`${path}.replaceMatches('${regex}', '${substitution}')`, [
            ...ops,
            { type: "replaceMatches", regex, substitution },
          ]);
      }
      if (prop === "length") {
        return () => createExprProxy(`${path}.length()`, [...ops, { type: "str_length" }]);
      }

      // --- Math with params ---

      if (prop === "log") {
        return (base: number) => createExprProxy(`${path}.log(${base})`, [...ops, { type: "log", base }]);
      }
      if (prop === "power") {
        return (exponent: number) =>
          createExprProxy(`${path}.power(${exponent})`, [...ops, { type: "power", exponent }]);
      }
      if (prop === "round") {
        return (precision?: number) => {
          const compiled = precision != null ? `${path}.round(${precision})` : `${path}.round()`;
          const op = precision != null ? { type: "round" as const, precision } : { type: "round" as const };
          return createExprProxy(compiled, [...ops, op]);
        };
      }

      // --- Conversion with params ---

      if (prop === "toQuantity") {
        return (unit?: string) => {
          const compiled = unit != null ? `${path}.toQuantity('${unit}')` : `${path}.toQuantity()`;
          const op = unit != null ? { type: "toQuantity" as const, unit } : { type: "toQuantity" as const };
          return createExprProxy(compiled, [...ops, op]);
        };
      }

      // --- toFhirString (maps to FHIRPath toString()) ---

      if (prop === "toFhirString") {
        return () => createExprProxy(`${path}.toString()`, [...ops, { type: "toFhirString" }]);
      }

      // --- trace ---

      if (prop === "trace") {
        return (name: string) => createExprProxy(`${path}.trace('${name}')`, [...ops, { type: "trace", name }]);
      }

      // --- iif ---

      if (prop === "iif") {
        return (
          criterionCb: (p: unknown) => unknown,
          trueResultCb: (p: unknown) => unknown,
          otherwiseResultCb?: (p: unknown) => unknown,
        ) => {
          const criterion = buildPredicate(criterionCb);
          const trueResult = buildPredicate(trueResultCb);
          const otherwiseResult = otherwiseResultCb ? buildPredicate(otherwiseResultCb) : undefined;

          const otherwisePart = otherwiseResult ? `, ${otherwiseResult.compiledPath}` : "";
          const op = otherwiseResult
            ? { type: "iif" as const, criterion, trueResult, otherwiseResult }
            : { type: "iif" as const, criterion, trueResult };
          return createExprProxy(`${path}.iif(${criterion.compiledPath}, ${trueResult.compiledPath}${otherwisePart})`, [
            ...ops,
            op,
          ]);
        };
      }

      // --- now / timeOfDay / today (standalone-ish but chained) ---

      if (prop === "now") return () => createExprProxy("now()", [{ type: "now" }]);
      if (prop === "timeOfDay") return () => createExprProxy("timeOfDay()", [{ type: "timeOfDay" }]);
      if (prop === "today") return () => createExprProxy("today()", [{ type: "today" }]);

      // --- Property navigation (default for any non-method key) ---
      return createExprProxy(`${path}.${prop}`, [...ops, { type: "nav", prop }]);
    },
  });
}

/**
 * Create a type-safe FHIRPath expression builder for a FHIR resource type.
 *
 * @example
 * ```typescript
 * import type { Patient } from "./fhir/r4";
 *
 * const expr = fhirpath<Patient>("Patient").name.family;
 * expr.compile()              // "Patient.name.family"
 * expr.evaluate(somePatient)  // ["Smith", "Doe"]
 *
 * // Expression predicates:
 * fhirpath<Patient>("Patient")
 *   .name.where($this => $this.use.eq("official")).family
 * ```
 */
export function fhirpath<T extends FhirPathResource>(resourceType: string): FhirPathExpr<T> {
  return createExprProxy<T>(resourceType, []);
}

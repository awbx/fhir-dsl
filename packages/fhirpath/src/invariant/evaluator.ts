import { FhirDslError } from "@fhir-dsl/utils";
import type { Expr } from "./ast.js";
import { isOfType, lookupProperty, normaliseTypeName } from "./fhir-types.js";

// Phase 6 — evaluator for the parsed FHIRPath invariant AST. FHIRPath is
// a *collection* language: every expression returns a list, and a
// boolean expression is "true" when its singleton value is `true`.
// We mirror that semantics: paths flatten into arrays, scalar
// comparisons operate on singletons, and operators that need a boolean
// from a multi-value collection follow FHIRPath's "Boolean evaluation"
// rule (empty → empty, non-empty non-boolean → error).

export type Collection = unknown[];

export interface EvalContext {
  /** The implicit `this` collection (root resource, or `$this` inside calls). */
  this: Collection;
  /**
   * The value the invariant was evaluated against — `%context`. It is also
   * `%resource` / `%rootResource` when it is a resource; for a datatype or
   * backbone element the enclosing resource is unknown, so those throw.
   */
  resource: unknown;
}

export class FhirPathInvariantEvalError extends FhirDslError<"fhirpath.invariant_eval", undefined> {
  readonly kind = "fhirpath.invariant_eval" as const;
  constructor(message?: string) {
    super(message ?? "FHIRPath invariant evaluation error", undefined);
  }
}

export function evaluateExpr(expr: Expr, ctx: EvalContext): Collection {
  switch (expr.kind) {
    case "literal":
      return expr.value === null ? [] : [expr.value];
    case "this":
      return ctx.this;
    case "ident":
      return navigate(ctx.this, expr.name);
    case "member":
      return navigate(evaluateExpr(expr.left, ctx), expr.name);
    case "index": {
      const base = evaluateExpr(expr.left, ctx);
      const idx = evaluateExpr(expr.index, ctx);
      const n = singletonNumber(idx);
      if (n === null || n < 0 || n >= base.length) return [];
      return [base[n]];
    }
    case "env":
      return evalEnv(expr.name, ctx);
    case "typeop":
      return evalTypeOp(expr.op, evaluateExpr(expr.left, ctx), expr.type);
    case "unary":
      return evalUnary(expr, ctx);
    case "binary":
      return evalBinary(expr, ctx);
    case "call":
      return evalCall(expr, ctx);
  }
}

const ENV_CONSTANTS: Readonly<Record<string, string>> = {
  ucum: "http://unitsofmeasure.org",
  sct: "http://snomed.info/sct",
  loinc: "http://loinc.org",
};

function evalEnv(name: string, ctx: EvalContext): Collection {
  if (name === "context") return ctx.resource == null ? [] : [ctx.resource];
  if (name === "resource" || name === "rootResource") {
    const r = ctx.resource;
    if (r != null && typeof r === "object" && typeof (r as Record<string, unknown>).resourceType === "string") {
      return [r];
    }
    throw new FhirPathInvariantEvalError(`%${name} is unknown when validating an element outside its resource`);
  }
  const constant = ENV_CONSTANTS[name];
  if (constant !== undefined) return [constant];
  throw new FhirPathInvariantEvalError(`unsupported environment variable: %${name}`);
}

function typeTest(item: unknown, type: string): boolean {
  const result = isOfType(item, normaliseTypeName(type));
  if (result === undefined) throw new FhirPathInvariantEvalError(`cannot determine whether value is ${type}`);
  return result;
}

function evalTypeOp(op: "is" | "as", subject: Collection, type: string): Collection {
  if (subject.length === 0) return [];
  if (op === "is") {
    if (subject.length > 1) throw new FhirPathInvariantEvalError("'is' requires a singleton");
    return [typeTest(subject[0], type)];
  }
  return subject.filter((item) => typeTest(item, type));
}

// The type argument of `is(T)` / `as(T)` / `ofType(T)` is a type name, not an expression.
function typeArg(expr: Extract<Expr, { kind: "call" }>): string {
  const arg = expr.args[0];
  if (arg?.kind === "ident") return arg.name;
  if (arg?.kind === "member" && arg.left.kind === "ident") return `${arg.left.name}.${arg.name}`;
  throw new FhirPathInvariantEvalError(`${expr.name}() expects a type name`);
}

function distinct(c: Collection): Collection {
  const out: Collection = [];
  for (const item of c) if (!out.some((v) => sameValue(v, item))) out.push(item);
  return out;
}

function evalUnary(expr: Extract<Expr, { kind: "unary" }>, ctx: EvalContext): Collection {
  if (expr.op === "not") {
    const inner = evaluateExpr(expr.arg, ctx);
    const b = toBooleanCollection(inner);
    if (b === null) return [];
    return [!b];
  }
  // Numeric negation
  const inner = evaluateExpr(expr.arg, ctx);
  const n = singletonNumber(inner);
  if (n === null) return [];
  return [-n];
}

function evalBinary(expr: Extract<Expr, { kind: "binary" }>, ctx: EvalContext): Collection {
  switch (expr.op) {
    case "and":
    case "or":
    case "xor":
    case "implies": {
      const l = toBooleanCollection(evaluateExpr(expr.left, ctx));
      const r = toBooleanCollection(evaluateExpr(expr.right, ctx));
      return [applyBoolean(expr.op, l, r)].filter((v) => v !== null) as Collection;
    }
    case "=":
    case "!=":
    case "~":
    case "!~": {
      const l = evaluateExpr(expr.left, ctx);
      const r = evaluateExpr(expr.right, ctx);
      if (l.length === 0 || r.length === 0) return [];
      const eq = collectionsEqual(l, r);
      const same = expr.op === "~" || expr.op === "!~" ? collectionsEquivalent(l, r) : eq;
      const result = expr.op === "=" || expr.op === "~" ? same : !same;
      return [result];
    }
    case "<":
    case ">":
    case "<=":
    case ">=": {
      const l = evaluateExpr(expr.left, ctx);
      const r = evaluateExpr(expr.right, ctx);
      const ln = singleton(l);
      const rn = singleton(r);
      if (ln === null || rn === null) return [];
      const result = compare(expr.op, ln, rn);
      return result === null ? [] : [result];
    }
    case "+": {
      const l = evaluateExpr(expr.left, ctx);
      const r = evaluateExpr(expr.right, ctx);
      const ls = singletonString(l);
      const rs = singletonString(r);
      if (ls !== null && rs !== null) return [ls + rs];
      const ln = singletonNumber(l);
      const rn = singletonNumber(r);
      if (ln === null || rn === null) return [];
      return [ln + rn];
    }
    case "-":
    case "*":
    case "/":
    case "div":
    case "mod": {
      const ln = singletonNumber(evaluateExpr(expr.left, ctx));
      const rn = singletonNumber(evaluateExpr(expr.right, ctx));
      if (ln === null || rn === null) return [];
      return [arithmetic(expr.op, ln, rn)];
    }
    case "&": {
      // String concatenation that treats empty as ''.
      const ls = singletonString(evaluateExpr(expr.left, ctx)) ?? "";
      const rs = singletonString(evaluateExpr(expr.right, ctx)) ?? "";
      return [ls + rs];
    }
    case "contains": {
      const l = evaluateExpr(expr.left, ctx);
      const r = evaluateExpr(expr.right, ctx);
      if (r.length === 0) return [];
      const item = r[0];
      return [l.some((v) => sameValue(v, item))];
    }
    case "|":
      return distinct([...evaluateExpr(expr.left, ctx), ...evaluateExpr(expr.right, ctx)]);
    case "in": {
      const l = evaluateExpr(expr.left, ctx);
      const r = evaluateExpr(expr.right, ctx);
      if (l.length === 0) return [];
      const item = l[0];
      return [r.some((v) => sameValue(v, item))];
    }
  }
}

function evalCall(expr: Extract<Expr, { kind: "call" }>, ctx: EvalContext): Collection {
  const subject = expr.left ? evaluateExpr(expr.left, ctx) : ctx.this;
  switch (expr.name) {
    case "exists":
      if (expr.args.length === 0) return [subject.length > 0];
      // `subject.exists(criteria)` filters by predicate, then asks "exists?"
      return [subject.some((item) => isTruthyPredicate(expr.args[0]!, { ...ctx, this: [item] }))];
    case "empty":
      return [subject.length === 0];
    case "count":
      return [subject.length];
    case "first":
      return subject.length === 0 ? [] : [subject[0]];
    case "last":
      return subject.length === 0 ? [] : [subject[subject.length - 1]];
    case "tail":
      return subject.slice(1);
    case "single":
      if (subject.length === 0) return [];
      if (subject.length > 1) throw new FhirPathInvariantEvalError("single() called on >1-element collection");
      return [subject[0]];
    case "hasValue":
      // Crude approximation of FHIR's Element.hasValue() — true if the
      // singleton is a primitive non-null/non-undefined value.
      return [subject.length === 1 && isPrimitive(subject[0])];
    case "matches": {
      const target = singletonString(subject);
      const pattern = singletonString(evaluateExpr(expr.args[0]!, ctx));
      if (target === null || pattern === null) return [];
      try {
        return [new RegExp(pattern).test(target)];
      } catch {
        return [false];
      }
    }
    case "where": {
      const out: Collection = [];
      for (const item of subject) {
        if (isTruthyPredicate(expr.args[0]!, { ...ctx, this: [item] })) out.push(item);
      }
      return out;
    }
    case "select": {
      const out: Collection = [];
      for (const item of subject) {
        const r = evaluateExpr(expr.args[0]!, { ...ctx, this: [item] });
        out.push(...r);
      }
      return out;
    }
    case "all": {
      if (expr.args.length === 0) {
        return [subject.every((item) => toBooleanCollection([item]) === true)];
      }
      return [subject.every((item) => isTruthyPredicate(expr.args[0]!, { ...ctx, this: [item] }))];
    }
    case "allTrue":
      return [subject.every((v) => v === true)];
    case "anyTrue":
      return [subject.some((v) => v === true)];
    case "not":
      // Method form: c.not()
      return [
        toBooleanCollection(subject) === false ? true : toBooleanCollection(subject) === true ? false : [],
      ].flat();
    case "toString": {
      const v = subject[0];
      if (v == null || subject.length === 0) return [];
      return [String(v)];
    }
    case "length": {
      const v = singletonString(subject);
      return v === null ? [] : [v.length];
    }
    case "contains": {
      const haystack = singletonString(subject);
      const needle = singletonString(evaluateExpr(expr.args[0]!, ctx));
      if (haystack === null || needle === null) return [];
      return [haystack.includes(needle)];
    }
    case "startsWith": {
      const haystack = singletonString(subject);
      const needle = singletonString(evaluateExpr(expr.args[0]!, ctx));
      if (haystack === null || needle === null) return [];
      return [haystack.startsWith(needle)];
    }
    case "endsWith": {
      const haystack = singletonString(subject);
      const needle = singletonString(evaluateExpr(expr.args[0]!, ctx));
      if (haystack === null || needle === null) return [];
      return [haystack.endsWith(needle)];
    }
    case "iif": {
      // iif(cond, then, else?) — evaluates lazily.
      const cond = toBooleanCollection(evaluateExpr(expr.args[0]!, ctx));
      if (cond === true) return evaluateExpr(expr.args[1]!, ctx);
      if (cond === false && expr.args[2]) return evaluateExpr(expr.args[2], ctx);
      return [];
    }
    case "is":
      return evalTypeOp("is", subject, typeArg(expr));
    case "as":
    case "ofType":
      return evalTypeOp("as", subject, typeArg(expr));
    case "union":
      return distinct([...subject, ...evaluateExpr(expr.args[0]!, ctx)]);
    case "combine":
      return [...subject, ...evaluateExpr(expr.args[0]!, ctx)];
    case "intersect": {
      const other = evaluateExpr(expr.args[0]!, ctx);
      return distinct(subject.filter((item) => other.some((v) => sameValue(v, item))));
    }
    case "exclude": {
      const other = evaluateExpr(expr.args[0]!, ctx);
      return subject.filter((item) => !other.some((v) => sameValue(v, item)));
    }
    case "isDistinct":
      return [distinct(subject).length === subject.length];
    case "subsetOf": {
      const other = evaluateExpr(expr.args[0]!, ctx);
      return [subject.every((item) => other.some((v) => sameValue(v, item)))];
    }
    case "supersetOf": {
      const other = evaluateExpr(expr.args[0]!, ctx);
      return [other.every((item) => subject.some((v) => sameValue(v, item)))];
    }
    case "trace":
      return subject;
    case "children":
      return navigateChildren(subject);
    case "descendants": {
      const out: Collection = [];
      const seen = new WeakSet<object>();
      let frontier = subject;
      while (frontier.length > 0) {
        const next = navigateChildren(frontier.filter((v) => v != null && typeof v === "object" && !seen.has(v)));
        for (const v of frontier) if (v != null && typeof v === "object") seen.add(v);
        out.push(...next);
        frontier = next;
      }
      return out;
    }
    case "toInteger": {
      const v = singleton(subject);
      if (typeof v === "number") return Number.isInteger(v) ? [v] : [];
      if (typeof v === "boolean") return [v ? 1 : 0];
      if (typeof v === "string" && /^[+-]?\d+$/.test(v)) return [Number(v)];
      return [];
    }
    case "substring": {
      const s = singletonString(subject);
      const start = singletonNumber(evaluateExpr(expr.args[0]!, ctx));
      if (s === null || start === null || start < 0 || start >= s.length) return [];
      if (!expr.args[1]) return [s.slice(start)];
      const len = singletonNumber(evaluateExpr(expr.args[1], ctx));
      return len === null ? [s.slice(start)] : [s.slice(start, start + Math.max(0, len))];
    }
    case "lower": {
      const s = singletonString(subject);
      return s === null ? [] : [s.toLowerCase()];
    }
    case "upper": {
      const s = singletonString(subject);
      return s === null ? [] : [s.toUpperCase()];
    }
    case "distinct": {
      const seen = new Set<string>();
      const out: Collection = [];
      for (const item of subject) {
        const key = JSON.stringify(item);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(item);
        }
      }
      return out;
    }
  }
  throw new FhirPathInvariantEvalError(`unsupported function: ${expr.name}`);
}

function isTruthyPredicate(arg: Expr, ctx: EvalContext): boolean {
  return toBooleanCollection(evaluateExpr(arg, ctx)) === true;
}

function navigateChildren(collection: Collection): Collection {
  const out: Collection = [];
  for (const item of collection) {
    if (item == null || typeof item !== "object") continue;
    for (const value of Object.values(item as Record<string, unknown>)) {
      if (value == null) continue;
      if (Array.isArray(value)) out.push(...value);
      else out.push(value);
    }
  }
  return out;
}

function navigate(collection: Collection, name: string): Collection {
  const out: Collection = [];
  for (const item of collection) {
    if (item == null) continue;
    if (typeof item !== "object") continue;
    // `value` reaches `valueQuantity` etc. (FHIR choice types).
    const value = lookupProperty(item as Record<string, unknown>, name);
    if (value == null) continue;
    if (Array.isArray(value)) out.push(...value);
    else out.push(value);
  }
  return out;
}

function singleton(c: Collection): unknown | null {
  if (c.length !== 1) return null;
  return c[0];
}

function singletonNumber(c: Collection): number | null {
  const v = singleton(c);
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

function singletonString(c: Collection): string | null {
  const v = singleton(c);
  if (typeof v === "string") return v;
  return null;
}

function isPrimitive(v: unknown): boolean {
  return v != null && (typeof v === "string" || typeof v === "number" || typeof v === "boolean");
}

function toBooleanCollection(c: Collection): boolean | null {
  if (c.length === 0) return null;
  if (c.length > 1) throw new FhirPathInvariantEvalError("expected boolean singleton, got multi-element collection");
  const v = c[0];
  if (typeof v === "boolean") return v;
  if (v == null) return null;
  // FHIRPath rule: a non-empty collection of non-boolean singletons is
  // truthy. We model that by mapping any other singleton to `true`.
  return true;
}

function applyBoolean(op: "and" | "or" | "xor" | "implies", l: boolean | null, r: boolean | null): boolean | null {
  // Three-valued logic per FHIRPath §6.5 truth tables.
  switch (op) {
    case "and":
      if (l === false || r === false) return false;
      if (l === null || r === null) return null;
      return l && r;
    case "or":
      if (l === true || r === true) return true;
      if (l === null || r === null) return null;
      return l || r;
    case "xor":
      if (l === null || r === null) return null;
      return l !== r;
    case "implies":
      if (l === false) return true;
      if (l === null) return r === true ? true : null;
      return r;
  }
}

function collectionsEqual(l: Collection, r: Collection): boolean {
  if (l.length !== r.length) return false;
  for (let i = 0; i < l.length; i++) {
    if (!sameValue(l[i], r[i])) return false;
  }
  return true;
}

function collectionsEquivalent(l: Collection, r: Collection): boolean {
  if (l.length !== r.length) return false;
  // Equivalence is order-insensitive for primitives — good enough for
  // FHIR invariants which compare scalars.
  const a = [...l].sort();
  const b = [...r].sort();
  for (let i = 0; i < a.length; i++) {
    if (!sameValue(a[i], b[i])) return false;
  }
  return true;
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  if (typeof a === "object" && typeof b === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

function compare(op: "<" | ">" | "<=" | ">=", l: unknown, r: unknown): boolean | null {
  if (typeof l === "number" && typeof r === "number") {
    switch (op) {
      case "<":
        return l < r;
      case ">":
        return l > r;
      case "<=":
        return l <= r;
      case ">=":
        return l >= r;
    }
  }
  if (typeof l === "string" && typeof r === "string") {
    const temporal = compareTemporal(l, r);
    if (temporal !== undefined) {
      if (temporal === null) return null;
      switch (op) {
        case "<":
          return temporal < 0;
        case ">":
          return temporal > 0;
        case "<=":
          return temporal <= 0;
        case ">=":
          return temporal >= 0;
      }
    }
    switch (op) {
      case "<":
        return l < r;
      case ">":
        return l > r;
      case "<=":
        return l <= r;
      case ">=":
        return l >= r;
    }
  }
  throw new FhirPathInvariantEvalError(`cannot compare ${typeof l} with ${typeof r}`);
}

// FHIR date / dateTime / instant: YYYY[-MM[-DD[Thh:mm[:ss[.sss]][Z|±hh:mm]]]].
const TEMPORAL = /^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)(Z|[+-]\d{2}:\d{2})?)?)?)?$/;

/**
 * Compare two FHIR date/dateTime strings per FHIRPath §5.4: compare at the
 * shared precision; if equal there but the precisions differ, the result is
 * unknown. Returns `undefined` when either side is not a date, `null` when
 * the order is unknown, otherwise a negative / zero / positive number.
 */
function compareTemporal(l: string, r: string): number | null | undefined {
  const a = TEMPORAL.exec(l);
  const b = TEMPORAL.exec(r);
  if (!a || !b) return undefined;
  const aHasTime = a[4] !== undefined;
  const bHasTime = b[4] !== undefined;
  if (aHasTime && bHasTime) {
    // Times without a zone can't be ordered against zoned ones.
    if ((a[5] === undefined) !== (b[5] === undefined)) return null;
    if (a[5] !== undefined) {
      const aSec = a[4]!.length > 5;
      const bSec = b[4]!.length > 5;
      if (aSec !== bSec) return null;
      return Date.parse(l) - Date.parse(r);
    }
    return l < r ? -1 : l > r ? 1 : 0;
  }
  // Date parts (year, month, day) at the shared precision.
  const aParts = [a[1], a[2], a[3]].filter((p) => p !== undefined);
  const bParts = [b[1], b[2], b[3]].filter((p) => p !== undefined);
  const shared = Math.min(aParts.length, bParts.length);
  for (let i = 0; i < shared; i++) {
    if (aParts[i]! !== bParts[i]!) return aParts[i]! < bParts[i]! ? -1 : 1;
  }
  if (aParts.length !== bParts.length || aHasTime !== bHasTime) return null;
  return 0;
}

function arithmetic(op: "+" | "-" | "*" | "/" | "div" | "mod", l: number, r: number): number {
  switch (op) {
    case "+":
      return l + r;
    case "-":
      return l - r;
    case "*":
      return l * r;
    case "/":
      return l / r;
    case "div":
      return Math.trunc(l / r);
    case "mod":
      return l % r;
  }
}

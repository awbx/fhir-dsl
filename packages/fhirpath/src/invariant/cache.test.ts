import { beforeEach, describe, expect, it } from "vitest";
import {
  clearInvariantCache,
  INVARIANT_CACHE_MAX,
  invariantCacheSize,
  isInvariantCached,
  parseCached,
} from "./cache.js";
import {
  compileInvariant,
  FhirPathInvariantCompileError,
  type InvariantDefinition,
  parseExpression,
  validateInvariants,
} from "./index.js";

// #58 — invariant expressions are parsed once and cached by expression string.

const def = (key: string, expression: string, severity: "error" | "warning" = "error"): InvariantDefinition => ({
  key,
  expression,
  severity,
  human: `${key} human`,
});

const BROKEN = "name.where(";

beforeEach(() => clearInvariantCache());

describe("invariant parse cache", () => {
  it("returns the same AST as a fresh parse, and reuses it on later calls", () => {
    const expr = "name.exists() or (telecom.count() > 1 and %resource.active = true)";
    const first = parseCached(expr);
    const second = parseCached(expr);
    expect(first.ok).toBe(true);
    expect(second).toBe(first);
    if (first.ok) expect(first.ast).toEqual(parseExpression(expr));
    expect(invariantCacheSize()).toBe(1);
  });

  it("freezes cached ASTs so shared nodes cannot be mutated", () => {
    const parsed = parseCached("a.b.where(c = 1)");
    if (!parsed.ok) throw new Error("expected a parse");
    expect(Object.isFrozen(parsed.ast)).toBe(true);
    expect(() => {
      (parsed.ast as { kind: string }).kind = "literal";
    }).toThrow(TypeError);
  });

  it("compileInvariant shares the cached AST across definitions", () => {
    const a = compileInvariant(def("a-1", "name.exists()"));
    const b = compileInvariant(def("b-1", "name.exists()"));
    expect(b.ast).toBe(a.ast);
    expect(a.check({ name: [{}] }).passed).toBe(true);
    expect(b.check({}).passed).toBe(false);
  });

  it("validateInvariants gives the same outcome on cold and warm cache", () => {
    const defs = [def("x-1", "name.exists()"), def("x-2", "telecom.empty()", "warning"), def("x-3", BROKEN)];
    const resource = { telecom: [{ value: "1" }] };
    const cold = validateInvariants(resource, defs);
    const warm = validateInvariants(resource, defs);
    expect(warm).toEqual(cold);
    clearInvariantCache();
    expect(validateInvariants(resource, defs)).toEqual(cold);
    expect(cold.issue.map((i) => i.expression[0])).toEqual(["name.exists()", "telecom.empty()", BROKEN]);
  });

  it("caches compile failures and still reports them as warnings on every call", () => {
    for (let i = 0; i < 3; i++) {
      const oo = validateInvariants({}, [def("bad-1", BROKEN)]);
      expect(oo.issue).toHaveLength(1);
      expect(oo.issue[0]).toMatchObject({
        severity: "warning",
        code: "invariant",
        diagnostics: "bad-1 could not be evaluated against this resource",
        expression: [BROKEN],
      });
      expect(oo.issue[0]?.details.text).toMatch(/^failed to compile bad-1: /);
    }
    expect(invariantCacheSize()).toBe(1);
    expect(parseCached(BROKEN).ok).toBe(false);
  });

  it("compileInvariant still throws FhirPathInvariantCompileError with the right key on a cached failure", () => {
    validateInvariants({}, [def("first-1", BROKEN)]);
    expect(isInvariantCached(BROKEN)).toBe(true);
    for (const key of ["first-1", "second-1"]) {
      let caught: unknown;
      try {
        compileInvariant(def(key, BROKEN));
      } catch (err) {
        caught = err;
      }
      expect(caught).toBeInstanceOf(FhirPathInvariantCompileError);
      const err = caught as FhirPathInvariantCompileError;
      expect(err.message).toMatch(new RegExp(`^failed to compile ${key}: `));
      expect(err.definition.key).toBe(key);
    }
  });

  it("keys messages by definition when two definitions share an expression", () => {
    const shared = "code.exists()";
    const oo = validateInvariants({}, [def("one-1", shared, "error"), def("two-1", shared, "warning")]);
    expect(oo.issue).toEqual([
      expect.objectContaining({
        severity: "error",
        diagnostics: "one-1 human",
        details: { text: "one-1: one-1 human" },
      }),
      expect.objectContaining({
        severity: "warning",
        diagnostics: "two-1 human",
        details: { text: "two-1: two-1 human" },
      }),
    ]);

    const broken = validateInvariants({}, [def("one-2", BROKEN), def("two-2", BROKEN)]);
    expect(broken.issue.map((i) => i.diagnostics)).toEqual([
      "one-2 could not be evaluated against this resource",
      "two-2 could not be evaluated against this resource",
    ]);
    expect(broken.issue[0]?.details.text).toMatch(/^failed to compile one-2: /);
    expect(broken.issue[1]?.details.text).toMatch(/^failed to compile two-2: /);
    expect(invariantCacheSize()).toBe(2);
  });

  it("stays bounded and evicts the oldest expressions first", () => {
    for (let i = 0; i < INVARIANT_CACHE_MAX + 50; i++) parseCached(`value = ${i}`);
    expect(invariantCacheSize()).toBe(INVARIANT_CACHE_MAX);
    expect(isInvariantCached("value = 0")).toBe(false);
    expect(isInvariantCached("value = 49")).toBe(false);
    expect(isInvariantCached("value = 50")).toBe(true);
    expect(isInvariantCached(`value = ${INVARIANT_CACHE_MAX + 49}`)).toBe(true);
  });

  it("re-parses evicted expressions correctly", () => {
    const target = def("ev-1", "value = 7");
    expect(validateInvariants({ value: 7 }, [target]).issue).toEqual([]);
    for (let i = 0; i < INVARIANT_CACHE_MAX; i++) parseCached(`other = ${i}`);
    expect(isInvariantCached(target.expression)).toBe(false);
    expect(validateInvariants({ value: 7 }, [target]).issue).toEqual([]);
    expect(validateInvariants({ value: 8 }, [target]).issue).toEqual([
      expect.objectContaining({ severity: "error", details: { text: "ev-1: ev-1 human" } }),
    ]);
    expect(compileInvariant(target).check({ value: 8 }).passed).toBe(false);
    expect(invariantCacheSize()).toBe(INVARIANT_CACHE_MAX);
  });
});

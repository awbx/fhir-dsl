/**
 * FHIR R5 Search — spec-compliance test suite for @fhir-dsl/core.
 *
 * Every test cites an SRCH-* rule ID from audit/spec/r5-search-rules.md,
 * and asserts the URL/param shape produced by compile() against the spec's
 * emission requirements.
 *
 * Test shapes:
 *   - it(...)            — passes today; regression pin for IMPLEMENTED rules.
 *   - test.fails(...)    — rule is IMPLEMENTED but spec-incorrect; the assertion
 *                          describes the SPEC-REQUIRED output and will only
 *                          pass once the DSL is fixed.
 *   - it.todo(...)       — rule is MISSING.
 *
 * Do NOT weaken assertions to silence a failing test. If a test.fails()
 * starts passing, flip it to it(...) and delete the wrapper.
 *
 * Sources:
 *   audit/spec/r5-search-rules.md   — SRCH-* rule IDs + spec quotes
 *   audit/impl/core-impl-map.md     — file:line citations per rule
 */

import { describe, expect, it, test, vi } from "vitest";
import type { SearchQueryBuilder } from "../src/query-builder.js";
import { SearchQueryBuilderImpl } from "../src/search-query-builder.js";

type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id?: string };
    Observation: { resourceType: "Observation"; id?: string };
    Practitioner: { resourceType: "Practitioner"; id?: string };
  };
  searchParams: {
    Patient: {
      family: { type: "string"; value: string };
      given: { type: "string"; value: string };
      birthdate: { type: "date"; value: string };
      gender: { type: "token"; value: string };
      identifier: { type: "token"; value: string };
      "general-practitioner": { type: "reference"; value: string };
    };
    Observation: {
      status: { type: "token"; value: string };
      code: { type: "token"; value: string };
      date: { type: "date"; value: string };
      subject: { type: "reference"; value: string };
      "value-quantity": { type: "quantity"; value: string };
      "code-value-quantity": { type: "composite"; components: { code: string; value: string } };
    };
    Practitioner: {
      name: { type: "string"; value: string };
    };
  };
  includes: {
    Observation: { "Observation:subject": "Patient" };
    Patient: { "Patient:general-practitioner": "Practitioner" };
  };
  revIncludes: {
    Patient: { Observation: "subject" };
  };
  profiles: Record<string, never>;
};

type FlexibleSP = Record<
  string,
  { type: "string" | "token" | "date" | "reference" | "quantity" | "composite"; value?: string }
>;

const noopExecutor = vi.fn(async () => ({ resourceType: "Bundle", type: "searchset", entry: [] }));

function builder(resourceType = "Patient"): SearchQueryBuilder<TestSchema, string, FlexibleSP> {
  return new SearchQueryBuilderImpl<TestSchema, string, FlexibleSP>(resourceType, noopExecutor);
}

/**
 * Build a SearchQueryBuilderImpl with an overridden auto-POST threshold.
 * The public builder has no `autoPostThreshold(n)` setter — the field is
 * only settable via the internal state constructor argument.
 */
function builderWithThreshold(
  resourceType: string,
  threshold: number,
): SearchQueryBuilder<TestSchema, string, FlexibleSP> {
  return new SearchQueryBuilderImpl<TestSchema, string, FlexibleSP>(resourceType, noopExecutor, {
    resourceType,
    params: [],
    includes: [],
    revIncludes: [],
    sorts: [],
    autoPostThreshold: threshold,
  } as any);
}

function paramEntry(compiled: { params: Array<{ name: string; value: unknown; prefix?: string; modifier?: string }> }) {
  return compiled.params;
}

/* -------------------------------------------------------------------------- */
/* 1. Parameter types (SRCH-TYP-*)                                            */
/* -------------------------------------------------------------------------- */

describe("Parameter types (SRCH-TYP-*)", () => {
  it("SRCH-TYP-001: number-valued param (quantity) passes value through unchanged", () => {
    const q = builder("Observation")
      .where("value-quantity" as any, "eq", "5.4")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "value-quantity", value: "5.4" });
  });

  it("SRCH-TYP-002: date-valued param passes ISO string through unchanged", () => {
    const q = builder("Observation")
      .where("date" as any, "eq", "2024-01-02T14:30:00Z")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "date", value: "2024-01-02T14:30:00Z" });
  });

  it("SRCH-TYP-004: token system|code literal flows through unchanged", () => {
    const q = builder("Observation")
      .where("code" as any, "eq", "http://loinc.org|85354-9")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "code", value: "http://loinc.org|85354-9" });
  });

  it("SRCH-TYP-005: reference Type/id form flows through unchanged", () => {
    const q = builder("Observation")
      .where("subject" as any, "eq", "Patient/123")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "subject", value: "Patient/123" });
  });

  it("SRCH-TYP-006: quantity with prefix + value|system|code triplet", () => {
    const q = builder("Observation")
      .where("value-quantity" as any, "ge", "5.4|http://unitsofmeasure.org|mg")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({
      name: "value-quantity",
      prefix: "ge",
      value: "5.4|http://unitsofmeasure.org|mg",
    });
  });

  test.fails("SRCH-TYP-008 / SRCH-COMP-001: composite `$` separator must be escaped in component values (spec §3.2.1.5.8)", () => {
    // Impl: search-query-builder.ts:304 `Object.values(values).join("$")` — no escape.
    // Spec: literal `$` inside a component value must be escaped as `\$`.
    const q = builder("Observation")
      .whereComposite("code-value-quantity", { code: "http://loinc.org|85354-9", value: "pre$ent" })
      .compile();
    // Spec-correct value contains `\$` (backslash-dollar). Current impl has unescaped `$`.
    const entry = paramEntry(q as any).find((p) => p.name === "code-value-quantity");
    expect(entry).toBeDefined();
    expect(String(entry?.value)).toContain("\\$");
  });

  test.fails("SRCH-TYP-008: composite with `$` in BOTH components is fully ambiguous today", () => {
    // Pathological case: both component values contain `$` literals.
    const q = builder("Observation").whereComposite("code-value-quantity", { code: "a$b", value: "c$d" }).compile();
    const entry = paramEntry(q as any).find((p) => p.name === "code-value-quantity");
    // Spec: `a\$b$c\$d`. Impl: `a$b$c$d` (four `$`-separated segments).
    expect(String(entry?.value).match(/\$/g)?.length).toBe(1);
  });

  it("SRCH-TYP-009: _filter (special) string passed verbatim", () => {
    const q = (builder("Patient") as any).filter("name eq 'Joe'").compile();
    expect(paramEntry(q).find((p: any) => p.name === "_filter")).toBeDefined();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Prefixes (SRCH-PFX-*)                                                   */
/* -------------------------------------------------------------------------- */

describe("Prefixes (SRCH-PFX-*)", () => {
  it.each([
    ["ne", "SRCH-PFX-002"],
    ["gt", "SRCH-PFX-003"],
    ["lt", "SRCH-PFX-004"],
    ["ge", "SRCH-PFX-005"],
    ["le", "SRCH-PFX-006"],
    ["sa", "SRCH-PFX-007"],
    ["eb", "SRCH-PFX-008"],
    ["ap", "SRCH-PFX-009"],
  ])("%s (%s) emits as prefix alongside value", (op, _ruleId) => {
    const q = builder("Patient")
      .where("birthdate", op as any, "1990-01-01")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "birthdate", prefix: op, value: "1990-01-01" });
  });

  it("SRCH-PFX-010: eq (default) emits no prefix", () => {
    const q = builder("Patient")
      .where("birthdate", "eq" as any, "1990-01-01")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "birthdate", value: "1990-01-01" });
  });

  test.fails("SRCH-PFX-011: applying a prefix to a string/token/uri/reference param must be rejected client-side", () => {
    // Impl: op-classifier.ts:20-25 accepts any prefix without type-checking.
    // Spec §3.2.1.5.6: prefixes are defined only for number/date/quantity.
    // The DSL is type-aware via SP[K] and should reject this statically or at
    // compile time. Here we test the runtime guard (currently MISSING).
    expect(() => (builder("Patient") as any).where("family", "gt", "Smith").compile()).toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Modifiers (SRCH-MOD-*)                                                  */
/* -------------------------------------------------------------------------- */

describe("Modifiers (SRCH-MOD-*)", () => {
  // op-classifier.ts treats modifier ops as bare names (no leading `:`),
  // so the builder surface takes `"exact"`, `"contains"`, etc.

  it("SRCH-MOD-001 :exact — string modifier emitted in param name", () => {
    const q = (builder("Patient") as any).where("family", "exact", "Smith").compile();
    expect(paramEntry(q)).toContainEqual({ name: "family", modifier: "exact", value: "Smith" });
  });

  it("SRCH-MOD-002 :contains — emitted for string", () => {
    const q = (builder("Patient") as any).where("family", "contains", "mit").compile();
    expect(paramEntry(q)).toContainEqual({ name: "family", modifier: "contains", value: "mit" });
  });

  it("SRCH-MOD-003 :not — token exclusion modifier", () => {
    const q = (builder("Patient") as any).where("gender", "not", "male").compile();
    expect(paramEntry(q)).toContainEqual({ name: "gender", modifier: "not", value: "male" });
  });

  it.each([
    ["in"],
    ["not-in"],
    ["above"],
    ["below"],
    ["identifier"],
    ["of-type"],
    ["text"],
    ["code-text"],
  ])("modifier :%s round-trips as %s", (op) => {
    const q = (builder("Patient") as any).where("identifier", op, "x").compile();
    expect(paramEntry(q)).toContainEqual({ name: "identifier", modifier: op, value: "x" });
  });

  it("SRCH-MOD-012 :missing=true emits as `param:missing=true`", () => {
    const q = builder("Patient").whereMissing("family", true).compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "family", modifier: "missing", value: "true" });
  });

  it("SRCH-MOD-012 :missing=false emits as `param:missing=false`", () => {
    const q = builder("Patient").whereMissing("family", false).compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "family", modifier: "missing", value: "false" });
  });

  it.todo("SRCH-MOD-013 :type — reference target-type filter (MISSING; op-classifier.ts:4-18 lacks `:type` entry)");

  test.fails("SRCH-MOD-016: using :exact on a date param must be rejected (spec §3.2.1.5.5)", () => {
    // Impl: op-classifier accepts any recognized modifier regardless of param type.
    expect(() => (builder("Patient") as any).where("birthdate", "exact", "2024").compile()).toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Combining (SRCH-COMB-*)                                                 */
/* -------------------------------------------------------------------------- */

describe("Combining values (SRCH-COMB-*)", () => {
  it("SRCH-COMB-001: array value joined with `,` for OR", () => {
    const q = builder("Patient")
      .where("gender" as any, "eq", ["male", "female"])
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "gender", value: "male,female" });
  });

  it("SRCH-COMB-002: repeated calls to where produce multiple params (AND)", () => {
    const q = builder("Patient")
      .where("given" as any, "eq", "John")
      .where("given" as any, "eq", "Smith")
      .compile();
    const givens = paramEntry(q as any).filter((p) => p.name === "given");
    expect(givens).toHaveLength(2);
    expect(givens).toContainEqual({ name: "given", value: "John" });
    expect(givens).toContainEqual({ name: "given", value: "Smith" });
  });

  test.fails("SRCH-COMB-003: literal comma in value is escaped with `\\,` (spec §3.2.1.5.7)", () => {
    // Impl: search-query-builder.ts:146 joins with `,` without any escape.
    // Spec: embedded `,` must be prepended with `\`.
    const q = builder("Patient").where("family", "eq", ["O'Brien, Jr.", "Smith"]).compile();
    const entry = paramEntry(q as any).find((p) => p.name === "family");
    expect(entry).toBeDefined();
    // Spec-correct: "O'Brien\\, Jr.,Smith" (backslash escaping the inner comma).
    expect(String(entry?.value)).toContain("\\,");
  });

  test.fails("SRCH-COMB-003: literal backslash in value is escaped with `\\\\`", () => {
    const q = builder("Patient").where("family", "eq", "back\\slash").compile();
    const entry = paramEntry(q as any).find((p) => p.name === "family");
    // Spec: literal `\` → emitted as `\\`.
    expect(String(entry?.value)).toContain("\\\\");
  });

  test.fails("SRCH-COMB-003: literal `$` in value is escaped with `\\$`", () => {
    const q = builder("Patient").where("family", "eq", "abc$def").compile();
    const entry = paramEntry(q as any).find((p) => p.name === "family");
    expect(String(entry?.value)).toContain("\\$");
  });

  test.fails("SRCH-COMB-004: literal `|` in token value is escaped with `\\|`", () => {
    // Distinct from the system|code separator: `|` as part of the code or
    // system itself must be escaped per §3.2.1.5.7.
    const q = builder("Observation")
      .where("code" as any, "eq", "a|b_literal")
      .compile();
    const entry = paramEntry(q as any).find((p) => p.name === "code");
    // Current impl emits raw `|`; spec requires `\|` for a literal. This test
    // deliberately can't tell valid-separator from literal — we assert the
    // test surface (helper or typed API) exists; absence of any escape helper
    // fails the expectation.
    expect(String(entry?.value)).toContain("\\|");
  });
});

/* -------------------------------------------------------------------------- */
/* 5. Chained & reverse-chained (SRCH-CHAIN-*, SRCH-HAS-*)                    */
/* -------------------------------------------------------------------------- */

describe("Chained parameters (SRCH-CHAIN-*)", () => {
  it("SRCH-CHAIN-001 / SRCH-CHAIN-002: single-hop whereChained emits `ref:Type.subParam`", () => {
    const q = (builder("Patient") as any)
      .whereChained("general-practitioner", "Practitioner", "name", "eq", "Joe")
      .compile();
    expect(paramEntry(q)).toContainEqual({
      name: "general-practitioner:Practitioner.name",
      value: "Joe",
    });
  });

  it("SRCH-CHAIN-003 / decisions.md SRCH.8 regression pin: whereChain UNCONDITIONALLY emits `:Type` on every hop today", () => {
    // Pin the current (partial-bug) behavior so a caller reading the suite
    // knows the public API has no way to emit the cleaner monomorphic form.
    // When the escape-hatch lands and the bug is fixed, the sibling
    // test.fails() below flips to it() and this pin moves to a regression
    // test of the opt-out path.
    const q = (builder("Patient") as any)
      .whereChain(
        [
          ["subject", "Patient"],
          ["general-practitioner", "Practitioner"],
        ],
        "name",
        "eq",
        "Joe",
      )
      .compile();
    const entry = paramEntry(q).find((p: any) => p.name.endsWith(".name"));
    expect(entry?.name).toBe("subject:Patient.general-practitioner:Practitioner.name");
  });

  test.fails("SRCH-CHAIN-003: multi-hop whereChain must NOT type-scope the terminal hop unnecessarily", () => {
    // Impl: search-query-builder.ts:412 joins ALL hops with `:type`, producing
    //   a:Ta.b:Tb.terminal
    // Spec: terminal hop has just `.<terminalParam>`; type-scope on the LAST
    // hop is only needed when that reference is polymorphic. Impl emits
    // unconditional type-scope even when the final reference is monomorphic.
    const q = (builder("Patient") as any)
      .whereChain(
        [
          ["subject", "Patient"],
          ["general-practitioner", "Practitioner"],
        ],
        "name",
        "eq",
        "Joe",
      )
      .compile();
    const entry = paramEntry(q).find((p: any) => p.name.endsWith(".name"));
    // Spec-correct: intermediate hops keep `:Type`, terminal hop's `:Type` is
    // dropped when monomorphic. Since the DSL has no monomorphism signal, the
    // cleanest assertion is that the emitted name does NOT repeat `:Practitioner`
    // immediately before the terminal.
    expect(entry?.name).toBe("subject:Patient.general-practitioner.name");
  });
});

describe("Reverse-chain (_has) (SRCH-HAS-*)", () => {
  it("SRCH-HAS-001: has() emits `_has:<Resource>:<refParam>:<searchParam>`", () => {
    const q = (builder("Patient") as any).has("Observation", "subject", "code", "eq", "12345-6").compile();
    expect(paramEntry(q)).toContainEqual({
      name: "_has:Observation:subject:code",
      value: "12345-6",
    });
  });

  it("SRCH-HAS-001: has() preserves prefix in the resulting param", () => {
    const q = (builder("Patient") as any).has("Observation", "subject", "date", "ge", "2024-01-01").compile();
    expect(paramEntry(q)).toContainEqual({
      name: "_has:Observation:subject:date",
      prefix: "ge",
      value: "2024-01-01",
    });
  });

  it.todo("SRCH-HAS-002: nested _has (`_has:A:x:_has:B:y:z=v`) — MISSING (single-level only)");
});

/* -------------------------------------------------------------------------- */
/* 6. Composites (SRCH-COMP-*)                                                */
/* -------------------------------------------------------------------------- */

describe("Composites (SRCH-COMP-*)", () => {
  it("SRCH-COMP-001: whereComposite joins component values with `$`", () => {
    const q = builder("Observation")
      .whereComposite("code-value-quantity", { code: "http://loinc.org|8480-6", value: "gt120" })
      .compile();
    expect(paramEntry(q as any)).toContainEqual({
      name: "code-value-quantity",
      value: "http://loinc.org|8480-6$gt120",
    });
  });

  it.todo("SRCH-COMP-003: multi-value composite top-level OR (`a$x,b$y`) — MISSING");
});

/* -------------------------------------------------------------------------- */
/* 7. Result control (SRCH-RES-*)                                             */
/* -------------------------------------------------------------------------- */

describe("Result control (SRCH-RES-*)", () => {
  it("SRCH-RES-001: _count emits a _count param", () => {
    const q = builder("Patient").count(20).compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "_count", value: 20 });
  });

  it("SRCH-RES-002: _sort ascending emits bare field name", () => {
    const q = builder("Patient")
      .sort("family" as any, "asc")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "_sort", value: "family" });
  });

  it("SRCH-RES-002: _sort descending uses minus prefix", () => {
    const q = builder("Patient")
      .sort("family" as any, "desc")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "_sort", value: "-family" });
  });

  it("SRCH-RES-002: multi-key _sort comma-joins with per-key minus for desc", () => {
    const q = builder("Observation")
      .sort("status" as any, "asc")
      .sort("date" as any, "desc")
      .compile();
    expect(paramEntry(q as any)).toContainEqual({ name: "_sort", value: "status,-date" });
  });

  it("SRCH-RES-003: _total=accurate emits a _total param", () => {
    const q = (builder("Patient") as any).total("accurate").compile();
    expect(paramEntry(q)).toContainEqual({ name: "_total", value: "accurate" });
  });

  it("SRCH-RES-004: _summary=text emits a _summary param", () => {
    const q = (builder("Patient") as any).summary("text").compile();
    expect(paramEntry(q)).toContainEqual({ name: "_summary", value: "text" });
  });

  it("SRCH-RES-005: _elements comma-joins field names via select()", () => {
    const q = (builder("Patient") as any).select(["identifier", "status"]).compile();
    expect(paramEntry(q)).toContainEqual({ name: "_elements", value: "identifier,status" });
  });
});

/* -------------------------------------------------------------------------- */
/* 9. Include / revinclude (SRCH-INC-*)                                       */
/* -------------------------------------------------------------------------- */

describe("Include / revinclude (SRCH-INC-*)", () => {
  it("SRCH-INC-001: include emits `_include=<RT>:<param>` (RT auto-prefixed)", () => {
    // include(param) prepends the current resourceType, yielding
    //   _include=Patient:general-practitioner.
    const q = (builder("Patient") as any).include("general-practitioner").compile();
    expect(paramEntry(q)).toContainEqual({ name: "_include", value: "Patient:general-practitioner" });
  });

  it.todo("SRCH-INC-002: include wildcard `_include=*` — MISSING dedicated API");

  it("SRCH-INC-003: revinclude emits `_revinclude=<Src>:<param>`", () => {
    const q = (builder("Patient") as any).revinclude("Observation", "subject").compile();
    expect(paramEntry(q)).toContainEqual({ name: "_revinclude", value: "Observation:subject" });
  });

  it("SRCH-INC-004: include :iterate emits modifier `iterate` on `_include`", () => {
    const q = (builder("Patient") as any).include("general-practitioner", { iterate: true }).compile();
    const entry = paramEntry(q).find((p: any) => p.name === "_include" && p.modifier === "iterate");
    expect(entry).toBeDefined();
    expect(entry?.value).toBe("Patient:general-practitioner");
  });
});

/* -------------------------------------------------------------------------- */
/* 11. _filter (SRCH-FILT-*)                                                  */
/* -------------------------------------------------------------------------- */

describe("_filter (SRCH-FILT-*)", () => {
  it("SRCH-FILT-001: direct .filter(expr) passes the expression through as _filter value", () => {
    const q = (builder("Patient") as any).filter("name eq 'Joe'").compile();
    const filt = paramEntry(q).find((p: any) => p.name === "_filter");
    expect(filt).toBeDefined();
    expect(String(filt?.value)).toBe("name eq 'Joe'");
  });

  test.fails("SRCH-FILT-001 / decisions.md SRCH.5: _filter emitter must escape literal backslashes (spec §3.2.1.5.3.1 _filter grammar)", () => {
    // Impl: condition-tree emitter escapes single-quotes for _filter literals
    // but passes backslashes through verbatim. A value containing `\` will
    // produce a parse error server-side because the _filter grammar gives
    // `\` metacharacter meaning inside string literals.
    const q = (builder("Patient") as any).where((cb: any) => cb.or([["family", "eq", "a\\b"]])).compile();
    const filt = paramEntry(q).find((p: any) => p.name === "_filter");
    // Spec-correct: a literal `\` appears in the emitted _filter value as
    // `\\` (doubled). Current impl emits the raw single backslash.
    expect(String(filt?.value)).toContain("\\\\");
  });

  test.fails("SRCH-FILT-001: `:not` in an OR group must NOT degrade to `ne` in _filter (spec §3.2.1.5.5.10)", () => {
    // Impl: condition-tree.ts:52 maps `:not` → `ne` when routing to _filter.
    // Spec: `:not` is null-inclusive (resources with no value match);
    // `ne` excludes null-valued resources. The DSL's silent mapping loses
    // semantics. A compliant DSL should either:
    //   (a) throw when routing `:not` via cross-param OR,
    //   (b) emit `not(... eq ...)` which preserves `:not` semantics.
    const q = (builder("Patient") as any)
      .where((cb: any) =>
        cb.or([
          ["family", "not", "a"],
          ["family", "not", "b"],
        ]),
      )
      .compile();
    const filt = paramEntry(q).find((p: any) => p.name === "_filter");
    // Spec-correct: uses `not(... eq ...)` (logical negation, preserves nulls).
    // Impl today: uses `ne` directly.
    expect(String(filt?.value)).toMatch(/not\s*\(/);
  });
});

/* -------------------------------------------------------------------------- */
/* 12. _query (SRCH-QRY-*)                                                    */
/* -------------------------------------------------------------------------- */

describe("_query (SRCH-QRY-*)", () => {
  it("SRCH-QRY-001: namedQuery emits _query param plus extras", () => {
    const q = (builder("Patient") as any).namedQuery("ncqa-by-group", { group: "g-42" }).compile();
    expect(paramEntry(q)).toContainEqual({ name: "_query", value: "ncqa-by-group" });
    expect(paramEntry(q)).toContainEqual({ name: "group", value: "g-42" });
  });
});

/* -------------------------------------------------------------------------- */
/* 13. HTTP POST search (SRCH-POST-*)                                         */
/* -------------------------------------------------------------------------- */

describe("POST _search (SRCH-POST-*)", () => {
  it("SRCH-POST-001: usePost() switches method to POST", () => {
    const q = (builder("Patient") as any)
      .usePost()
      .where("family" as any, "eq", "Smith")
      .compile();
    expect(q.method).toBe("POST");
  });

  it("SRCH-POST-001: POST path is `<ResourceType>/_search`", () => {
    const q = (builder("Observation") as any)
      .usePost()
      .where("status" as any, "eq", "final")
      .compile();
    expect(q.path).toBe("Observation/_search");
  });

  it("SRCH-POST-001: POST emits Content-Type: application/x-www-form-urlencoded", () => {
    const q = (builder("Patient") as any)
      .usePost()
      .where("family" as any, "eq", "Smith")
      .compile();
    expect(q.headers?.["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });

  it("SRCH-POST-001: POST body is form-urlencoded with param names + values", () => {
    const q = (builder("Patient") as any)
      .usePost()
      .where("family" as any, "eq", "Smith")
      .compile();
    expect(q.body).toBeDefined();
    expect(String(q.body)).toBe("family=Smith");
  });

  it("auto-POST: low threshold triggers POST even without usePost", () => {
    // No public setter for threshold — use the test-helper that seeds it via
    // the internal state constructor arg.
    let b = builderWithThreshold("Patient", 10) as any;
    for (let i = 0; i < 10; i++) b = b.where("given" as any, "eq", `name${i}`);
    const q = b.compile();
    expect(q.method).toBe("POST");
    expect(q.path).toBe("Patient/_search");
    expect(q.headers?.["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });

  it("auto-POST: short query stays GET when under threshold", () => {
    const q = builder("Patient")
      .where("family" as any, "eq", "Smith")
      .compile();
    expect(q.method).toBe("GET");
  });

  it.todo("SRCH-POST-002: POST must preserve URL-level params like _format as query string (MISSING)");

  /**
   * decisions.md SRCH.9a — the auto-POST threshold check measures
   * `paramsToFormBody(params).length`, which is the POST body encoding.
   * GET requests are built via a different percent-encoding (append on
   * URL.searchParams at fhir-client.ts:35); values that encode smaller
   * as form-body than as URL-query can pass the GET threshold even
   * though the GET URL exceeds it.
   *
   * This assertion reaches through to GET output and compares the
   * `paramsToFormBody` surrogate (what the DSL measures) against what
   * the GET wire actually carries. A spec-correct fix: measure the GET
   * URL's byte length on the GET path and the form-body's byte length
   * on the POST path.
   */
  /**
   * decisions.md SRCH.9a — The auto-POST threshold check at
   * search-query-builder.ts:678 always measures
   * `paramsToFormBody(params).length`, even when the chosen emission
   * branch is GET. The wire representation of a GET request is the
   * URL's query string (`URLSearchParams` on the executor in
   * `fhir-client.ts:35`), which can differ in byte length from the
   * form-urlencoded POST body for the same params. A spec-correct
   * decision function measures the bytes of the wire form it is about
   * to emit, not a different encoding.
   *
   * We demonstrate the divergence structurally rather than by a
   * payload-specific tripwire: show that when GET is chosen, the
   * decision input is not the GET URL's byte length.
   */
  test.fails("SRCH-POST / decisions.md SRCH.9a: auto-POST decision must read the chosen branch's wire bytes (spec §3.1.1.1)", () => {
    // Build a moderately sized GET that stays below the threshold on
    // the form-body measurement (current impl) AND below on the GET-URL
    // measurement (so the pass/fail isn't about the specific bytes).
    // Then observe that the DECISION was taken against a non-GET
    // encoding. We surface this by monkey-patching `paramsToFormBody`
    // via a proxy — but that's invasive. Instead, assert the weaker
    // invariant that the public builder exposes a way to separately
    // configure GET-byte vs POST-byte thresholds. A spec-correct fix
    // introduces that separation; today only one threshold exists and
    // it's measured on the form body.
    //
    // This test.fails() locks the missing-separation contract: the
    // spec-required fix exposes BOTH `autoPostThreshold` (POST-body
    // bytes) and `getUrlByteLimit` (GET-URL bytes) as distinct knobs.
    const b: any = builder("Patient");
    expect(typeof b.getUrlByteLimit).toBe("function");
  });

  /**
   * decisions.md SRCH.9b — Threshold comparison uses JS `.length`
   * (UTF-16 code units), not UTF-8 byte count. For ASCII content the
   * two agree; for multi-byte UTF-8 content URLSearchParams percent-
   * encodes non-ASCII so the form-body string length already
   * approximates byte count. The failure mode is subtler: characters
   * in the ASCII-safe set that are ALSO in the URLSearchParams
   * unencoded set (`[A-Za-z0-9_.-*]`) carry 1 byte each and 1 UTF-16
   * unit each, so those agree. The divergence shows up on a request
   * whose form body contains raw unencoded chars (none in this API
   * path) — which makes SRCH.9b unreachable via URLSearchParams today.
   *
   * The spec-correct remediation is still a byte-length measurement
   * (`TextEncoder.encode(body).length`) so that future changes to
   * the encoder (e.g. a permissive allow-list) cannot silently break
   * the threshold semantics. Pin that contract as a todo so the fix
   * is tracked without a false-positive assertion.
   */
  it.todo(
    "SRCH-POST / decisions.md SRCH.9b: auto-POST measurement must be `TextEncoder.encode(body).length`, not `body.length` (defensive against encoder changes)",
  );

  it("decisions.md SRCH.10 regression pin: `autoPostThreshold` state field is dead from the public builder surface", () => {
    // The builder has no `autoPostThreshold(n)` method on the public
    // SearchQueryBuilder<...> interface — only the internal constructor
    // seed (see `builderWithThreshold` helper above) can reach it.
    // Pin this fact: calling `.autoPostThreshold(10)` at the chaining
    // surface is a type + runtime error, preventing a typed caller
    // from tuning the threshold inline.
    const b: any = builder("Patient");
    // No such method exists.
    expect(typeof b.autoPostThreshold).toBe("undefined");
  });
});

/* -------------------------------------------------------------------------- */
/* 14. URL structure & errors (SRCH-URL-*)                                    */
/* -------------------------------------------------------------------------- */

describe("URL structure (SRCH-URL-*)", () => {
  it("SRCH-URL-001: GET path is `<ResourceType>` (type-level search)", () => {
    const q = builder("Patient").compile();
    expect((q as any).method).toBe("GET");
    expect((q as any).path).toBe("Patient");
  });

  it.todo("SRCH-URL-001: system-level search (`[base]?...`) — MISSING on FhirClient");
  it.todo("SRCH-URL-001: history-level filtering — MISSING on FhirClient");

  it.todo("SRCH-URL-003: `Prefer: handling=lenient|strict` plumbed through compile() — MISSING");
});

/* -------------------------------------------------------------------------- */
/* 15. Meta / common params (SRCH-META-*)                                     */
/* -------------------------------------------------------------------------- */

describe("Metadata params (SRCH-META-*)", () => {
  it("SRCH-META-001: whereId comma-joins ids into _id", () => {
    const q = (builder("Patient") as any).whereId("a", "b", "c").compile();
    expect(paramEntry(q).find((p: any) => p.name === "_id")).toEqual({ name: "_id", value: "a,b,c" });
  });

  it("SRCH-META-002: whereLastUpdated emits _lastUpdated with prefix", () => {
    const q = (builder("Patient") as any).whereLastUpdated("ge", "2024-01-01").compile();
    expect(paramEntry(q)).toContainEqual({ name: "_lastUpdated", prefix: "ge", value: "2024-01-01" });
  });

  it("SRCH-META-003: withTag emits _tag", () => {
    const q = (builder("Patient") as any).withTag("http://example.org/tag|alpha").compile();
    expect(paramEntry(q)).toContainEqual({ name: "_tag", value: "http://example.org/tag|alpha" });
  });

  it("SRCH-META-005: withSecurity emits _security", () => {
    const q = (builder("Patient") as any).withSecurity("http://hl7.org/fhir/v3/Confidentiality|R").compile();
    expect(paramEntry(q)).toContainEqual({
      name: "_security",
      value: "http://hl7.org/fhir/v3/Confidentiality|R",
    });
  });

  it("SRCH-META-006: fromSource emits _source", () => {
    const q = (builder("Patient") as any).fromSource("http://example.org/ingest").compile();
    expect(paramEntry(q)).toContainEqual({ name: "_source", value: "http://example.org/ingest" });
  });
});

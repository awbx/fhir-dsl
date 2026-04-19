/**
 * URL-encoding edge cases for @fhir-dsl/core search-query-builder.
 *
 * Covers the encoding-layer concerns flagged by spec-challenger's review
 * that complement the higher-level rules in search-spec-compliance.test.ts:
 *
 *   - Literal comma / backslash / `$` / `|` escapes per §3.2.1.5.7.
 *   - Composite `$` separator ambiguity (SRCH-TYP-008 / SRCH-COMP-001).
 *   - whereMissing modifier placement: `family:missing=true` (NOT `family=missing:true`).
 *   - Auto-POST regression guards (CONFIRM-STRONG for AUDIT line 82).
 *   - Form-body encoding for POST _search.
 *
 * Do NOT weaken assertions to silence a failing test.
 */

import { describe, expect, it, test, vi } from "vitest";
import type { SearchQueryBuilder } from "../src/query-builder.js";
import { SearchQueryBuilderImpl } from "../src/search-query-builder.js";

type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id?: string };
    Observation: { resourceType: "Observation"; id?: string };
  };
  searchParams: {
    Patient: {
      family: { type: "string"; value: string };
      given: { type: "string"; value: string };
      gender: { type: "token"; value: string };
      birthdate: { type: "date"; value: string };
    };
    Observation: {
      status: { type: "token"; value: string };
      code: { type: "token"; value: string };
      "code-value-quantity": { type: "composite"; components: { code: string; value: string } };
    };
  };
  includes: Record<string, Record<string, string>>;
  revIncludes: Record<string, Record<string, string>>;
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

/* -------------------------------------------------------------------------- */
/* whereMissing modifier placement                                            */
/* -------------------------------------------------------------------------- */

describe("whereMissing modifier placement (SRCH-MOD-012)", () => {
  it("emits `param:missing=true`, NOT `param=missing:true`", () => {
    const q = builder("Patient").whereMissing("family", true).compile() as any;
    // Compiled param shape: { name, modifier, value }. Encoded in form body,
    // encodeParam (search-query-builder.ts:60-64) produces `family:missing=true`.
    const entry = q.params.find((p: any) => p.name === "family");
    expect(entry).toEqual({ name: "family", modifier: "missing", value: "true" });
  });

  it("true/false values render as the literal strings, not JS booleans", () => {
    const qTrue = builder("Patient").whereMissing("family", true).compile() as any;
    const qFalse = builder("Patient").whereMissing("family", false).compile() as any;
    expect(qTrue.params[0]?.value).toBe("true");
    expect(qFalse.params[0]?.value).toBe("false");
  });

  it("POST form body for whereMissing carries correct `:missing=` shape", () => {
    const q = (builder("Patient") as any).usePost().whereMissing("family", true).compile();
    expect(String(q.body)).toBe("family%3Amissing=true");
    // URL-decoded: `family:missing=true` per spec.
  });
});

/* -------------------------------------------------------------------------- */
/* Composite `$` separator — ambiguity today                                  */
/* -------------------------------------------------------------------------- */

describe("Composite `$` encoding (SRCH-TYP-008 / SRCH-COMP-001)", () => {
  it("two safe components round-trip as `a$b`", () => {
    const q = builder("Observation")
      .whereComposite("code-value-quantity", { code: "http://loinc.org|8480-6", value: "gt120" })
      .compile() as any;
    const entry = q.params.find((p: any) => p.name === "code-value-quantity");
    expect(entry?.value).toBe("http://loinc.org|8480-6$gt120");
  });

  it("SRCH-TYP-008: literal `$` in a component value is escaped with `\\$` (spec §3.2.1.5.8)", () => {
    const q = builder("Observation")
      .whereComposite("code-value-quantity", { code: "http://loinc.org|85354-9", value: "pre$ent" })
      .compile() as any;
    const entry = q.params.find((p: any) => p.name === "code-value-quantity");
    expect(String(entry?.value)).toContain("\\$");
  });

  it("SRCH-TYP-008: `$` in BOTH components leaves exactly one unescaped `$` (the separator)", () => {
    const q = builder("Observation")
      .whereComposite("code-value-quantity", { code: "a$b", value: "c$d" })
      .compile() as any;
    const entry = q.params.find((p: any) => p.name === "code-value-quantity");
    const unescaped = (String(entry?.value).match(/(^|[^\\])\$/g) || []).length;
    expect(unescaped).toBe(1);
  });
});

/* -------------------------------------------------------------------------- */
/* Literal separator escapes (§3.2.1.5.7)                                     */
/* -------------------------------------------------------------------------- */

describe("Literal separator escapes (SRCH-COMB-003 / SRCH-COMB-004)", () => {
  it("SRCH-COMB-003: literal `,` in an OR-array value is escaped with `\\,` (spec §3.2.1.5.7)", () => {
    const q = builder("Patient").where("family", "eq", ["O'Brien, Jr.", "Smith"]).compile() as any;
    const entry = q.params.find((p: any) => p.name === "family");
    expect(String(entry?.value)).toContain("\\,");
  });

  test.fails("GAP: literal `\\` in a value is NOT escaped today", () => {
    const q = builder("Patient").where("family", "eq", "back\\slash").compile() as any;
    const entry = q.params.find((p: any) => p.name === "family");
    expect(String(entry?.value)).toContain("\\\\");
  });

  test.fails("GAP: literal `|` (not system|code separator) is NOT escaped today", () => {
    // In a token context, `|` is a separator between system and code. A
    // literal `|` as part of a code or system must be `\|` per §3.2.1.5.7.
    // The DSL exposes no surface for distinguishing these two uses, so the
    // emitted value reliably loses the distinction.
    const q = builder("Observation")
      .where("code" as any, "eq", "a|b_literal")
      .compile() as any;
    const entry = q.params.find((p: any) => p.name === "code");
    expect(String(entry?.value)).toContain("\\|");
  });
});

/* -------------------------------------------------------------------------- */
/* Auto-POST regression guards (CONFIRM-STRONG for AUDIT line 82)             */
/* -------------------------------------------------------------------------- */

describe("Auto-POST threshold (CONFIRM-STRONG regression pins)", () => {
  it("default threshold keeps a small query on GET", () => {
    const q = builder("Patient")
      .where("family" as any, "eq", "Smith")
      .compile() as any;
    expect(q.method).toBe("GET");
    expect(q.path).toBe("Patient");
  });

  it("explicit usePost(true) forces POST even under threshold", () => {
    const q = (builder("Patient") as any)
      .usePost()
      .where("family" as any, "eq", "Smith")
      .compile();
    expect(q.method).toBe("POST");
    expect(q.path).toBe("Patient/_search");
    expect(q.headers?.["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });

  it("auto-switches to POST when form-body length exceeds threshold", () => {
    let b = builderWithThreshold("Patient", 10) as any;
    for (let i = 0; i < 20; i++) b = b.where("given" as any, "eq", `n${i}`);
    const q = b.compile();
    expect(q.method).toBe("POST");
  });

  it("POST path shape is always `<ResourceType>/_search`", () => {
    const q = (builder("Observation") as any)
      .usePost()
      .where("status" as any, "eq", "final")
      .compile();
    expect(q.path).toBe("Observation/_search");
  });

  it("POST body is form-urlencoded (spec §3.2.1.4)", () => {
    const q = (builder("Patient") as any)
      .usePost()
      .where("family" as any, "eq", "Smith")
      .compile();
    expect(q.headers?.["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(String(q.body)).toBe("family=Smith");
  });

  it("POST body preserves repeated params (AND) with URLSearchParams.append", () => {
    const q = (builder("Patient") as any)
      .usePost()
      .where("given" as any, "eq", "John")
      .where("given" as any, "eq", "Smith")
      .compile();
    // URLSearchParams renders repeated keys as `given=John&given=Smith`.
    expect(String(q.body)).toBe("given=John&given=Smith");
  });

  it("POST branch drops URL-level params (documented MISSING)", () => {
    // Currently SRCH-POST-002 is MISSING: the POST branch emits
    // `params: []`. This pin locks current behavior so a fix (hybrid mode)
    // will flip the assertion without it slipping through unnoticed.
    const q = (builder("Patient") as any)
      .usePost()
      .where("family" as any, "eq", "Smith")
      .compile();
    expect(q.params).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* Multi-key _sort URL output                                                 */
/* -------------------------------------------------------------------------- */

describe("Multi-key _sort (SRCH-RES-002)", () => {
  it("minus-prefix on desc keys, plain name on asc keys, comma-joined", () => {
    const q = builder("Patient")
      .sort("family" as any, "asc")
      .sort("birthdate" as any, "desc")
      .sort("given" as any, "asc")
      .compile() as any;
    const sort = q.params.find((p: any) => p.name === "_sort");
    expect(sort?.value).toBe("family,-birthdate,given");
  });
});

/* -------------------------------------------------------------------------- */
/* _has prefix preservation                                                   */
/* -------------------------------------------------------------------------- */

describe("_has prefix preservation (SRCH-HAS-001)", () => {
  it("ge prefix is preserved on the _has-emitted param", () => {
    const q = (builder("Patient") as any).has("Observation", "subject", "date", "ge", "2024-01-01").compile();
    expect(q.params).toContainEqual({
      name: "_has:Observation:subject:date",
      prefix: "ge",
      value: "2024-01-01",
    });
  });
});

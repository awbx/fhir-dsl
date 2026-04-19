import { describe, expect, it } from "vitest";
import { compileConditionTree } from "./condition-tree.js";
import { createWhereBuilder } from "./where-builder.js";

type SP = {
  status: { type: "token"; value: string };
  date: { type: "date"; value: string };
  family: { type: "string"; value: string };
  code: { type: "token"; value: string };
  count: { type: "number"; value: number };
};

const eb = createWhereBuilder<SP>();

describe("compileConditionTree", () => {
  describe("routing", () => {
    it("compiles a single tuple as one param (with op classification)", () => {
      expect(compileConditionTree<SP>(["status", "eq", "final"])).toEqual([{ name: "status", value: "final" }]);

      expect(compileConditionTree<SP>(["date", "gt", "2024-01-01"])).toEqual([
        { name: "date", prefix: "gt", value: "2024-01-01" },
      ]);

      expect(compileConditionTree<SP>(["family", "contains", "Smi"])).toEqual([
        { name: "family", modifier: "contains", value: "Smi" },
      ]);
    });

    it("compiles AND of tuples on different params as separate params", () => {
      const tree = eb.and([
        ["status", "eq", "final"],
        ["date", "gt", "2024-01-01"],
      ]);
      expect(compileConditionTree(tree)).toEqual([
        { name: "status", value: "final" },
        { name: "date", prefix: "gt", value: "2024-01-01" },
      ]);
    });

    it("compiles OR of same-param `eq` tuples as a single comma-joined param", () => {
      const tree = eb.or([
        ["status", "eq", "final"],
        ["status", "eq", "amended"],
      ]);
      expect(compileConditionTree(tree)).toEqual([{ name: "status", value: "final,amended" }]);
    });

    it("falls back to _filter when an OR mixes param names", () => {
      const tree = eb.or([
        ["status", "eq", "final"],
        ["code", "eq", "1234-5"],
      ]);
      expect(compileConditionTree(tree)).toEqual([{ name: "_filter", value: "status eq 'final' or code eq '1234-5'" }]);
    });

    it("falls back to _filter when an OR uses a non-eq op on the same param", () => {
      const tree = eb.or([
        ["date", "gt", "2024-01-01"],
        ["date", "lt", "2024-12-31"],
      ]);
      expect(compileConditionTree(tree)).toEqual([
        { name: "_filter", value: "date gt 2024-01-01 or date lt 2024-12-31" },
      ]);
    });

    it("wraps a nested OR in parens when nested under an AND", () => {
      const tree = eb.and([
        ["status", "eq", "final"],
        eb.or([
          ["code", "eq", "a"],
          ["code", "eq", "b"],
        ]),
      ]);
      expect(compileConditionTree(tree)).toEqual([
        { name: "_filter", value: "status eq 'final' and (code eq 'a' or code eq 'b')" },
      ]);
    });

    it("wraps a nested AND in parens when nested under an OR", () => {
      const tree = eb.or([
        ["status", "eq", "final"],
        eb.and([
          ["code", "eq", "a"],
          ["date", "gt", "2024-01-01"],
        ]),
      ]);
      expect(compileConditionTree(tree)).toEqual([
        { name: "_filter", value: "status eq 'final' or (code eq 'a' and date gt 2024-01-01)" },
      ]);
    });
  });

  describe("operator mapping (_filter grammar)", () => {
    const cases: Array<[string, string]> = [
      ["eq", "eq"],
      ["ne", "ne"],
      ["gt", "gt"],
      ["ge", "ge"],
      ["lt", "lt"],
      ["le", "le"],
      ["sa", "sa"],
      ["eb", "eb"],
      ["ap", "ap"],
      ["contains", "co"],
      ["in", "in"],
      ["not-in", "ni"],
    ];

    for (const [input, expected] of cases) {
      it(`emits "${input}" as "${expected}"`, () => {
        const tree = eb.or([
          ["status", input as "eq", "x"],
          ["code", "eq", "y"],
        ]);
        const [param] = compileConditionTree(tree);
        expect(param!.value).toBe(`status ${expected} 'x' or code eq 'y'`);
      });
    }

    it("emits `:not` as `not(... eq ...)` (spec §3.2.1.5.5.10; BUG-015)", () => {
      const tree = eb.or([
        ["status", "not", "x"],
        ["code", "eq", "y"],
      ]);
      const [param] = compileConditionTree(tree);
      expect(param!.value).toBe("not(status eq 'x') or code eq 'y'");
    });

    const unsupported = ["exact", "above", "below", "of-type", "text", "identifier", "code-text", "missing"];

    for (const op of unsupported) {
      it(`rejects "${op}" inside _filter with a helpful error`, () => {
        const tree = eb.or([
          ["status", op as "eq", "x"],
          ["code", "eq", "y"],
        ]);
        expect(() => compileConditionTree(tree)).toThrow(`operator "${op}" cannot be expressed in FHIR _filter`);
      });
    }
  });

  describe("value formatting", () => {
    it("emits numbers and booleans bare", () => {
      const numTree = eb.or([
        ["count", "eq", 42 as never],
        ["status", "eq", "final"],
      ]);
      expect(compileConditionTree(numTree)[0]!.value).toBe("count eq 42 or status eq 'final'");

      const boolTree = eb.or([
        ["status", "eq", true as never],
        ["status", "eq", "final"],
      ]);
      // mixed-name fallback isn't triggered (status, status) — but the boolean is on the same name as `final`,
      // so we use a mixed-name OR to force _filter:
      const forced = eb.or([
        ["status", "eq", true as never],
        ["code", "eq", "x"],
      ]);
      expect(compileConditionTree(forced)[0]!.value).toBe("status eq true or code eq 'x'");

      // Drop the unused boolTree variable (avoid lint noise)
      void boolTree;
    });

    it("escapes single quotes in string values by doubling", () => {
      const tree = eb.or([
        ["family", "eq", "O'Brien"],
        ["code", "eq", "x"],
      ]);
      expect(compileConditionTree(tree)[0]!.value).toBe("family eq 'O''Brien' or code eq 'x'");
    });

    it("emits date / dateTime strings bare (no quotes)", () => {
      const tree = eb.or([
        ["date", "eq", "2024-01-15"],
        ["status", "eq", "final"],
      ]);
      expect(compileConditionTree(tree)[0]!.value).toBe("date eq 2024-01-15 or status eq 'final'");

      const dt = eb.or([
        ["date", "eq", "2024-01-15T10:00:00Z"],
        ["status", "eq", "final"],
      ]);
      expect(compileConditionTree(dt)[0]!.value).toBe("date eq 2024-01-15T10:00:00Z or status eq 'final'");
    });

    it("quotes non-date strings", () => {
      const tree = eb.or([
        ["status", "eq", "not-a-date"],
        ["code", "eq", "x"],
      ]);
      expect(compileConditionTree(tree)[0]!.value).toBe("status eq 'not-a-date' or code eq 'x'");
    });
  });
});

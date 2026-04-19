/**
 * Pin tests for search URL compilation edge cases.
 *
 * See AUDIT.md for the list of known gaps. Tests here pin CURRENT behavior
 * for corner cases that are either correctly handled (regression pins) or
 * known bugs (marked // GAP). When a GAP is fixed, the corresponding test
 * should be rewritten to assert the spec-correct behavior.
 */

import { describe, expect, it, vi } from "vitest";
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
      birthdate: { type: "date"; value: string };
      gender: { type: "token"; value: string };
      "general-practitioner": { type: "reference"; value: string };
    };
    Observation: {
      status: { type: "token"; value: string };
      code: { type: "token"; value: string };
      date: { type: "date"; value: string };
      subject: { type: "reference"; value: string };
    };
  };
  includes: Record<string, Record<string, string>>;
  revIncludes: Record<string, Record<string, string>>;
  profiles: Record<string, never>;
};

type FlexibleSearchParams = Record<string, { type: "string" | "token" | "date" | "reference"; value: string }>;

const noopExecutor = vi.fn(async () => ({
  resourceType: "Bundle",
  type: "searchset",
  entry: [],
}));

function createBuilder(resourceType = "Patient"): SearchQueryBuilder<TestSchema, string, FlexibleSearchParams> {
  return new SearchQueryBuilderImpl<TestSchema, string, FlexibleSearchParams>(resourceType, noopExecutor);
}

describe("Search URL edge cases", () => {
  describe("prefix emission per operator", () => {
    it("eq emits no prefix", () => {
      const q = createBuilder("Observation")
        .where("status" as any, "eq", "final")
        .compile();
      expect(q.params).toEqual([{ name: "status", value: "final" }]);
    });

    it.each(["ne", "gt", "ge", "lt", "le", "sa", "eb", "ap"] as const)("%s emits prefix alongside value", (op) => {
      const q = createBuilder("Patient")
        .where("birthdate", op as any, "1990-01-01")
        .compile();
      expect(q.params).toContainEqual({ name: "birthdate", prefix: op, value: "1990-01-01" });
    });
  });

  describe("token value formatting is pass-through", () => {
    it("system|code literal flows through unchanged", () => {
      const q = createBuilder("Observation")
        .where("code" as any, "eq", "http://loinc.org|85354-9")
        .compile();
      expect(q.params).toContainEqual({ name: "code", value: "http://loinc.org|85354-9" });
    });

    it("|code (code without system) flows through unchanged", () => {
      const q = createBuilder("Observation")
        .where("code" as any, "eq", "|local-code")
        .compile();
      expect(q.params).toContainEqual({ name: "code", value: "|local-code" });
    });

    it("system| (any code in system) flows through unchanged", () => {
      const q = createBuilder("Observation")
        .where("code" as any, "eq", "http://loinc.org|")
        .compile();
      expect(q.params).toContainEqual({ name: "code", value: "http://loinc.org|" });
    });
  });

  describe("reference value formatting is pass-through", () => {
    it("accepts relative references", () => {
      const q = createBuilder("Observation")
        .where("subject" as any, "eq", "Patient/123")
        .compile();
      expect(q.params).toContainEqual({ name: "subject", value: "Patient/123" });
    });

    it("accepts absolute URL references", () => {
      const q = createBuilder("Observation")
        .where("subject" as any, "eq", "https://ex.com/fhir/Patient/123")
        .compile();
      expect(q.params).toContainEqual({ name: "subject", value: "https://ex.com/fhir/Patient/123" });
    });

    it("accepts urn:uuid references", () => {
      const q = createBuilder("Observation")
        .where("subject" as any, "eq", "urn:uuid:53fefa32-fcbb-4ff8-8a92-55ee120877b7")
        .compile();
      expect(q.params).toContainEqual({
        name: "subject",
        value: "urn:uuid:53fefa32-fcbb-4ff8-8a92-55ee120877b7",
      });
    });
  });

  describe("OR via comma", () => {
    it("joins array values with ','", () => {
      const q = createBuilder("Patient")
        .where("gender" as any, "eq", ["male", "female"])
        .compile();
      expect(q.params).toContainEqual({ name: "gender", value: "male,female" });
    });

    it("rejects non-eq array operators", () => {
      expect(() => createBuilder("Patient").where("birthdate", "ge" as any, ["2020", "2021"] as any)).toThrow(
        /array values require the/,
      );
    });

    // GAP: FHIR §3.1.1.3.2 requires escaping of literal commas and backslashes in search values.
    // Current implementation naively joins with "," so a value containing a literal comma is
    // indistinguishable from an OR separator. When the bug is fixed (escape `\` and `,` with `\`),
    // rewrite this test to assert the escaped form, e.g. `"O'Brien\\, Jr.,Smith"`.
    it("GAP: literal commas in values are NOT escaped today (produces ambiguous URL)", () => {
      const q = createBuilder("Patient").where("family", "eq", ["O'Brien, Jr.", "Smith"]).compile();
      expect(q.params).toContainEqual({ name: "family", value: "O'Brien, Jr.,Smith" });
    });

    // GAP: FHIR §3.1.1.3.2 also requires escaping of backslashes themselves.
    it("GAP: literal backslashes in values are NOT escaped today", () => {
      const q = createBuilder("Patient").where("family", "eq", "back\\slash").compile();
      expect(q.params).toContainEqual({ name: "family", value: "back\\slash" });
    });
  });
});

/**
 * Type-level proofs for the search query builder DSL.
 *
 * These tests don't run code — they fail at typecheck time if the public types
 * change in a way that breaks the contract documented for each FHIR R5 search
 * feature.
 */
import { describe, it } from "vitest";
import type { Assert, Equals } from "./_internal/test-helpers.js";
import type { ApplySelection, SearchQueryBuilder } from "./query-builder.js";
import type {
  DatePrefix,
  FhirSchema,
  NumberPrefix,
  QuantityPrefix,
  ReferenceModifier,
  SearchPrefixFor,
  StringModifier,
  TokenModifier,
  UriModifier,
} from "./types.js";

describe("SearchPrefixFor (type-level)", () => {
  it("date params accept all date prefixes (gt/ge/lt/le/sa/eb/ap/ne) plus eq", () => {
    type _ = Assert<Equals<SearchPrefixFor<{ type: "date"; value: string }>, DatePrefix>>;
  });

  it("number params accept the numeric subset (no sa/eb/ap)", () => {
    type _ = Assert<Equals<SearchPrefixFor<{ type: "number"; value: number }>, NumberPrefix>>;
  });

  it("quantity params behave like dates for ranged ops", () => {
    type _ = Assert<Equals<SearchPrefixFor<{ type: "quantity"; value: string }>, QuantityPrefix>>;
  });

  it("string params expose contains and exact modifiers", () => {
    type _ = Assert<Equals<SearchPrefixFor<{ type: "string"; value: string }>, StringModifier>>;
  });

  it("token params expose the full R5 token modifier set", () => {
    type _ = Assert<Equals<SearchPrefixFor<{ type: "token"; value: string }>, TokenModifier>>;
  });

  it("reference params expose :identifier (R5)", () => {
    type _ = Assert<Equals<SearchPrefixFor<{ type: "reference"; value: string }>, ReferenceModifier>>;
  });

  it("uri params expose :above and :below (R5)", () => {
    type _ = Assert<Equals<SearchPrefixFor<{ type: "uri"; value: string }>, UriModifier>>;
  });
});

describe("Modifier vocabulary completeness vs FHIR R5 spec", () => {
  it("token modifier union covers every modifier listed at https://fhir.hl7.org/fhir/search.html#modifiers", () => {
    type Required = "eq" | "not" | "of-type" | "in" | "not-in" | "text" | "above" | "below" | "code-text";
    type Missing = Exclude<Required, TokenModifier>;
    type _ = Assert<Equals<Missing, never>>;
  });

  it("date prefix union covers every value-prefix listed at https://fhir.hl7.org/fhir/search.html#prefix", () => {
    type Required = "eq" | "ne" | "gt" | "ge" | "lt" | "le" | "sa" | "eb" | "ap";
    type Missing = Exclude<Required, DatePrefix>;
    type _ = Assert<Equals<Missing, never>>;
  });

  it("does NOT classify :missing as a token modifier — it has its own .whereMissing(...) entrypoint", () => {
    type LeakedMissing = "missing" extends TokenModifier ? true : false;
    type _ = Assert<Equals<LeakedMissing, false>>;
  });

  it("does NOT classify :iterate as a search-value modifier — it lives on _include/_revinclude", () => {
    type LeakedIterate = "iterate" extends TokenModifier ? true : false;
    type _ = Assert<Equals<LeakedIterate, false>>;
  });
});

describe("$if / $call composition (type-level)", () => {
  type Schema = {
    resources: {
      Observation: { resourceType: "Observation"; id?: string; code?: unknown };
      Patient: { resourceType: "Patient"; id?: string };
    };
    searchParams: {
      Observation: {
        status: { type: "token"; value: string };
        date: { type: "date"; value: string };
      };
    };
    includes: { Observation: { subject: "Patient" } };
    profiles: Record<string, never>;
  };

  type Base = SearchQueryBuilder<Schema, "Observation", Schema["searchParams"]["Observation"]>;
  type _SchemaOk = Assert<Equals<Schema extends FhirSchema ? true : false, true>>;
  type _AppliesOk = Assert<
    Equals<ApplySelection<{ resourceType: "X"; a?: 1; b?: 2 }, "a">, { resourceType: "X"; a?: 1 }>
  >;

  it("$if preserves the exact builder type in both branches", () => {
    // Using polymorphic `this`, the return type matches the receiver — so
    // calling $if on a Base returns Base (not a widened SearchQueryBuilder).
    const base = null as unknown as Base;
    const out = base.$if(true, (qb) => qb);
    type _ = Assert<Equals<typeof out, Base>>;
  });

  it("$call returns whatever the callback returns", () => {
    const base = null as unknown as Base;
    const asNumber = base.$call(() => 42 as const);
    const asBuilder = base.$call((qb) => qb);
    type _1 = Assert<Equals<typeof asNumber, 42>>;
    type _2 = Assert<Equals<typeof asBuilder, Base>>;
  });
});

/**
 * Type-level proofs for the search query builder DSL.
 *
 * These tests don't run code — they fail at typecheck time if the public types
 * change in a way that breaks the contract documented for each FHIR R5 search
 * feature.
 */
import { describe, it } from "vitest";
import type { Assert, Equals } from "./_internal/test-helpers.js";
import type {
  DatePrefix,
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

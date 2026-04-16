import { describe, it } from "vitest";
import type { Assert, Equals, Expect } from "./test-helpers.js";

describe("Equals", () => {
  it("returns true for identical types", () => {
    type _1 = Assert<Equals<string, string>>;
    type _2 = Assert<Equals<{ a: 1 }, { a: 1 }>>;
    type _3 = Assert<Equals<1 | 2, 1 | 2>>;
  });

  it("returns false for different types", () => {
    type _1 = Assert<Equals<Equals<string, number>, false>>;
    type _2 = Assert<Equals<Equals<{ a: 1 }, { a: 1; b: 2 }>, false>>;
  });

  it("distinguishes any from unknown", () => {
    // The classic case where `extends` fails — Equals handles it correctly.
    type _1 = Assert<Equals<Equals<any, unknown>, false>>;
  });
});

describe("Expect", () => {
  it("is an alias of Assert", () => {
    type _1 = Expect<Equals<1, 1>>;
    type _2 = Expect<true>;
  });
});

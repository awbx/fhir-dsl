/**
 * Type-level proofs for the consumer-facing helper types exported by
 * `@fhir-dsl/core`:
 *
 * - `AnySearchBuilder<S>` — variance-safe wildcard
 * - `SearchBuilderOf<S, RT>` — resource-bound, open on everything else
 * - `FilterableBuilder<S, RT>` — filter-only subset (no .include / .transform)
 * - `ResourceOf<QB>` / `IncludesOf<QB>` — extractors
 *
 * Guards the Bug 3 regression: the old six-any wildcard pattern was variance-
 * fragile against `.transform(fn)` because `Scope<S, any, any>` collapsed to a
 * giant union of every resource. These proofs assert concrete builders stay
 * assignable to the wildcard, and that identity flows through `QB extends
 * AnySearchBuilder<S>` helpers.
 */
import { describe, it } from "vitest";
import type { Assert, Equals } from "./_internal/test-helpers.js";
import type {
  AnySearchBuilder,
  FilterableBuilder,
  IncludesOf,
  ResourceOf,
  SearchBuilderOf,
  SearchQueryBuilder,
} from "./query-builder.js";
import type { FhirSchema } from "./types.js";

interface Patient {
  resourceType: "Patient";
  id?: string;
}

interface Encounter {
  resourceType: "Encounter";
  id?: string;
  status?: string;
  subject?: { reference?: string };
}

interface TestIncludeExpressions {
  Encounter: { subject: "subject" };
}

interface TestSchema {
  resources: { Encounter: Encounter; Patient: Patient };
  searchParams: Record<string, never>;
  includes: { Encounter: { subject: "Patient" } };
  revIncludes: Record<string, never>;
  includeExpressions: TestIncludeExpressions;
  profiles: Record<string, never>;
}

declare const concreteEncounter: SearchQueryBuilder<TestSchema, "Encounter">;
declare const testClient: {
  search<RT extends keyof TestSchema["resources"] & string>(rt: RT): SearchQueryBuilder<TestSchema, RT>;
};

function preserveQB<QB extends AnySearchBuilder<TestSchema>>(qb: QB): QB {
  return qb;
}

describe("AnySearchBuilder — concrete assignable to wildcard", () => {
  it("accepts a concrete builder as an argument", () => {
    type Concrete = SearchQueryBuilder<TestSchema, "Encounter">;
    type Wide = AnySearchBuilder<TestSchema>;
    type ConcreteExtendsWide = Concrete extends Wide ? true : false;
    type _ = Assert<Equals<ConcreteExtendsWide, true>>;
  });

  it("preserves builder identity through `QB extends AnySearchBuilder<S>`", () => {
    const out = preserveQB(concreteEncounter);
    type OutT = typeof out;
    type _ = Assert<Equals<OutT, SearchQueryBuilder<TestSchema, "Encounter">>>;
  });
});

describe("SearchBuilderOf — resource-bound wildcard", () => {
  it("accepts concrete builders bound to the same resource", () => {
    type Concrete = SearchQueryBuilder<TestSchema, "Encounter">;
    type Bound = SearchBuilderOf<TestSchema, "Encounter">;
    type _ = Assert<Equals<Concrete extends Bound ? true : false, true>>;
  });
});

describe("FilterableBuilder — filter-surface-only subset", () => {
  it("has .where but not .include / .transform / .execute", () => {
    type F = FilterableBuilder<TestSchema, "Encounter">;
    type HasWhere = "where" extends keyof F ? true : false;
    type HasInclude = "include" extends keyof F ? true : false;
    type HasTransform = "transform" extends keyof F ? true : false;
    type HasExecute = "execute" extends keyof F ? true : false;
    type _1 = Assert<Equals<HasWhere, true>>;
    type _2 = Assert<Equals<HasInclude, false>>;
    type _3 = Assert<Equals<HasTransform, false>>;
    type _4 = Assert<Equals<HasExecute, false>>;
  });
});

describe("ResourceOf / IncludesOf — structural unwraps", () => {
  it("extracts RT from a bound builder", () => {
    type QB = SearchQueryBuilder<TestSchema, "Encounter">;
    type _ = Assert<Equals<ResourceOf<QB>, "Encounter">>;
  });

  it("extracts the empty include map from a fresh builder", () => {
    type QB = SearchQueryBuilder<TestSchema, "Encounter">;
    type I = IncludesOf<QB>;
    // A fresh builder has `Inc = {}` by default — extract as an object shape.
    type _ = Assert<Equals<keyof I, never>>;
  });
});

describe("applyFilters acceptance — worked consumer example", () => {
  it("compiles with zero `any` and keeps .include() + .transform() afterwards", () => {
    type FhirCondition<S extends FhirSchema = TestSchema> = (qb: AnySearchBuilder<S>) => AnySearchBuilder<S>;

    function applyFilters<QB extends AnySearchBuilder<TestSchema>>(qb: QB, conditions: readonly FhirCondition[]): QB {
      let out = qb;
      for (const c of conditions) out = c(out) as QB;
      return out;
    }

    const qb = testClient.search("Encounter").$call((q) => applyFilters(q, []));
    qb.include("subject").transform((t) => ({ id: t("id", "") }));
  });
});

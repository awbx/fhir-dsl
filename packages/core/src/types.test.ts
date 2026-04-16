import type { SearchParam } from "@fhir-dsl/types";
import { describe, expectTypeOf, it } from "vitest";
import type {
  CompositeComponents,
  CompositeKeys,
  CompositeValues,
  DatePrefix,
  IncludeFor,
  NumberPrefix,
  ParamValue,
  ProfileFor,
  ProfileNames,
  QuantityPrefix,
  ReferenceModifier,
  ResolveProfile,
  RevIncludeFor,
  SearchParamFor,
  SearchPrefixFor,
  SortDirection,
  StringModifier,
  TokenModifier,
  UriModifier,
} from "./types.js";

// Mock schema for type-level tests
type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id: string; name: string };
    Observation: { resourceType: "Observation"; id: string; code: string };
  };
  searchParams: {
    Patient: {
      name: { type: "string"; value: string };
      birthdate: { type: "date"; value: string };
      active: { type: "token"; value: string };
    };
    Observation: {
      code: { type: "token"; value: string };
      value_quantity: { type: "quantity"; value: string };
      _count: { type: "number"; value: number | string };
      "code-value-quantity": {
        type: "composite";
        value: string;
        components: {
          code: { type: "token"; value: string };
          "value-quantity": { type: "quantity"; value: string };
        };
      };
    };
  };
  includes: {
    Observation: {
      subject: "Patient";
      performer: "Practitioner";
    };
  };
  revIncludes: {
    Patient: {
      Observation: "subject";
    };
    Practitioner: {
      Observation: "performer";
    };
  };
  profiles: {
    Observation: {
      "vital-signs": { resourceType: "Observation"; id: string; code: string; category: string[] };
    };
  };
};

describe("type-level tests", () => {
  describe("SearchParamFor", () => {
    it("resolves search params for a known resource", () => {
      expectTypeOf<SearchParamFor<TestSchema, "Patient">>().toEqualTypeOf<TestSchema["searchParams"]["Patient"]>();
    });

    it("falls back to generic record for unknown resource", () => {
      type Result = SearchParamFor<TestSchema, "Unknown">;
      expectTypeOf<Result>().toEqualTypeOf<Record<string, SearchParam>>();
    });
  });

  describe("IncludeFor", () => {
    it("resolves includes for a known resource", () => {
      expectTypeOf<IncludeFor<TestSchema, "Observation">>().toEqualTypeOf<TestSchema["includes"]["Observation"]>();
    });

    it("falls back to generic record for unknown resource", () => {
      type Result = IncludeFor<TestSchema, "Patient">;
      expectTypeOf<Result>().toEqualTypeOf<Record<string, string>>();
    });
  });

  describe("RevIncludeFor", () => {
    it("resolves rev-includes for a known target resource", () => {
      expectTypeOf<RevIncludeFor<TestSchema, "Patient">>().toEqualTypeOf<{ Observation: "subject" }>();
    });

    it("falls back to generic record for unknown resource", () => {
      type Result = RevIncludeFor<TestSchema, "Unknown">;
      expectTypeOf<Result>().toEqualTypeOf<Record<string, string>>();
    });

    it("falls back to generic record when revIncludes is undefined", () => {
      type SchemaWithout = {
        resources: { Patient: { resourceType: "Patient" } };
        searchParams: Record<string, never>;
        includes: Record<string, never>;
        profiles: Record<string, never>;
      };
      type Result = RevIncludeFor<SchemaWithout, "Patient">;
      expectTypeOf<Result>().toEqualTypeOf<Record<string, string>>();
    });
  });

  describe("ProfileFor", () => {
    it("resolves profiles for a known resource", () => {
      expectTypeOf<ProfileFor<TestSchema, "Observation">>().toEqualTypeOf<TestSchema["profiles"]["Observation"]>();
    });

    it("returns empty record for resource without profiles", () => {
      expectTypeOf<ProfileFor<TestSchema, "Patient">>().toEqualTypeOf<Record<string, never>>();
    });
  });

  describe("ProfileNames", () => {
    it("extracts profile name literal for known resource", () => {
      expectTypeOf<ProfileNames<TestSchema, "Observation">>().toEqualTypeOf<"vital-signs">();
    });

    it("resolves to never for resource without profiles", () => {
      expectTypeOf<ProfileNames<TestSchema, "Patient">>().toBeNever();
    });
  });

  describe("ResolveProfile", () => {
    it("resolves profiled type when profile exists", () => {
      type Result = ResolveProfile<TestSchema, "Observation", "vital-signs">;
      expectTypeOf<Result>().toEqualTypeOf<TestSchema["profiles"]["Observation"]["vital-signs"]>();
    });

    it("falls back to base resource when profile is undefined", () => {
      type Result = ResolveProfile<TestSchema, "Observation", undefined>;
      expectTypeOf<Result>().toEqualTypeOf<TestSchema["resources"]["Observation"]>();
    });

    it("falls back to base resource for unknown profile", () => {
      type Result = ResolveProfile<TestSchema, "Observation", "unknown">;
      expectTypeOf<Result>().toEqualTypeOf<TestSchema["resources"]["Observation"]>();
    });
  });

  describe("SearchPrefixFor", () => {
    it("maps date param to DatePrefix", () => {
      expectTypeOf<SearchPrefixFor<{ type: "date" }>>().toEqualTypeOf<DatePrefix>();
    });

    it("maps number param to NumberPrefix", () => {
      expectTypeOf<SearchPrefixFor<{ type: "number" }>>().toEqualTypeOf<NumberPrefix>();
    });

    it("maps quantity param to QuantityPrefix", () => {
      expectTypeOf<SearchPrefixFor<{ type: "quantity" }>>().toEqualTypeOf<QuantityPrefix>();
    });

    it("maps string param to StringModifier", () => {
      expectTypeOf<SearchPrefixFor<{ type: "string" }>>().toEqualTypeOf<StringModifier>();
    });

    it("maps token param to TokenModifier", () => {
      expectTypeOf<SearchPrefixFor<{ type: "token" }>>().toEqualTypeOf<TokenModifier>();
    });

    it("maps reference param to ReferenceModifier", () => {
      expectTypeOf<SearchPrefixFor<{ type: "reference" }>>().toEqualTypeOf<ReferenceModifier>();
    });

    it("maps uri param to UriModifier", () => {
      expectTypeOf<SearchPrefixFor<{ type: "uri" }>>().toEqualTypeOf<UriModifier>();
    });

    it("falls back to eq for unknown param type", () => {
      expectTypeOf<SearchPrefixFor<{ type: "composite" }>>().toEqualTypeOf<"eq">();
    });
  });

  describe("CompositeKeys", () => {
    it("extracts composite param keys", () => {
      type Result = CompositeKeys<TestSchema["searchParams"]["Observation"]>;
      expectTypeOf<Result>().toEqualTypeOf<"code-value-quantity">();
    });

    it("returns never when no composite params exist", () => {
      type Result = CompositeKeys<TestSchema["searchParams"]["Patient"]>;
      expectTypeOf<Result>().toBeNever();
    });
  });

  describe("CompositeComponents", () => {
    it("extracts component types from a composite param", () => {
      type Param = TestSchema["searchParams"]["Observation"]["code-value-quantity"];
      type Result = CompositeComponents<Param>;
      expectTypeOf<Result>().toEqualTypeOf<{
        code: { type: "token"; value: string };
        "value-quantity": { type: "quantity"; value: string };
      }>();
    });

    it("returns never for non-composite param", () => {
      type Param = TestSchema["searchParams"]["Observation"]["code"];
      type Result = CompositeComponents<Param>;
      expectTypeOf<Result>().toBeNever();
    });
  });

  describe("CompositeValues", () => {
    it("maps composite components to their value types", () => {
      type Param = TestSchema["searchParams"]["Observation"]["code-value-quantity"];
      type Result = CompositeValues<Param>;
      expectTypeOf<Result>().toEqualTypeOf<{
        code: string;
        "value-quantity": string;
      }>();
    });

    it("returns never for non-composite param", () => {
      type Param = TestSchema["searchParams"]["Observation"]["code"];
      type Result = CompositeValues<Param>;
      expectTypeOf<Result>().toBeNever();
    });
  });

  describe("ParamValue", () => {
    it("extracts value type from search param", () => {
      expectTypeOf<ParamValue<{ type: "string"; value: string }>>().toBeString();
    });

    it("extracts number | string for number param", () => {
      expectTypeOf<ParamValue<{ type: "number"; value: number | string }>>().toEqualTypeOf<number | string>();
    });
  });

  describe("SortDirection", () => {
    it("is asc or desc", () => {
      expectTypeOf<SortDirection>().toEqualTypeOf<"asc" | "desc">();
    });
  });
});

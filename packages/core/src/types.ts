import type { IncludeRegistry, ProfileRegistry, SearchParam, SearchParamRegistry } from "@fhir-dsl/types";

// --- Extract search params for a given resource type ---

export type SearchParamFor<RT extends string> = RT extends keyof SearchParamRegistry
  ? SearchParamRegistry[RT]
  : Record<string, SearchParam>;

// --- Extract include params for a given resource type ---

export type IncludeFor<RT extends string> = RT extends keyof IncludeRegistry
  ? IncludeRegistry[RT]
  : Record<string, string>;

// --- Extract profiles for a given resource type ---

export type ProfileFor<RT extends string> = RT extends keyof ProfileRegistry
  ? ProfileRegistry[RT]
  : Record<string, never>;

export type ProfileNames<RT extends string> = RT extends keyof ProfileRegistry
  ? string & keyof ProfileRegistry[RT]
  : never;

export type ResolveProfile<
  RM extends Record<string, any>,
  RT extends string,
  P extends string | undefined,
> = P extends string
  ? RT extends keyof ProfileRegistry
    ? P extends keyof ProfileRegistry[RT]
      ? ProfileRegistry[RT][P]
      : RM[RT]
    : RM[RT]
  : RM[RT];

// --- Search prefix/operator types based on param type ---

export type DatePrefix = "eq" | "ne" | "gt" | "ge" | "lt" | "le" | "sa" | "eb" | "ap";
export type NumberPrefix = "eq" | "ne" | "gt" | "ge" | "lt" | "le";
export type QuantityPrefix = "eq" | "ne" | "gt" | "ge" | "lt" | "le" | "sa" | "eb" | "ap";
export type StringModifier = "eq" | "contains" | "exact";
export type TokenModifier = "eq" | "not" | "of-type" | "in" | "not-in" | "text" | "above" | "below";
export type ReferenceModifier = "eq";
export type UriModifier = "eq" | "above" | "below";

export type SearchPrefixFor<P extends SearchParam> = P extends { type: "date" }
  ? DatePrefix
  : P extends { type: "number" }
    ? NumberPrefix
    : P extends { type: "quantity" }
      ? QuantityPrefix
      : P extends { type: "string" }
        ? StringModifier
        : P extends { type: "token" }
          ? TokenModifier
          : P extends { type: "reference" }
            ? ReferenceModifier
            : P extends { type: "uri" }
              ? UriModifier
              : "eq";

// --- Extract value type from a search param ---

export type ParamValue<P extends SearchParam> = P["value"];

// --- Sort direction ---

export type SortDirection = "asc" | "desc";

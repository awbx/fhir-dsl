import { describe, expect, it } from "vitest";
import type { SpecCatalog } from "../spec/catalog.js";
import { makeFallbackCatalog } from "../spec/test-helpers.js";
import { emitDatatypes, emitPrimitives } from "./primitives-emitter.js";

function catalogWith(partial: Partial<SpecCatalog>): SpecCatalog {
  return { ...makeFallbackCatalog(), ...partial };
}

describe("emitPrimitives", () => {
  it("emits TS aliases for every primitive in the catalog", () => {
    const out = emitPrimitives(makeFallbackCatalog());
    expect(out).toContain("export type FhirString = string;");
    expect(out).toContain("export type FhirBoolean = boolean;");
    expect(out).toContain("export type FhirInteger = number;");
    expect(out).toContain("export type FhirDecimal = number;");
  });

  it("parameterizes FhirCode on a string type for narrowed bindings", () => {
    const out = emitPrimitives(makeFallbackCatalog());
    expect(out).toContain("export type FhirCode<T extends string = string> = T;");
  });

  it("sorts aliases alphabetically by primitive name", () => {
    const out = emitPrimitives(makeFallbackCatalog());
    const boolIdx = out.indexOf("FhirBoolean");
    const stringIdx = out.indexOf("FhirString");
    expect(boolIdx).toBeGreaterThan(-1);
    expect(stringIdx).toBeGreaterThan(-1);
    expect(boolIdx).toBeLessThan(stringIdx);
  });

  it("respects the catalog tsType for non-Fhir-prefixed primitives like integer64", () => {
    const catalog = catalogWith({
      primitives: new Map([["integer64", { name: "integer64", tsType: "integer64", rule: { kind: "integer" } }]]),
    });
    const out = emitPrimitives(catalog);
    expect(out).toContain("export type integer64 = number;");
  });
});

describe("emitDatatypes", () => {
  it("re-exports known datatypes from @fhir-dsl/types", () => {
    const out = emitDatatypes(makeFallbackCatalog());
    expect(out).toContain('from "@fhir-dsl/types"');
    expect(out).toContain("type Element");
    expect(out).toContain("type Extension");
    expect(out).toContain("type HumanName");
  });

  it("always re-exports the base abstract types even when absent from complexTypes", () => {
    const catalog = catalogWith({ complexTypes: new Map() });
    const out = emitDatatypes(catalog);
    expect(out).toContain("type DomainResource");
    expect(out).toContain("type Resource");
    expect(out).toContain("type Element");
    expect(out).toContain("type BackboneElement");
  });

  it("emits minimal Element-based fallback for unknown complex types", () => {
    const catalog = catalogWith({
      complexTypes: new Map([["MadeUpType", { name: "MadeUpType", isAbstract: false }]]),
    });
    const out = emitDatatypes(catalog);
    expect(out).toContain("export interface MadeUpType extends Element {}");
  });
});

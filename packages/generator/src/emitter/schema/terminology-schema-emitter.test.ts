import type { ResolvedValueSet } from "@fhir-dsl/terminology";
import { describe, expect, it } from "vitest";
import type { BindingTypeMap } from "../terminology-emitter.js";
import { nativeAdapter } from "./native.js";
import { emitTerminologySchemas } from "./terminology-schema-emitter.js";

function vs(url: string, name: string, codes: string[]): ResolvedValueSet {
  return {
    url,
    name,
    codes: codes.map((code) => ({ code })),
    isComplete: true,
  };
}

describe("emitTerminologySchemas", () => {
  it("emits closed enum schema for each ValueSet in the binding map", () => {
    const resolved = [
      vs("http://hl7.org/fhir/ValueSet/administrative-gender", "AdministrativeGender", [
        "male",
        "female",
        "other",
        "unknown",
      ]),
    ];
    const map: BindingTypeMap = new Map([
      ["http://hl7.org/fhir/ValueSet/administrative-gender", "AdministrativeGender"],
    ]);
    const out = emitTerminologySchemas(resolved, map, nativeAdapter);
    expect(out).toContain('import * as s from "./__runtime.js";');
    expect(out).toContain(
      'export const AdministrativeGenderSchema = s.enum(["male", "female", "other", "unknown"] as const);',
    );
  });

  it("skips ValueSets that aren't in the binding map", () => {
    const resolved = [
      vs("http://example.org/used", "Used", ["a", "b"]),
      vs("http://example.org/unused", "Unused", ["x"]),
    ];
    const map: BindingTypeMap = new Map([["http://example.org/used", "Used"]]);
    const out = emitTerminologySchemas(resolved, map, nativeAdapter);
    expect(out).toContain("UsedSchema");
    expect(out).not.toContain("UnusedSchema");
  });

  it("skips ValueSets with no codes", () => {
    const resolved = [vs("http://example.org/empty", "Empty", [])];
    const map: BindingTypeMap = new Map([["http://example.org/empty", "Empty"]]);
    const out = emitTerminologySchemas(resolved, map, nativeAdapter);
    expect(out).not.toContain("EmptySchema");
  });

  it("sorts schemas alphabetically by name", () => {
    const resolved = [vs("http://example.org/z", "ZebraCodes", ["z"]), vs("http://example.org/a", "AppleCodes", ["a"])];
    const map: BindingTypeMap = new Map([
      ["http://example.org/z", "ZebraCodes"],
      ["http://example.org/a", "AppleCodes"],
    ]);
    const out = emitTerminologySchemas(resolved, map, nativeAdapter);
    expect(out.indexOf("AppleCodesSchema")).toBeLessThan(out.indexOf("ZebraCodesSchema"));
  });

  it("deduplicates repeated names", () => {
    const resolved = [vs("http://example.org/v1", "Foo", ["a"]), vs("http://example.org/v2", "Foo", ["b"])];
    const map: BindingTypeMap = new Map([
      ["http://example.org/v1", "Foo"],
      ["http://example.org/v2", "Foo"],
    ]);
    const out = emitTerminologySchemas(resolved, map, nativeAdapter);
    const matches = out.match(/export const FooSchema/g);
    expect(matches?.length).toBe(1);
  });
});

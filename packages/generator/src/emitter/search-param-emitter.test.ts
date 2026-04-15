import { describe, expect, it } from "vitest";
import { emitSearchParamTypes, emitSearchParams } from "./search-param-emitter.js";

describe("emitSearchParams", () => {
  it("generates interface per resource type", () => {
    const params = new Map([
      ["Patient", { params: [{ code: "name", type: "string" }, { code: "birthdate", type: "date" }] }],
    ]);

    const output = emitSearchParams(params as any);

    expect(output).toContain("export interface PatientSearchParams");
    expect(output).toContain('"name": StringParam');
    expect(output).toContain('"birthdate": DateParam');
  });

  it("sorts resource types alphabetically", () => {
    const params = new Map([
      ["Observation", { params: [{ code: "code", type: "token" }] }],
      ["Account", { params: [{ code: "name", type: "string" }] }],
    ]);

    const output = emitSearchParams(params as any);

    const accountIdx = output.indexOf("AccountSearchParams");
    const obsIdx = output.indexOf("ObservationSearchParams");
    expect(accountIdx).toBeLessThan(obsIdx);
  });

  it("sorts params alphabetically within each resource", () => {
    const params = new Map([
      ["Patient", { params: [{ code: "name", type: "string" }, { code: "birthdate", type: "date" }, { code: "active", type: "token" }] }],
    ]);

    const output = emitSearchParams(params as any);

    const activeIdx = output.indexOf('"active"');
    const birthdateIdx = output.indexOf('"birthdate"');
    const nameIdx = output.indexOf('"name"');
    expect(activeIdx).toBeLessThan(birthdateIdx);
    expect(birthdateIdx).toBeLessThan(nameIdx);
  });

  it("maps all search param types correctly", () => {
    const params = new Map([
      ["Test", {
        params: [
          { code: "a", type: "string" },
          { code: "b", type: "token" },
          { code: "c", type: "date" },
          { code: "d", type: "reference" },
          { code: "e", type: "quantity" },
          { code: "f", type: "number" },
          { code: "g", type: "uri" },
          { code: "h", type: "composite" },
          { code: "i", type: "special" },
        ],
      }],
    ]);

    const output = emitSearchParams(params as any);

    expect(output).toContain("StringParam");
    expect(output).toContain("TokenParam");
    expect(output).toContain("DateParam");
    expect(output).toContain("ReferenceParam");
    expect(output).toContain("QuantityParam");
    expect(output).toContain("NumberParam");
    expect(output).toContain("UriParam");
    expect(output).toContain("CompositeParam");
    expect(output).toContain("SpecialParam");
  });

  it("imports search param type interfaces", () => {
    const output = emitSearchParams(new Map());
    expect(output).toContain('import type { StringParam');
    expect(output).toContain('from "./search-param-types.js"');
  });

  it("re-exports search param types", () => {
    const output = emitSearchParams(new Map());
    expect(output).toContain("export type { StringParam");
  });

  it("handles empty params map", () => {
    const output = emitSearchParams(new Map());
    expect(output).toBeDefined();
    expect(output).not.toContain("SearchParams {");
  });
});

describe("emitSearchParamTypes", () => {
  it("generates all search param type interfaces", () => {
    const output = emitSearchParamTypes();

    expect(output).toContain("export interface StringParam");
    expect(output).toContain("export interface TokenParam");
    expect(output).toContain("export interface DateParam");
    expect(output).toContain("export interface ReferenceParam");
    expect(output).toContain("export interface QuantityParam");
    expect(output).toContain("export interface NumberParam");
    expect(output).toContain("export interface UriParam");
    expect(output).toContain("export interface CompositeParam");
    expect(output).toContain("export interface SpecialParam");
  });

  it("each param has type and value fields", () => {
    const output = emitSearchParamTypes();

    expect(output).toContain('type: "string"');
    expect(output).toContain('type: "token"');
    expect(output).toContain('type: "date"');
    expect(output).toContain("value: string");
  });

  it("exports SearchParam union type", () => {
    const output = emitSearchParamTypes();
    expect(output).toContain("export type SearchParam =");
    expect(output).toContain("| StringParam");
    expect(output).toContain("| TokenParam");
  });

  it("NumberParam value allows number or string", () => {
    const output = emitSearchParamTypes();
    expect(output).toContain("value: number | string");
  });
});

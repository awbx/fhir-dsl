/**
 * Issue #51 — UCUM-aware Quantity equality, ordering, and conversion
 * for the common healthcare cases. Out-of-scope special units (Celsius,
 * pH, decibel) throw a clear error from the parser.
 */
import { describe, expect, it } from "vitest";
import {
  compatible,
  convert,
  parseUnit,
  quantityAdd,
  quantityCompare,
  quantityEqual,
  quantitySub,
  UcumError,
} from "../src/eval/_internal/ucum.js";
import { fhirpath } from "../src/index.js";

describe("UCUM unit parsing", () => {
  it("parses SI base units", () => {
    expect(parseUnit("m")).toEqual({ factor: 1, dim: { m: 1, g: 0, s: 0, mol: 0, K: 0, A: 0, cd: 0 } });
    expect(parseUnit("g")).toEqual({ factor: 1, dim: { m: 0, g: 1, s: 0, mol: 0, K: 0, A: 0, cd: 0 } });
  });

  it("applies SI prefixes (mg = 1e-3 g)", () => {
    const mg = parseUnit("mg");
    expect(mg?.factor).toBeCloseTo(1e-3);
    expect(mg?.dim.g).toBe(1);
  });

  it("recognises mixed-case and Greek micro", () => {
    expect(parseUnit("μg")?.factor).toBeCloseTo(1e-6);
    expect(parseUnit("ug")?.factor).toBeCloseTo(1e-6);
  });

  it("parses time units to seconds", () => {
    expect(parseUnit("min")?.factor).toBe(60);
    expect(parseUnit("h")?.factor).toBe(3600);
    expect(parseUnit("d")?.factor).toBe(86400);
    expect(parseUnit("a")?.factor).toBe(31557600);
  });

  it("parses pressure including the bracketed mm[Hg] form", () => {
    const mmHg = parseUnit("mmHg");
    const mmHgBracket = parseUnit("mm[Hg]");
    expect(mmHg).not.toBeNull();
    expect(mmHgBracket).toEqual(mmHg);
  });

  it("parses single-`/` compound units", () => {
    const mgdL = parseUnit("mg/dL");
    expect(mgdL).not.toBeNull();
    expect(mgdL?.dim).toEqual({ m: -3, g: 1, s: 0, mol: 0, K: 0, A: 0, cd: 0 });
  });

  it("parses unit exponents (m2, s-1, kg/m2)", () => {
    expect(parseUnit("m2")?.dim.m).toBe(2);
    expect(parseUnit("s-1")?.dim.s).toBe(-1);
    const kgPerM2 = parseUnit("kg/m2");
    expect(kgPerM2?.dim).toEqual({ m: -2, g: 1, s: 0, mol: 0, K: 0, A: 0, cd: 0 });
  });

  it("parses leading-`/` inverse units (/min)", () => {
    const perMin = parseUnit("/min");
    expect(perMin?.factor).toBeCloseTo(1 / 60);
    expect(perMin?.dim.s).toBe(-1);
  });

  it("returns null for unrecognised units instead of throwing", () => {
    expect(parseUnit("flibbertigibbets")).toBeNull();
    expect(parseUnit("totally-not-ucum")).toBeNull();
  });

  it("throws on documented offset/log units instead of silently wrong", () => {
    expect(() => parseUnit("Cel")).toThrow(UcumError);
    expect(() => parseUnit("[degF]")).toThrow(UcumError);
    expect(() => parseUnit("[pH]")).toThrow(UcumError);
    expect(() => parseUnit("dB")).toThrow(UcumError);
  });
});

describe("Quantity conversion", () => {
  it("5 mg → 0.005 g", () => {
    expect(convert(5, "mg", "g")).toBeCloseTo(0.005);
  });

  it("1 kg → 1000 g", () => {
    expect(convert(1, "kg", "g")).toBeCloseTo(1000);
  });

  it("1 L → 1000 mL", () => {
    expect(convert(1, "L", "mL")).toBeCloseTo(1000);
  });

  it("1 h → 3600 s", () => {
    expect(convert(1, "h", "s")).toBeCloseTo(3600);
  });

  it("760 mmHg ≈ 1 atm", () => {
    const result = convert(760, "mmHg", "atm");
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(1, 3);
  });

  it("returns null when dimensions are incompatible", () => {
    expect(convert(5, "mg", "mL")).toBeNull();
    expect(convert(1, "s", "m")).toBeNull();
  });

  it("returns null for unrecognised units (parser miss)", () => {
    expect(convert(1, "unknownunit", "g")).toBeNull();
  });
});

describe("Quantity comparison helpers", () => {
  it("equal quantities expressed in different units", () => {
    expect(quantityEqual({ value: 5, unit: "mg" }, { value: 0.005, unit: "g" })).toBe(true);
    expect(quantityEqual({ value: 1, unit: "kg" }, { value: 1000, unit: "g" })).toBe(true);
  });

  it("rejects incompatible-dimension comparisons (returns null)", () => {
    expect(quantityEqual({ value: 5, unit: "mg" }, { value: 5, unit: "mL" })).toBeNull();
  });

  it("orders same-dimension quantities", () => {
    expect(quantityCompare({ value: 5, unit: "mg" }, { value: 1, unit: "g" })).toBe(-1);
    expect(quantityCompare({ value: 5, unit: "g" }, { value: 5, unit: "g" })).toBe(0);
    expect(quantityCompare({ value: 1, unit: "g" }, { value: 999, unit: "mg" })).toBe(1);
  });

  it("adds and subtracts compatible quantities, expressing result in a's unit", () => {
    expect(quantityAdd({ value: 5, unit: "mg" }, { value: 0.001, unit: "g" })).toEqual({ value: 6, unit: "mg" });
    expect(quantitySub({ value: 1, unit: "kg" }, { value: 500, unit: "g" })).toEqual({ value: 0.5, unit: "kg" });
    expect(quantityAdd({ value: 5, unit: "mg" }, { value: 1, unit: "L" })).toBeNull();
  });

  it("compatible() is reflexive and dimension-typed", () => {
    expect(compatible(parseUnit("mg")!, parseUnit("g")!)).toBe(true);
    expect(compatible(parseUnit("mmHg")!, parseUnit("Pa")!)).toBe(true);
    expect(compatible(parseUnit("mg")!, parseUnit("mL")!)).toBe(false);
  });
});

describe("FHIRPath integration — Quantity eq/lt/gt with UCUM", () => {
  type TestObs = {
    resourceType: "Observation";
    valueQuantity?: { value: number; unit?: string; code?: string };
  };
  function fp() {
    return fhirpath<TestObs>("Observation");
  }

  it("`5 mg = 0.005 g` returns true via FHIRPath where()-equality", () => {
    const obs: TestObs = {
      resourceType: "Observation",
      valueQuantity: { value: 5, unit: "mg" },
    };
    // Filter the singleton against an explicit Quantity literal.
    const expr = fp()
      .valueQuantity.where(($this) => $this.eq({ value: 0.005, unit: "g" } as never))
      .exists();
    expect(expr.evaluate(obs)).toEqual([true]);
  });

  it("`5 mg < 1 g` returns true via FHIRPath where()-ordering", () => {
    const obs: TestObs = {
      resourceType: "Observation",
      valueQuantity: { value: 5, unit: "mg" },
    };
    const expr = fp()
      .valueQuantity.where(($this) => $this.lt({ value: 1, unit: "g" } as never))
      .exists();
    expect(expr.evaluate(obs)).toEqual([true]);
  });

  it("incompatible-dimension Quantity equality falls back to structural", () => {
    // 5 mg ≠ 5 mL — different dimensions, so structural property-set
    // equality is asked, which fails on unit string.
    const obs: TestObs = {
      resourceType: "Observation",
      valueQuantity: { value: 5, unit: "mg" },
    };
    const expr = fp()
      .valueQuantity.where(($this) => $this.eq({ value: 5, unit: "mL" } as never))
      .exists();
    expect(expr.evaluate(obs)).toEqual([false]);
  });

  it("prefers Quantity.code over Quantity.unit when both present", () => {
    // FHIR convention: code is the UCUM symbol; unit is the human display.
    const obs: TestObs = {
      resourceType: "Observation",
      valueQuantity: { value: 5, unit: "milligrams", code: "mg" },
    };
    const expr = fp()
      .valueQuantity.where(($this) => $this.eq({ value: 0.005, unit: "grams", code: "g" } as never))
      .exists();
    expect(expr.evaluate(obs)).toEqual([true]);
  });
});

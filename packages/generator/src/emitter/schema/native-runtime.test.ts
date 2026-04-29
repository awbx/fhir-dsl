import { validateInvariants } from "@fhir-dsl/fhirpath";
import { describe, expect, it } from "vitest";
import * as s from "./native-runtime.js";

describe("native-runtime", () => {
  it("string schema accepts strings and rejects non-strings", () => {
    const schema = s.string();
    expect(schema["~standard"].validate("ok")).toEqual({ value: "ok" });
    const bad = schema["~standard"].validate(42);
    expect("issues" in bad && bad.issues).toBeDefined();
  });

  it("string schema enforces regex", () => {
    const schema = s.string({ regex: /^[a-z]+$/ });
    expect(schema["~standard"].validate("abc")).toEqual({ value: "abc" });
    const bad = schema["~standard"].validate("ABC");
    expect("issues" in bad && bad.issues).toBeDefined();
  });

  it("number schema with int + min", () => {
    const schema = s.number({ int: true, min: 1 });
    expect(schema["~standard"].validate(5)).toEqual({ value: 5 });
    const notInt = schema["~standard"].validate(1.5);
    expect("issues" in notInt && notInt.issues).toBeDefined();
    const tooLow = schema["~standard"].validate(0);
    expect("issues" in tooLow && tooLow.issues).toBeDefined();
  });

  it("literal schema checks exact value", () => {
    const schema = s.literal("Patient");
    expect(schema["~standard"].validate("Patient")).toEqual({ value: "Patient" });
    const bad = schema["~standard"].validate("Observation");
    expect("issues" in bad && bad.issues).toBeDefined();
  });

  it("enum schema closed (no extensible)", () => {
    const schema = s.enum(["male", "female"] as const);
    expect(schema["~standard"].validate("male")).toEqual({ value: "male" });
    const bad = schema["~standard"].validate("other");
    expect("issues" in bad && bad.issues).toBeDefined();
  });

  it("enum schema extensible admits any string", () => {
    const schema = s.enum(["a", "b"] as const, true);
    expect(schema["~standard"].validate("a")).toEqual({ value: "a" });
    expect(schema["~standard"].validate("zzz")).toEqual({ value: "zzz" });
  });

  it("object schema enforces required fields and accepts optionals", () => {
    const schema = s.object({
      resourceType: { schema: s.literal("Patient"), optional: false },
      active: { schema: s.boolean(), optional: true },
    });
    const good = schema["~standard"].validate({ resourceType: "Patient", active: true });
    expect(good).toEqual({ value: { resourceType: "Patient", active: true } });

    const missing = schema["~standard"].validate({ active: true });
    expect("issues" in missing && missing.issues).toBeDefined();
  });

  it("object schema preserves unknown fields (permissive)", () => {
    const schema = s.object({
      id: { schema: s.string(), optional: true },
    });
    const result = schema["~standard"].validate({ id: "x", extra: "kept" });
    expect("value" in result && result.value).toEqual({ id: "x", extra: "kept" });
  });

  it("array schema validates each element and enforces min items", () => {
    const schema = s.array(s.string(), 1);
    expect(schema["~standard"].validate(["a", "b"])).toEqual({ value: ["a", "b"] });
    const empty = schema["~standard"].validate([]);
    expect("issues" in empty && empty.issues).toBeDefined();
    const wrong = schema["~standard"].validate(["a", 2]);
    expect("issues" in wrong && wrong.issues).toBeDefined();
  });

  it("union schema accepts any matching variant", () => {
    const schema = s.union([s.string(), s.number()]);
    expect(schema["~standard"].validate("hi")).toEqual({ value: "hi" });
    expect(schema["~standard"].validate(3)).toEqual({ value: 3 });
    const bad = schema["~standard"].validate(true);
    expect("issues" in bad && bad.issues).toBeDefined();
  });

  it("lazy schema defers evaluation", () => {
    let called = 0;
    const inner = s.string();
    const schema = s.lazy(() => {
      called++;
      return inner;
    });
    expect(called).toBe(0);
    expect(schema["~standard"].validate("x")).toEqual({ value: "x" });
    expect(called).toBe(1);
    schema["~standard"].validate("y");
    expect(called).toBe(1); // memoized
  });

  it("extend merges base shape with additional fields", () => {
    const base = s.object({
      id: { schema: s.string(), optional: true },
      name: { schema: s.string(), optional: true },
    });
    const extended = s.extend(base, {
      id: { schema: s.string(), optional: false }, // now required
      age: { schema: s.number(), optional: true }, // new field
    });
    const good = extended["~standard"].validate({ id: "abc", age: 30 });
    expect("value" in good && good.value).toBeTruthy();

    const missingId = extended["~standard"].validate({ age: 30 });
    expect("issues" in missingId && missingId.issues).toBeDefined();
  });

  it("standard schema version and vendor are set", () => {
    const schema = s.string();
    expect(schema["~standard"].version).toBe(1);
    expect(schema["~standard"].vendor).toBe("fhir-dsl");
  });

  it("refine runs only after structural validation succeeds", () => {
    const base = s.object({ a: { schema: s.string(), optional: false } });
    const refined = s.refine(base, (v) =>
      typeof (v as { a: string }).a === "string" && (v as { a: string }).a.length === 0
        ? [{ message: "a must be non-empty" }]
        : [],
    );

    // Structural failure short-circuits; refiner not invoked.
    const structural = refined["~standard"].validate({});
    expect("issues" in structural && structural.issues?.[0]?.message).toBe("missing required field");

    // Structural pass + refiner failure surfaces refiner issue.
    const refinerFail = refined["~standard"].validate({ a: "" });
    expect("issues" in refinerFail && refinerFail.issues?.[0]?.message).toBe("a must be non-empty");

    // Both pass.
    const ok = refined["~standard"].validate({ a: "hello" });
    expect("value" in ok).toBe(true);
  });

  it("refine integrates with FHIRPath invariant evaluator (pat-1 exit criterion)", () => {
    const PatientContactInvariants = [
      {
        key: "pat-1",
        severity: "error" as const,
        human: "SHALL at least contain a contact's details or a reference to an organization",
        expression: "name.exists() or telecom.exists() or address.exists() or organization.exists()",
      },
    ];

    const PatientContactSchema = s.refine(s.object({}), (value) => {
      const oo = validateInvariants(value, PatientContactInvariants);
      return oo.issue.filter((issue) => issue.severity === "error").map((issue) => ({ message: issue.diagnostics }));
    });

    const violating = PatientContactSchema["~standard"].validate({});
    expect("issues" in violating && violating.issues?.[0]?.message).toContain("contact's details");

    const passing = PatientContactSchema["~standard"].validate({ name: { family: "Smith" } });
    expect("value" in passing).toBe(true);
  });
});

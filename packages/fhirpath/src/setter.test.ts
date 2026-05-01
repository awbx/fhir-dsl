import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";
import { FhirPathSetterError } from "./setter.js";
import type { TestPatient } from "./test-types.js";

function fp() {
  return fhirpath<TestPatient>("Patient");
}

describe("setValue — plain navigation", () => {
  it("replaces a leaf value", () => {
    const before: TestPatient = {
      resourceType: "Patient",
      birthDate: "1990-01-15",
    };
    const after = fp().birthDate.setValue(before, "2000-12-31");
    expect(after.birthDate).toBe("2000-12-31");
    // Original untouched.
    expect(before.birthDate).toBe("1990-01-15");
  });

  it("creates intermediate objects on a missing path", () => {
    const before = { resourceType: "Patient" } as TestPatient;
    const after = fp().birthDate.setValue(before, "1980-04-12");
    expect(after.birthDate).toBe("1980-04-12");
  });
});

describe("setValue — where(predicate) finds or creates the matching element", () => {
  it("issue #50 example: updates the `official` name's given list", () => {
    const before: TestPatient = {
      resourceType: "Patient",
      name: [{ use: "official", given: ["max"] }],
    };
    const after = fp()
      .name.where(($this) => $this.use.eq("official"))
      .given.setValue(before, ["maximilian"]);
    expect(after.name).toEqual([{ use: "official", given: ["maximilian"] }]);
  });

  it("issue #50 example: creates the matching element when the array is missing", () => {
    const before = { resourceType: "Patient" } as TestPatient;
    const after = fp()
      .name.where(($this) => $this.use.eq("official"))
      .given.setValue(before, ["maximilian"]);
    expect(after.name).toEqual([{ use: "official", given: ["maximilian"] }]);
  });

  it("preserves siblings when updating one matching element", () => {
    const before: TestPatient = {
      resourceType: "Patient",
      name: [
        { use: "official", given: ["max"] },
        { use: "nickname", given: ["m"] },
      ],
    };
    const after = fp()
      .name.where(($this) => $this.use.eq("nickname"))
      .given.setValue(before, ["maxie"]);
    expect(after.name?.[0]).toEqual({ use: "official", given: ["max"] });
    expect(after.name?.[1]).toEqual({ use: "nickname", given: ["maxie"] });
  });

  it("appends a new element when no match is found", () => {
    const before: TestPatient = {
      resourceType: "Patient",
      name: [{ use: "official", given: ["max"] }],
    };
    const after = fp()
      .name.where(($this) => $this.use.eq("nickname"))
      .given.setValue(before, ["maxie"]);
    expect(after.name).toHaveLength(2);
    expect(after.name?.[1]).toEqual({ use: "nickname", given: ["maxie"] });
  });
});

describe("setValue — error surface", () => {
  it("throws on filter ops that cannot be inverted", () => {
    expect(() =>
      fp()
        .name.first()
        .setValue({ resourceType: "Patient" } as TestPatient, "x" as never),
    ).toThrow(FhirPathSetterError);
  });

  it("throws on or-joined predicates", () => {
    expect(() =>
      fp()
        .name.where(($this) => $this.use.eq("official").or($this.use.eq("nickname")))
        .given.setValue({ resourceType: "Patient" } as TestPatient, []),
    ).toThrow(FhirPathSetterError);
  });
});

describe("createPatch — RFC 6902 output", () => {
  it("emits replace for an existing leaf", () => {
    const before: TestPatient = { resourceType: "Patient", birthDate: "1990-01-15" };
    const patch = fp().birthDate.createPatch(before, "2000-12-31");
    expect(patch).toEqual([{ op: "replace", path: "/birthDate", value: "2000-12-31" }]);
  });

  it("emits add for missing intermediate + final write", () => {
    const before = { resourceType: "Patient" } as TestPatient;
    const patch = fp()
      .name.where(($this) => $this.use.eq("official"))
      .given.createPatch(before, ["maximilian"]);
    // Seed array with predicate template in a single `add`, then write the leaf.
    expect(patch).toHaveLength(2);
    expect(patch[0]).toEqual({ op: "add", path: "/name", value: [{ use: "official" }] });
    expect(patch[1]).toEqual({ op: "add", path: "/name/0/given", value: ["maximilian"] });
  });

  it("escapes JSON Pointer special chars (~ and /)", () => {
    const before = { resourceType: "Patient", "we/ird~name": "x" } as unknown as Record<string, unknown>;
    // Construct a builder whose nav targets the weird key. Use the proxy
    // accessor directly — TS doesn't know about the field, but the proxy
    // accepts any string.
    const expr = (fp() as unknown as Record<string, { createPatch(r: unknown, v: unknown): unknown }>)["we/ird~name"]!;
    const patch = expr.createPatch(before, "y") as Array<{ path: string }>;
    expect(patch[0]?.path).toBe("/we~1ird~0name");
  });
});

import { describe, expect, it } from "vitest";
import { validateResource } from "../src/commands/validate.js";

describe("validateResource", () => {
  it("accepts a well-formed Patient", () => {
    const issues = validateResource({ resourceType: "Patient", id: "123" });
    expect(issues).toEqual([]);
  });

  it("rejects non-object roots", () => {
    expect(validateResource(null)[0]?.severity).toBe("error");
    expect(validateResource([1, 2, 3])[0]?.severity).toBe("error");
    expect(validateResource("hi")[0]?.severity).toBe("error");
  });

  it("rejects missing resourceType", () => {
    const issues = validateResource({});
    expect(issues).toContainEqual(expect.objectContaining({ severity: "error", path: "$.resourceType" }));
  });

  it("warns on unknown resourceType", () => {
    const issues = validateResource({ resourceType: "NotAResource" });
    expect(issues).toContainEqual(expect.objectContaining({ severity: "warning", path: "$.resourceType" }));
  });

  it("rejects non-string id", () => {
    const issues = validateResource({ resourceType: "Patient", id: 123 });
    expect(issues).toContainEqual(expect.objectContaining({ severity: "error", path: "$.id" }));
  });

  it("rejects Bundle.entry that isn't an array", () => {
    const issues = validateResource({ resourceType: "Bundle", entry: { foo: 1 } });
    expect(issues).toContainEqual(expect.objectContaining({ severity: "error", path: "$.entry" }));
  });

  it("rejects NaN / Infinity in numeric leaves", () => {
    const issues = validateResource({
      resourceType: "Observation",
      valueQuantity: { value: Number.POSITIVE_INFINITY },
    });
    expect(issues.some((i) => i.severity === "error" && i.path.includes("value"))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { FhirError } from "./errors.js";

describe("FhirError", () => {
  it("creates error with status and statusText", () => {
    const err = new FhirError(404, "Not Found");

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("FhirError");
    expect(err.status).toBe(404);
    expect(err.statusText).toBe("Not Found");
    expect(err.message).toContain("404 Not Found");
  });

  it("extracts diagnostics from OperationOutcome", () => {
    const outcome = {
      resourceType: "OperationOutcome" as const,
      issue: [{ severity: "error" as const, code: "not-found", diagnostics: "Patient/999 not found" }],
    };

    const err = new FhirError(404, "Not Found", outcome);

    expect(err.message).toContain("Patient/999 not found");
    expect(err.operationOutcome).toBe(outcome);
  });

  it("extracts details text when diagnostics is missing", () => {
    const outcome = {
      resourceType: "OperationOutcome" as const,
      issue: [{ severity: "error" as const, code: "forbidden", details: { text: "Access denied" } }],
    };

    const err = new FhirError(403, "Forbidden", outcome);

    expect(err.message).toContain("Access denied");
  });

  it("falls back to status text when no outcome details", () => {
    const outcome = {
      resourceType: "OperationOutcome" as const,
      issue: [{ severity: "error" as const, code: "unknown" }],
    };

    const err = new FhirError(500, "Internal Server Error", outcome);

    expect(err.message).toContain("500 Internal Server Error");
  });

  it("handles null operationOutcome", () => {
    const err = new FhirError(500, "Internal Server Error", null);

    expect(err.message).toContain("500 Internal Server Error");
    expect(err.issues).toEqual([]);
  });

  it("exposes issues array", () => {
    const outcome = {
      resourceType: "OperationOutcome" as const,
      issue: [
        { severity: "error" as const, code: "invalid" },
        { severity: "warning" as const, code: "informational" },
      ],
    };

    const err = new FhirError(400, "Bad Request", outcome);

    expect(err.issues).toHaveLength(2);
    expect(err.issues[0]!.severity).toBe("error");
  });
});

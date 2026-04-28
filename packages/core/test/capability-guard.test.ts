import { describe, expect, it, vi } from "vitest";
import {
  type CapabilityStatementShape,
  capabilityGuardFromUrl,
  createCapabilityGuard,
} from "../src/capability-guard.js";

const stmt: CapabilityStatementShape = {
  resourceType: "CapabilityStatement",
  rest: [
    {
      mode: "server",
      interaction: [{ code: "transaction" }],
      resource: [
        {
          type: "Patient",
          interaction: [{ code: "read" }, { code: "search-type" }, { code: "create" }, { code: "update" }],
          conditionalUpdate: true,
          searchParam: [
            { name: "name", type: "string" },
            { name: "birthdate", type: "date" },
          ],
          supportedProfile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
        },
        {
          type: "Observation",
          interaction: [{ code: "read" }, { code: "search-type" }],
        },
      ],
    },
  ],
};

describe("createCapabilityGuard", () => {
  it("supports advertised interactions per resource", () => {
    const g = createCapabilityGuard(stmt);
    expect(g.supports("read", "Patient")).toBe(true);
    expect(g.supports("update", "Patient")).toBe(true);
    expect(g.supports("delete", "Patient")).toBe(false);
    expect(g.supports("update", "Observation")).toBe(false);
  });

  it("supports system-level interactions", () => {
    const g = createCapabilityGuard(stmt);
    expect(g.supports("transaction")).toBe(true);
    expect(g.supports("batch")).toBe(false);
  });

  it("treats missing resources as supported by default (forgiving)", () => {
    const g = createCapabilityGuard(stmt);
    expect(g.supports("read", "Encounter")).toBe(true);
  });

  it("treats missing resources as unsupported when opt-in strict", () => {
    const g = createCapabilityGuard(stmt, { assumeMissingSupportsAll: false });
    expect(g.supports("read", "Encounter")).toBe(false);
  });

  it("throws on check() when configured", () => {
    const g = createCapabilityGuard(stmt, { onUnsupported: "throw" });
    expect(() => g.check("delete", "Patient")).toThrow(/does not advertise 'delete' on Patient/);
    expect(g.check("read", "Patient")).toBe(true);
  });

  it("warns on check() by default", () => {
    const g = createCapabilityGuard(stmt);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(g.check("delete", "Patient")).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("does not advertise 'delete'"));
    warn.mockRestore();
  });

  it("ignores when configured", () => {
    const g = createCapabilityGuard(stmt, { onUnsupported: "ignore" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(g.check("delete", "Patient")).toBe(false);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("exposes search params + supported profiles", () => {
    const g = createCapabilityGuard(stmt);
    expect(g.searchParamsFor("Patient")).toEqual(["name", "birthdate"]);
    expect(g.supportedProfilesFor("Patient")).toContain(
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
    );
    expect(g.searchParamsFor("Encounter")).toEqual([]);
  });

  it("conditional flags", () => {
    const g = createCapabilityGuard(stmt);
    expect(g.supportsConditional("Patient", "update")).toBe(true);
    expect(g.supportsConditional("Patient", "delete")).toBe(false);
  });
});

describe("capabilityGuardFromUrl", () => {
  it("fetches metadata and constructs a guard", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => stmt,
    })) as unknown as typeof fetch;
    const g = await capabilityGuardFromUrl("https://example/baseR4", { onUnsupported: "ignore" }, fetcher);
    expect(g.supports("read", "Patient")).toBe(true);
  });

  it("rejects when the URL returns non-OK", async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: "Server Error",
    })) as unknown as typeof fetch;
    await expect(
      capabilityGuardFromUrl("https://example/baseR4", { onUnsupported: "ignore" }, fetcher),
    ).rejects.toThrow(/500 Server Error/);
  });

  it("rejects when response is not a CapabilityStatement", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ resourceType: "OperationOutcome" }),
    })) as unknown as typeof fetch;
    await expect(
      capabilityGuardFromUrl("https://example/baseR4", { onUnsupported: "ignore" }, fetcher),
    ).rejects.toThrow(/not a CapabilityStatement/);
  });
});

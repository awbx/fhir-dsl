import { describe, expect, it, vi } from "vitest";
import { capabilityCommand } from "../src/commands/capability.js";

const fakeStatement = {
  resourceType: "CapabilityStatement",
  url: "http://example/CapabilityStatement",
  version: "1.0.0",
  name: "Example",
  publisher: "ACME",
  fhirVersion: "4.0.1",
  format: ["json", "xml"],
  rest: [
    {
      mode: "server",
      interaction: [{ code: "transaction" }, { code: "search-system" }],
      resource: [
        {
          type: "Patient",
          interaction: [{ code: "read" }, { code: "search-type" }],
          versioning: "versioned",
          readHistory: true,
          updateCreate: false,
          searchParam: [{ name: "name", type: "string" }],
        },
        {
          type: "Observation",
          interaction: [{ code: "read" }],
          searchParam: [
            { name: "code", type: "token" },
            { name: "date", type: "date" },
          ],
        },
      ],
    },
  ],
};

describe("fhir-gen capability", () => {
  it("prints a summary table for the server's CapabilityStatement", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => fakeStatement,
    }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await capabilityCommand.parseAsync(["node", "fhir-gen", "https://example.test/baseR4"]);

    expect(fetchMock).toHaveBeenCalledWith("https://example.test/baseR4/metadata", {
      headers: { accept: "application/fhir+json" },
    });
    const lines = log.mock.calls.map((c) => String(c[0]));
    const joined = lines.join("\n");
    expect(joined).toContain("Server: ACME");
    expect(joined).toContain("FHIR 4.0.1");
    expect(joined).toContain("Patient");
    expect(joined).toContain("[read,search-type]");
    expect(joined).toContain("vers=versioned");
    expect(joined).toContain("read-history");
    expect(joined).toContain("Observation");

    log.mockRestore();
    vi.unstubAllGlobals();
  });

  it("dumps raw JSON when --json is passed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, status: 200, statusText: "OK", json: async () => fakeStatement })),
    );
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await capabilityCommand.parseAsync(["node", "fhir-gen", "--json", "https://example.test/baseR4"]);
    const out = log.mock.calls.map((c) => String(c[0])).join("\n");
    expect(out).toContain('"resourceType": "CapabilityStatement"');
    log.mockRestore();
    vi.unstubAllGlobals();
  });
});

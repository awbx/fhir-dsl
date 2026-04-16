import { describe, expect, it, vi } from "vitest";
import { discoverSmartConfiguration } from "./discovery.js";
import { DiscoveryError } from "./errors.js";

function mockFetch(body: unknown, status = 200): typeof globalThis.fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  })) as unknown as typeof globalThis.fetch;
}

const MIN: Record<string, unknown> = {
  authorization_endpoint: "https://auth.example/authorize",
  token_endpoint: "https://auth.example/token",
  capabilities: ["launch-ehr", "client-confidential-symmetric"],
  code_challenge_methods_supported: ["S256"],
};

describe("discoverSmartConfiguration", () => {
  it("fetches the well-known URL with Accept: application/json", async () => {
    const fetch = mockFetch(MIN);
    await discoverSmartConfiguration("https://fhir.example/r4", { fetch });
    const [url, opts] = (fetch as any).mock.calls[0];
    expect(url).toBe("https://fhir.example/r4/.well-known/smart-configuration");
    expect(opts.headers.Accept).toBe("application/json");
    expect(opts.method).toBe("GET");
  });

  it("strips a trailing slash from the base URL", async () => {
    const fetch = mockFetch(MIN);
    await discoverSmartConfiguration("https://fhir.example/r4/", { fetch });
    const [url] = (fetch as any).mock.calls[0];
    expect(url).toBe("https://fhir.example/r4/.well-known/smart-configuration");
  });

  it("returns the parsed configuration", async () => {
    const fetch = mockFetch(MIN);
    const cfg = await discoverSmartConfiguration("https://fhir.example/r4", { fetch });
    expect(cfg.authorization_endpoint).toBe("https://auth.example/authorize");
    expect(cfg.token_endpoint).toBe("https://auth.example/token");
  });

  it("throws DiscoveryError on non-ok response", async () => {
    const fetch = mockFetch({}, 404);
    await expect(discoverSmartConfiguration("https://fhir.example/r4", { fetch })).rejects.toBeInstanceOf(
      DiscoveryError,
    );
  });

  it("throws when required endpoints are missing", async () => {
    const fetch = mockFetch({ capabilities: [], code_challenge_methods_supported: [] });
    await expect(discoverSmartConfiguration("https://fhir.example/r4", { fetch })).rejects.toThrow(/missing/);
  });
});

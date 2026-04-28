import { describe, expect, it, vi } from "vitest";
import { createAuthResolver } from "../src/auth.js";

describe("createAuthResolver — bearer", () => {
  it("returns empty headers when no strategy is set", async () => {
    const resolver = createAuthResolver(undefined);
    expect(await resolver.authorize()).toEqual({});
  });

  it("formats a static bearer token", async () => {
    const resolver = createAuthResolver({ kind: "bearer", token: "abc.def.ghi" });
    expect(await resolver.authorize()).toEqual({ Authorization: "Bearer abc.def.ghi" });
  });

  it("calls a thunk for dynamic bearer tokens", async () => {
    let calls = 0;
    const resolver = createAuthResolver({
      kind: "bearer",
      token: () => {
        calls++;
        return `tok-${calls}`;
      },
    });
    expect((await resolver.authorize()).Authorization).toBe("Bearer tok-1");
    expect((await resolver.authorize()).Authorization).toBe("Bearer tok-2");
  });
});

let backendCtorCount = 0;
function resetBackendCtorCount() {
  backendCtorCount = 0;
}

vi.mock("@fhir-dsl/smart", async () => {
  class BackendServicesAuth {
    constructor(public readonly cfg: unknown) {
      backendCtorCount++;
    }
    async getAuthorization() {
      return "Bearer backend-token";
    }
    async onUnauthorized() {}
  }
  return {
    BackendServicesAuth,
    discoverSmartConfiguration: vi.fn(async () => ({
      token_endpoint: "https://discovered/token",
      authorization_endpoint: "https://discovered/auth",
      capabilities: [],
    })),
    refreshToken: vi.fn(async () => ({
      access_token: "refreshed-access",
      token_type: "Bearer",
      expires_in: 600,
      refresh_token: "rotated-refresh",
    })),
  };
});

vi.mock("jose", async () => ({
  importPKCS8: vi.fn(async () => ({ kind: "fake-key" })),
}));

describe("createAuthResolver — backend-services", () => {
  it("lazy-loads smart + jose and returns a Bearer header from BackendServicesAuth", async () => {
    const resolver = createAuthResolver({
      kind: "backend-services",
      issuer: "https://fhir.example/baseR4",
      clientId: "my-client",
      privateKey: "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----",
      alg: "RS384",
      scope: "system/Patient.r",
    });
    const headers = await resolver.authorize();
    expect(headers.Authorization).toBe("Bearer backend-token");
  });

  it("reuses the underlying provider across calls so token caching survives", async () => {
    resetBackendCtorCount();
    const resolver = createAuthResolver({
      kind: "backend-services",
      issuer: "https://fhir.example/baseR4",
      clientId: "client",
      privateKey: "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----",
    });
    await resolver.authorize();
    await resolver.authorize();

    expect(backendCtorCount).toBe(1);
  });
});

describe("createAuthResolver — patient-launch", () => {
  it("exchanges the refresh token via smart and returns a Bearer header", async () => {
    const resolver = createAuthResolver({
      kind: "patient-launch",
      issuer: "https://fhir.example/baseR4",
      clientId: "patient-client",
      refreshToken: "initial-refresh",
      scope: "patient/*.read",
    });
    expect(await resolver.authorize()).toEqual({ Authorization: "Bearer refreshed-access" });
  });

  it("caches the access token and only refreshes when expired", async () => {
    const smart = await import("@fhir-dsl/smart");
    const refreshSpy = vi.mocked(smart.refreshToken);
    const before = refreshSpy.mock.calls.length;

    const resolver = createAuthResolver({
      kind: "patient-launch",
      issuer: "https://fhir.example/baseR4",
      clientId: "client",
      refreshToken: "rt",
    });
    await resolver.authorize();
    await resolver.authorize();

    expect(refreshSpy.mock.calls.length - before).toBe(1);
  });

  it("rotates the refresh token when smart hands back a new one", async () => {
    const smart = await import("@fhir-dsl/smart");
    const refreshSpy = vi.mocked(smart.refreshToken);

    // First refresh expires immediately so the next authorize() will
    // re-call smart with the rotated token.
    refreshSpy
      .mockResolvedValueOnce({
        access_token: "first-access",
        token_type: "Bearer",
        expires_in: -1,
        refresh_token: "rotated-refresh",
      } as unknown as Awaited<ReturnType<typeof smart.refreshToken>>)
      .mockResolvedValueOnce({
        access_token: "second-access",
        token_type: "Bearer",
        expires_in: 600,
        refresh_token: "third-refresh",
      } as unknown as Awaited<ReturnType<typeof smart.refreshToken>>);

    const resolver = createAuthResolver({
      kind: "patient-launch",
      issuer: "https://fhir.example/baseR4",
      clientId: "client",
      refreshToken: "first-refresh",
    });

    await resolver.authorize(); // consumes the first mock
    await resolver.authorize(); // expired, consumes the second mock with rotated token

    // The most recent refresh call should have been with the rotated token
    // returned by the first response.
    const lastArgs = refreshSpy.mock.calls[refreshSpy.mock.calls.length - 1]?.[0];
    expect(lastArgs?.refreshToken).toBe("rotated-refresh");
  });
});

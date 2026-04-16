import { describe, expect, it, vi } from "vitest";
import { type AuthProvider, isStaticAuth, resolveAuthProvider } from "./auth.js";
import { performRequest } from "./http.js";

describe("resolveAuthProvider", () => {
  it("returns undefined when no auth is configured", () => {
    expect(resolveAuthProvider(undefined)).toBeUndefined();
  });

  it("converts a static bearer tuple into a provider that emits 'Bearer …'", async () => {
    const provider = resolveAuthProvider({ type: "bearer", credentials: "tok" })!;
    expect(await provider.getAuthorization({ url: "x", method: "GET" })).toBe("Bearer tok");
  });

  it("converts a static basic tuple into a provider that emits 'Basic …'", async () => {
    const provider = resolveAuthProvider({ type: "basic", credentials: "abc" })!;
    expect(await provider.getAuthorization({ url: "x", method: "GET" })).toBe("Basic abc");
  });

  it("passes a live AuthProvider through unchanged", () => {
    const live: AuthProvider = { getAuthorization: async () => "Bearer live" };
    expect(resolveAuthProvider(live)).toBe(live);
  });
});

describe("isStaticAuth", () => {
  it("recognizes the static tuple form", () => {
    expect(isStaticAuth({ type: "bearer", credentials: "x" })).toBe(true);
  });
  it("returns false for AuthProvider objects", () => {
    expect(isStaticAuth({ getAuthorization: async () => "Bearer y" } as AuthProvider)).toBe(false);
  });
});

describe("performRequest", () => {
  it("attaches the Authorization header from the provider", async () => {
    const fetch = vi.fn(
      async () => new Response("{}", { status: 200, statusText: "OK" }),
    ) as unknown as typeof globalThis.fetch;
    await performRequest(
      { baseUrl: "x", auth: { type: "bearer", credentials: "tok" }, fetch },
      { url: "https://x/y", method: "GET" },
    );
    const [, opts] = (fetch as any).mock.calls[0];
    expect(opts.headers.Authorization).toBe("Bearer tok");
  });

  it("retries once on 401 after calling onUnauthorized()", async () => {
    let call = 0;
    const token = ["stale", "fresh"];
    const provider: AuthProvider = {
      getAuthorization: async () => `Bearer ${token[call++] ?? "fresh"}`,
      onUnauthorized: vi.fn(),
    };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("unauthorized", { status: 401, statusText: "Unauthorized" }))
      .mockResolvedValueOnce(
        new Response("{}", { status: 200, statusText: "OK" }),
      ) as unknown as typeof globalThis.fetch;

    const response = await performRequest(
      { baseUrl: "x", auth: provider, fetch },
      { url: "https://x/y", method: "GET" },
    );
    expect(response.status).toBe(200);
    expect(provider.onUnauthorized).toHaveBeenCalledOnce();
    expect((fetch as any).mock.calls.length).toBe(2);
  });

  it("does not retry when the provider has no onUnauthorized handler", async () => {
    const provider: AuthProvider = { getAuthorization: async () => "Bearer stale" };
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response("unauthorized", { status: 401 })) as unknown as typeof globalThis.fetch;
    const response = await performRequest(
      { baseUrl: "x", auth: provider, fetch },
      { url: "https://x/y", method: "GET" },
    );
    expect(response.status).toBe(401);
    expect((fetch as any).mock.calls.length).toBe(1);
  });

  it("passes the request URL and method to the provider", async () => {
    const provider: AuthProvider = { getAuthorization: vi.fn(async () => "Bearer x") };
    const fetch = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof globalThis.fetch;
    await performRequest({ baseUrl: "x", auth: provider, fetch }, { url: "https://fhir/z", method: "POST" });
    expect(provider.getAuthorization).toHaveBeenCalledWith({ url: "https://fhir/z", method: "POST" });
  });
});

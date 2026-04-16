import { describe, expect, it, vi } from "vitest";
import { buildAuthorizeUrl, exchangeCode, refreshToken } from "./authorize.js";
import { SmartAuthError } from "./errors.js";

const smartConfig = {
  authorization_endpoint: "https://auth.example/authorize",
  token_endpoint: "https://auth.example/token",
};

describe("buildAuthorizeUrl", () => {
  it("includes all SMART v2 required params", () => {
    const url = new URL(
      buildAuthorizeUrl({
        smartConfig,
        clientId: "app-123",
        redirectUri: "https://app.example/cb",
        scope: "launch/patient openid fhirUser patient/Observation.rs offline_access",
        state: "s-12345678901234567890",
        codeChallenge: "chal",
        aud: "https://fhir.example/r4",
      }),
    );
    expect(url.origin + url.pathname).toBe("https://auth.example/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("app-123");
    expect(url.searchParams.get("redirect_uri")).toBe("https://app.example/cb");
    expect(url.searchParams.get("scope")).toContain("patient/Observation.rs");
    expect(url.searchParams.get("state")).toBe("s-12345678901234567890");
    expect(url.searchParams.get("aud")).toBe("https://fhir.example/r4");
    expect(url.searchParams.get("code_challenge")).toBe("chal");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("adds launch param when provided", () => {
    const url = new URL(
      buildAuthorizeUrl({
        smartConfig,
        clientId: "a",
        redirectUri: "https://x",
        scope: "openid",
        state: "s",
        codeChallenge: "c",
        aud: "https://y",
        launch: "ehr-launch-token",
      }),
    );
    expect(url.searchParams.get("launch")).toBe("ehr-launch-token");
  });

  it("omits launch param when not provided", () => {
    const url = new URL(
      buildAuthorizeUrl({
        smartConfig,
        clientId: "a",
        redirectUri: "https://x",
        scope: "openid",
        state: "s",
        codeChallenge: "c",
        aud: "https://y",
      }),
    );
    expect(url.searchParams.has("launch")).toBe(false);
  });

  it("passes through extra provider-specific params", () => {
    const url = new URL(
      buildAuthorizeUrl({
        smartConfig,
        clientId: "a",
        redirectUri: "https://x",
        scope: "openid",
        state: "s",
        codeChallenge: "c",
        aud: "https://y",
        extra: { organization: "org-42" },
      }),
    );
    expect(url.searchParams.get("organization")).toBe("org-42");
  });
});

function mockTokenFetch(body: unknown, status = 200): typeof globalThis.fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  })) as unknown as typeof globalThis.fetch;
}

describe("exchangeCode", () => {
  it("POSTs form-encoded body with PKCE verifier", async () => {
    const fetch = mockTokenFetch({ access_token: "a", token_type: "Bearer", scope: "openid", expires_in: 3600 });
    const resp = await exchangeCode({
      smartConfig,
      clientId: "app-123",
      redirectUri: "https://app.example/cb",
      code: "auth-code-xyz",
      codeVerifier: "ver-verifier-that-is-long-enough-xxxxxxxxx",
      fetch,
    });

    expect(resp.access_token).toBe("a");
    const [url, opts] = (fetch as any).mock.calls[0];
    expect(url).toBe(smartConfig.token_endpoint);
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    const body = new URLSearchParams(opts.body);
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("auth-code-xyz");
    expect(body.get("redirect_uri")).toBe("https://app.example/cb");
    expect(body.get("code_verifier")).toBe("ver-verifier-that-is-long-enough-xxxxxxxxx");
    expect(body.get("client_id")).toBe("app-123");
  });

  it("adds Basic auth header when clientSecret is supplied", async () => {
    const fetch = mockTokenFetch({ access_token: "a", token_type: "Bearer", scope: "o" });
    await exchangeCode({
      smartConfig,
      clientId: "app-123",
      clientSecret: "sekret",
      redirectUri: "https://app.example/cb",
      code: "c",
      codeVerifier: "v",
      fetch,
    });
    const [, opts] = (fetch as any).mock.calls[0];
    expect(opts.headers.Authorization).toMatch(/^Basic /);
  });

  it("throws SmartAuthError on 400 with OAuth2 body", async () => {
    const fetch = mockTokenFetch({ error: "invalid_grant", error_description: "bad code" }, 400);
    await expect(
      exchangeCode({
        smartConfig,
        clientId: "a",
        redirectUri: "https://x",
        code: "c",
        codeVerifier: "v",
        fetch,
      }),
    ).rejects.toMatchObject({ name: "SmartAuthError", error: "invalid_grant", errorDescription: "bad code" });
  });

  it("throws SmartAuthError when response lacks access_token", async () => {
    const fetch = mockTokenFetch({ nope: true });
    await expect(
      exchangeCode({
        smartConfig,
        clientId: "a",
        redirectUri: "https://x",
        code: "c",
        codeVerifier: "v",
        fetch,
      }),
    ).rejects.toBeInstanceOf(SmartAuthError);
  });
});

describe("refreshToken", () => {
  it("POSTs refresh_token grant with optional scope", async () => {
    const fetch = mockTokenFetch({ access_token: "new", token_type: "Bearer", scope: "openid", expires_in: 3600 });
    await refreshToken({
      smartConfig,
      clientId: "app-123",
      refreshToken: "rt-abc",
      scope: "openid patient/Observation.r",
      fetch,
    });
    const [, opts] = (fetch as any).mock.calls[0];
    const body = new URLSearchParams(opts.body);
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("rt-abc");
    expect(body.get("scope")).toBe("openid patient/Observation.r");
  });
});

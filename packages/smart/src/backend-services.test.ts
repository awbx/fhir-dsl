import { exportJWK, generateKeyPair, jwtVerify } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BackendServicesAuth } from "./backend-services.js";
import type { SmartConfiguration } from "./types.js";

const smartConfig: SmartConfiguration = {
  authorization_endpoint: "https://auth.example/authorize",
  token_endpoint: "https://auth.example/token",
  capabilities: ["client-confidential-asymmetric"],
  code_challenge_methods_supported: ["S256"],
};

interface Keys {
  privateKey: import("jose").KeyLike;
  publicKey: import("jose").KeyLike;
}

let keys: Keys;
beforeEach(async () => {
  const { privateKey, publicKey } = await generateKeyPair("ES384");
  keys = { privateKey: privateKey as import("jose").KeyLike, publicKey: publicKey as import("jose").KeyLike };
});

function mockTokenFetch(response: unknown, status = 200) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => response,
  })) as unknown as typeof globalThis.fetch;
}

describe("BackendServicesAuth", () => {
  it("signs a client_assertion with the SMART-mandated claim set", async () => {
    const fetch = mockTokenFetch({
      access_token: "at-1",
      token_type: "bearer",
      scope: "system/Observation.rs",
      expires_in: 300,
    });
    const auth = new BackendServicesAuth({
      issuer: "https://fhir.example/r4",
      clientId: "backend-app",
      scope: "system/Observation.rs",
      privateKey: keys.privateKey,
      alg: "ES384",
      kid: "test-key",
      smartConfig,
      fetch,
    });
    const header = await auth.getAuthorization();
    expect(header).toBe("Bearer at-1");

    const [, opts] = (fetch as any).mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    const body = new URLSearchParams(opts.body);
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("scope")).toBe("system/Observation.rs");
    expect(body.get("client_assertion_type")).toBe("urn:ietf:params:oauth:client-assertion-type:jwt-bearer");

    const assertion = body.get("client_assertion")!;
    const { payload, protectedHeader } = await jwtVerify(assertion, keys.publicKey);
    expect(protectedHeader.alg).toBe("ES384");
    expect(protectedHeader.typ).toBe("JWT");
    expect(protectedHeader.kid).toBe("test-key");
    expect(payload.iss).toBe("backend-app");
    expect(payload.sub).toBe("backend-app");
    expect(payload.aud).toBe(smartConfig.token_endpoint);
    expect(typeof payload.jti).toBe("string");
    expect(typeof payload.exp).toBe("number");
    expect(typeof payload.iat).toBe("number");
    expect(payload.exp! - payload.iat!).toBeLessThanOrEqual(300);
  });

  it("caches tokens until they're about to expire", async () => {
    const fetch = mockTokenFetch({
      access_token: "at-1",
      token_type: "bearer",
      scope: "s",
      expires_in: 300,
    });
    const auth = new BackendServicesAuth({
      issuer: "https://fhir.example/r4",
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      smartConfig,
      fetch,
    });
    await auth.getAuthorization();
    await auth.getAuthorization();
    await auth.getAuthorization();
    expect((fetch as any).mock.calls.length).toBe(1);
  });

  it("renews after expiry using the skew window", async () => {
    let t = 1_000_000;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ access_token: "first", token_type: "bearer", scope: "s", expires_in: 60 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ access_token: "second", token_type: "bearer", scope: "s", expires_in: 60 }),
      }) as unknown as typeof globalThis.fetch;
    const auth = new BackendServicesAuth({
      issuer: "https://fhir.example/r4",
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      smartConfig,
      clockSkewSec: 10,
      fetch,
      now: () => t,
    });
    expect(await auth.getAuthorization()).toBe("Bearer first");
    // Advance past (exp - skew): 60s issued, skew=10s → renew at t + 50s.
    t += 51_000;
    expect(await auth.getAuthorization()).toBe("Bearer second");
    expect((fetch as any).mock.calls.length).toBe(2);
  });

  it("clears cached token on onUnauthorized()", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ access_token: "first", token_type: "bearer", scope: "s", expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ access_token: "second", token_type: "bearer", scope: "s", expires_in: 3600 }),
      }) as unknown as typeof globalThis.fetch;
    const auth = new BackendServicesAuth({
      issuer: "https://fhir.example/r4",
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      smartConfig,
      fetch,
    });
    expect(await auth.getAuthorization()).toBe("Bearer first");
    await auth.onUnauthorized();
    expect(await auth.getAuthorization()).toBe("Bearer second");
  });

  it("accepts a JWK private key", async () => {
    const { privateKey, publicKey } = await generateKeyPair("RS384");
    const jwk = await exportJWK(privateKey);
    const fetch = mockTokenFetch({ access_token: "a", token_type: "bearer", scope: "s", expires_in: 300 });
    const auth = new BackendServicesAuth({
      issuer: "https://fhir.example/r4",
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: jwk,
      alg: "RS384",
      smartConfig,
      fetch,
    });
    await auth.getAuthorization();
    const [, opts] = (fetch as any).mock.calls[0];
    const assertion = new URLSearchParams(opts.body).get("client_assertion")!;
    await expect(jwtVerify(assertion, publicKey)).resolves.toBeDefined();
  });
});

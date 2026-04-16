import { describe, expect, it, vi } from "vitest";
import { SmartAuthError } from "./errors.js";
import { SmartClient } from "./smart-client.js";

const smartConfig = {
  authorization_endpoint: "https://auth.example/authorize",
  token_endpoint: "https://auth.example/token",
};

describe("SmartClient", () => {
  it("returns the initial access token without contacting the network", async () => {
    const fetch = vi.fn();
    const client = new SmartClient({
      smartConfig,
      clientId: "app",
      tokens: { access_token: "initial", token_type: "Bearer", scope: "openid", expires_in: 3600 },
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    expect(await client.getAuthorization()).toBe("Bearer initial");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("auto-refreshes when the access token is within the clock-skew window", async () => {
    let t = 1_000_000;
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ access_token: "refreshed", token_type: "Bearer", scope: "openid", expires_in: 3600 }),
    }) as unknown as typeof globalThis.fetch;
    const client = new SmartClient({
      smartConfig,
      clientId: "app",
      tokens: {
        access_token: "initial",
        token_type: "Bearer",
        scope: "openid",
        expires_in: 60,
        refresh_token: "rt-1",
      },
      clockSkewSec: 10,
      fetch,
      now: () => t,
    });

    expect(await client.getAuthorization()).toBe("Bearer initial");
    t += 51_000;
    expect(await client.getAuthorization()).toBe("Bearer refreshed");
    expect((fetch as any).mock.calls.length).toBe(1);

    const [, opts] = (fetch as any).mock.calls[0];
    const body = new URLSearchParams(opts.body);
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("rt-1");
  });

  it("throws when the access token is expired and no refresh_token is available", async () => {
    let t = 1_000_000;
    const client = new SmartClient({
      smartConfig,
      clientId: "app",
      tokens: { access_token: "initial", token_type: "Bearer", scope: "openid", expires_in: 60 },
      now: () => t,
    });
    t += 120_000;
    await expect(client.getAuthorization()).rejects.toBeInstanceOf(SmartAuthError);
  });

  it("coalesces concurrent getAuthorization callers onto a single refresh round-trip", async () => {
    let t = 1_000_000;
    const fetch = vi.fn().mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                statusText: "OK",
                json: async () => ({
                  access_token: "refreshed",
                  token_type: "Bearer",
                  scope: "openid",
                  expires_in: 3600,
                }),
              }),
            5,
          );
        }),
    ) as unknown as typeof globalThis.fetch;
    const client = new SmartClient({
      smartConfig,
      clientId: "app",
      tokens: {
        access_token: "initial",
        token_type: "Bearer",
        scope: "openid",
        expires_in: 60,
        refresh_token: "rt",
      },
      fetch,
      now: () => t,
    });
    t += 120_000;
    const [a, b, c] = await Promise.all([
      client.getAuthorization(),
      client.getAuthorization(),
      client.getAuthorization(),
    ]);
    expect(a).toBe("Bearer refreshed");
    expect(b).toBe("Bearer refreshed");
    expect(c).toBe("Bearer refreshed");
    expect((fetch as any).mock.calls.length).toBe(1);
  });

  it("preserves the previous refresh_token if the server does not rotate it", async () => {
    let t = 1_000_000;
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ access_token: "new", token_type: "Bearer", scope: "openid", expires_in: 3600 }),
    }) as unknown as typeof globalThis.fetch;
    const client = new SmartClient({
      smartConfig,
      clientId: "app",
      tokens: {
        access_token: "initial",
        token_type: "Bearer",
        scope: "openid",
        expires_in: 60,
        refresh_token: "rt-keep",
      },
      fetch,
      now: () => t,
    });
    t += 120_000;
    await client.getAuthorization();
    expect(client.tokens.refresh_token).toBe("rt-keep");
  });

  it("exposes launch context accessors", () => {
    const client = new SmartClient({
      smartConfig,
      clientId: "app",
      tokens: {
        access_token: "a",
        token_type: "Bearer",
        scope: "launch/patient",
        expires_in: 3600,
        patient: "pat-123",
        encounter: "enc-1",
        id_token: "id-jwt",
        fhirContext: [{ reference: "Location/room-1" }],
      },
    });
    expect(client.patientId).toBe("pat-123");
    expect(client.encounterId).toBe("enc-1");
    expect(client.idToken).toBe("id-jwt");
    expect(client.fhirContext).toEqual([{ reference: "Location/room-1" }]);
    expect(client.scope).toBe("launch/patient");
  });

  it("onUnauthorized forces a refresh on the next call", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ access_token: "after-401", token_type: "Bearer", scope: "openid", expires_in: 3600 }),
    }) as unknown as typeof globalThis.fetch;
    const client = new SmartClient({
      smartConfig,
      clientId: "app",
      tokens: {
        access_token: "initial",
        token_type: "Bearer",
        scope: "openid",
        expires_in: 3600,
        refresh_token: "rt",
      },
      fetch,
    });
    expect(await client.getAuthorization()).toBe("Bearer initial");
    await client.onUnauthorized();
    expect(await client.getAuthorization()).toBe("Bearer after-401");
  });
});

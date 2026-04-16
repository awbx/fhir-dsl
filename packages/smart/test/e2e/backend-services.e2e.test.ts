import { createFhirClient } from "@fhir-dsl/core";
import { generateKeyPair, jwtVerify, type KeyLike } from "jose";
import { beforeEach, describe, expect, it } from "vitest";
import { BackendServicesAuth, discoverSmartConfiguration } from "../../src/index.js";
import {
  AUTH_BASE,
  bundleOneAlice,
  type E2ESchema,
  FHIR_BASE,
  smartConfigFixture,
  TOKEN_URL,
  WELL_KNOWN_URL,
} from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";

const PATIENT_URL = `${FHIR_BASE}/Patient`;

let keys: { privateKey: KeyLike; publicKey: KeyLike };
let mock: MockFetch;

beforeEach(async () => {
  const kp = await generateKeyPair("ES384");
  keys = { privateKey: kp.privateKey as KeyLike, publicKey: kp.publicKey as KeyLike };
  mock = new MockFetch();
});

function registerWellKnown(): void {
  mock.onGet(WELL_KNOWN_URL, () => MockFetch.json(smartConfigFixture));
}

function registerTokenEndpoint(sequence: Array<{ access_token: string; expires_in?: number }>): void {
  let i = 0;
  mock.onPost(TOKEN_URL, () => {
    const token = sequence[Math.min(i, sequence.length - 1)]!;
    i++;
    return MockFetch.json({
      access_token: token.access_token,
      token_type: "bearer",
      scope: "system/Patient.rs system/Observation.rs",
      expires_in: token.expires_in ?? 300,
    });
  });
}

describe("SMART e2e / Backend Services", () => {
  it("drives the full discovery → assertion → token → FHIR flow", async () => {
    registerWellKnown();
    registerTokenEndpoint([{ access_token: "at-1", expires_in: 300 }]);
    mock.onGet(PATIENT_URL, () => MockFetch.fhirJson(bundleOneAlice));

    const smartConfig = await discoverSmartConfiguration(FHIR_BASE, { fetch: mock.fetch });
    expect(smartConfig.token_endpoint).toBe(TOKEN_URL);

    const auth = new BackendServicesAuth({
      issuer: FHIR_BASE,
      clientId: "backend-app",
      scope: "system/Patient.rs system/Observation.rs",
      privateKey: keys.privateKey,
      alg: "ES384",
      kid: "e2e-key",
      smartConfig,
      fetch: mock.fetch,
    });

    const client = createFhirClient<E2ESchema>({
      baseUrl: FHIR_BASE,
      auth,
      fetch: mock.fetch,
    });

    const result = await client.search("Patient").execute();
    expect(result.data[0]?.id).toBe("pat-alice");

    const tokenReq = mock.requests.find((r) => r.method === "POST" && r.url === TOKEN_URL);
    expect(tokenReq).toBeDefined();
    expect(tokenReq!.headers["content-type"]).toBe("application/x-www-form-urlencoded");
    const body = new URLSearchParams(tokenReq!.body ?? "");
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("scope")).toBe("system/Patient.rs system/Observation.rs");
    expect(body.get("client_assertion_type")).toBe("urn:ietf:params:oauth:client-assertion-type:jwt-bearer");

    const assertion = body.get("client_assertion")!;
    const { payload, protectedHeader } = await jwtVerify(assertion, keys.publicKey);
    expect(protectedHeader.alg).toBe("ES384");
    expect(protectedHeader.kid).toBe("e2e-key");
    expect(payload.iss).toBe("backend-app");
    expect(payload.sub).toBe("backend-app");
    expect(payload.aud).toBe(TOKEN_URL);

    const fhirReq = mock.requests.find((r) => r.method === "GET" && r.url.startsWith(PATIENT_URL));
    expect(fhirReq).toBeDefined();
    expect(fhirReq!.headers.authorization).toBe("Bearer at-1");
  });

  it("caches the access token across many FHIR calls", async () => {
    registerWellKnown();
    registerTokenEndpoint([{ access_token: "at-cached", expires_in: 3600 }]);
    mock.onGet(PATIENT_URL, () => MockFetch.fhirJson(bundleOneAlice));

    const auth = new BackendServicesAuth({
      issuer: FHIR_BASE,
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      fetch: mock.fetch,
    });
    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth, fetch: mock.fetch });

    await client.search("Patient").execute();
    await client.search("Patient").execute();
    await client.search("Patient").execute();

    expect(mock.countRequests("POST", TOKEN_URL)).toBe(1);
    expect(mock.countRequests("GET", PATIENT_URL)).toBe(3);
  });

  it("refetches the token after expiry (clock-skew aware)", async () => {
    let now = 1_700_000_000_000;
    registerWellKnown();
    registerTokenEndpoint([
      { access_token: "first", expires_in: 60 },
      { access_token: "second", expires_in: 60 },
    ]);
    mock.onGet(PATIENT_URL, () => MockFetch.fhirJson(bundleOneAlice));

    const auth = new BackendServicesAuth({
      issuer: FHIR_BASE,
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      smartConfig: smartConfigFixture,
      clockSkewSec: 10,
      fetch: mock.fetch,
      now: () => now,
    });
    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth, fetch: mock.fetch });

    await client.search("Patient").execute();
    now += 51_000;
    await client.search("Patient").execute();

    expect(mock.countRequests("POST", TOKEN_URL)).toBe(2);
    const fhirCalls = mock.requests.filter((r) => r.url.startsWith(PATIENT_URL));
    expect(fhirCalls).toHaveLength(2);
    expect(fhirCalls[0]!.headers.authorization).toBe("Bearer first");
    expect(fhirCalls[1]!.headers.authorization).toBe("Bearer second");
  });

  it("coalesces concurrent refreshes onto a single token request", async () => {
    registerWellKnown();
    let tokenHits = 0;
    mock.onPost(TOKEN_URL, async () => {
      tokenHits++;
      // Simulate a slow auth server so parallel callers overlap.
      await new Promise((r) => setTimeout(r, 10));
      return MockFetch.json({
        access_token: "only-one",
        token_type: "bearer",
        scope: "s",
        expires_in: 3600,
      });
    });
    mock.onGet(PATIENT_URL, () => MockFetch.fhirJson(bundleOneAlice));

    const auth = new BackendServicesAuth({
      issuer: FHIR_BASE,
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      fetch: mock.fetch,
    });
    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth, fetch: mock.fetch });

    await Promise.all([
      client.search("Patient").execute(),
      client.search("Patient").execute(),
      client.search("Patient").execute(),
    ]);

    expect(tokenHits).toBe(1);
  });

  it("surfaces a SmartAuthError when the token endpoint rejects the assertion", async () => {
    registerWellKnown();
    mock.onPost(TOKEN_URL, () =>
      MockFetch.json(
        { error: "invalid_client", error_description: "bad signature" },
        { status: 401, statusText: "Unauthorized" },
      ),
    );

    const auth = new BackendServicesAuth({
      issuer: FHIR_BASE,
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      fetch: mock.fetch,
    });

    await expect(auth.getAuthorization()).rejects.toMatchObject({
      name: "SmartAuthError",
      error: "invalid_client",
      errorDescription: "bad signature",
      status: 401,
    });
  });

  it("discovery surfaces DiscoveryError on 404", async () => {
    mock.onGet(WELL_KNOWN_URL, () => new Response("not found", { status: 404, statusText: "Not Found" }));
    await expect(discoverSmartConfiguration(FHIR_BASE, { fetch: mock.fetch })).rejects.toMatchObject({
      name: "DiscoveryError",
      status: 404,
    });
  });

  it("discovery URL is built under the FHIR base", async () => {
    registerWellKnown();
    await discoverSmartConfiguration(FHIR_BASE, { fetch: mock.fetch });
    expect(mock.requests[0]!.url).toBe(WELL_KNOWN_URL);
    expect(mock.requests[0]!.url.startsWith(AUTH_BASE)).toBe(false);
  });
});

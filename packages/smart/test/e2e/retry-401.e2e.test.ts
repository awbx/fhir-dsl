import { createFhirClient } from "@fhir-dsl/core";
import { generateKeyPair, type KeyLike } from "jose";
import { beforeEach, describe, expect, it } from "vitest";
import { BackendServicesAuth, SmartClient } from "../../src/index.js";
import { bundleOneAlice, type E2ESchema, FHIR_BASE, smartConfigFixture, TOKEN_URL } from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";

const PATIENT_URL = `${FHIR_BASE}/Patient`;

let mock: MockFetch;
let keys: { privateKey: KeyLike; publicKey: KeyLike };

beforeEach(async () => {
  mock = new MockFetch();
  const kp = await generateKeyPair("ES384");
  keys = { privateKey: kp.privateKey as KeyLike, publicKey: kp.publicKey as KeyLike };
});

describe("SMART e2e / 401 retry", () => {
  it("BackendServicesAuth: 401 triggers onUnauthorized, new token fetched, request retried once", async () => {
    let tokenHits = 0;
    mock.onPost(TOKEN_URL, () => {
      tokenHits++;
      return MockFetch.json({
        access_token: `at-${tokenHits}`,
        token_type: "bearer",
        scope: "system/Patient.r",
        expires_in: 3600,
      });
    });

    let fhirHits = 0;
    mock.onGet(PATIENT_URL, () => {
      fhirHits++;
      if (fhirHits === 1) {
        return MockFetch.fhirJson(
          { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "login" }] },
          { status: 401, statusText: "Unauthorized" },
        );
      }
      return MockFetch.fhirJson(bundleOneAlice);
    });

    const auth = new BackendServicesAuth({
      issuer: FHIR_BASE,
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      smartConfig: smartConfigFixture,
      fetch: mock.fetch,
    });
    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth, fetch: mock.fetch });

    const result = await client.search("Patient").execute();
    expect(result.data[0]?.id).toBe("pat-alice");

    expect(tokenHits).toBe(2);
    expect(fhirHits).toBe(2);
    const fhirReqs = mock.requests.filter((r) => r.method === "GET" && r.url.startsWith(PATIENT_URL));
    expect(fhirReqs[0]!.headers.authorization).toBe("Bearer at-1");
    expect(fhirReqs[1]!.headers.authorization).toBe("Bearer at-2");
  });

  it("SmartClient: 401 triggers refresh_token exchange, request retried once", async () => {
    mock.onPost(TOKEN_URL, (req) => {
      const body = new URLSearchParams(req.body ?? "");
      expect(body.get("grant_type")).toBe("refresh_token");
      return MockFetch.json({
        access_token: "at-refreshed",
        token_type: "bearer",
        scope: "patient/Patient.rs",
        expires_in: 3600,
      });
    });

    let fhirHits = 0;
    mock.onGet(PATIENT_URL, () => {
      fhirHits++;
      if (fhirHits === 1) {
        return MockFetch.fhirJson({}, { status: 401, statusText: "Unauthorized" });
      }
      return MockFetch.fhirJson(bundleOneAlice);
    });

    const smart = new SmartClient({
      smartConfig: smartConfigFixture,
      clientId: "c",
      tokens: {
        access_token: "at-stale",
        token_type: "bearer",
        scope: "patient/Patient.rs",
        expires_in: 3600,
        refresh_token: "rt-1",
      },
      fetch: mock.fetch,
    });
    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth: smart, fetch: mock.fetch });

    await client.search("Patient").execute();

    expect(fhirHits).toBe(2);
    expect(mock.countRequests("POST", TOKEN_URL)).toBe(1);
    const fhirReqs = mock.requests.filter((r) => r.method === "GET" && r.url.startsWith(PATIENT_URL));
    expect(fhirReqs[0]!.headers.authorization).toBe("Bearer at-stale");
    expect(fhirReqs[1]!.headers.authorization).toBe("Bearer at-refreshed");
  });

  it("does not loop forever when the server keeps returning 401", async () => {
    mock.onPost(TOKEN_URL, () =>
      MockFetch.json({
        access_token: "at-broken",
        token_type: "bearer",
        scope: "system/Patient.r",
        expires_in: 3600,
      }),
    );
    let fhirHits = 0;
    mock.onGet(PATIENT_URL, () => {
      fhirHits++;
      return MockFetch.fhirJson(
        { resourceType: "OperationOutcome", issue: [{ severity: "error" }] },
        { status: 401, statusText: "Unauthorized" },
      );
    });

    const auth = new BackendServicesAuth({
      issuer: FHIR_BASE,
      clientId: "c",
      scope: "system/Patient.r",
      privateKey: keys.privateKey,
      alg: "ES384",
      smartConfig: smartConfigFixture,
      fetch: mock.fetch,
    });
    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth, fetch: mock.fetch });

    await expect(client.search("Patient").execute()).rejects.toMatchObject({ status: 401 });
    expect(fhirHits).toBe(2);
  });
});

import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildAuthorizeUrl,
  buildScopes,
  codeChallengeS256,
  exchangeCode,
  fhirUser,
  generateCodeVerifier,
  generateState,
  launchScope,
  offlineAccess,
  openid,
  resourceScope,
  SmartClient,
  type TokenResponse,
} from "../../src/index.js";
import { AUTHORIZE_URL, bundleOneAlice, type E2ESchema, FHIR_BASE, smartConfigFixture, TOKEN_URL } from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";

const REDIRECT_URI = "https://app.example/callback";
const CLIENT_ID = "browser-app";
const PATIENT_URL = `${FHIR_BASE}/Patient`;

let mock: MockFetch;
beforeEach(() => {
  mock = new MockFetch();
});

describe("SMART e2e / App Launch (PKCE)", () => {
  it("completes the full authorize-URL → code exchange → authenticated FHIR call flow", async () => {
    const scope = buildScopes(
      openid,
      fhirUser,
      offlineAccess,
      launchScope("patient"),
      resourceScope({ context: "patient", resource: "Patient", perms: ["r", "s"] }),
      resourceScope({ context: "patient", resource: "Observation", perms: ["r", "s"] }),
    );
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await codeChallengeS256(codeVerifier);

    const url = new URL(
      buildAuthorizeUrl({
        smartConfig: smartConfigFixture,
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scope,
        state,
        codeChallenge,
        aud: FHIR_BASE,
      }),
    );
    expect(url.origin + url.pathname).toBe(AUTHORIZE_URL);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(url.searchParams.get("redirect_uri")).toBe(REDIRECT_URI);
    expect(url.searchParams.get("scope")).toBe(scope);
    expect(url.searchParams.get("state")).toBe(state);
    expect(url.searchParams.get("aud")).toBe(FHIR_BASE);
    expect(url.searchParams.get("code_challenge")).toBe(codeChallenge);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");

    const tokens: TokenResponse = {
      access_token: "at-1",
      token_type: "bearer",
      scope,
      expires_in: 3600,
      refresh_token: "rt-1",
      id_token: "eyJ.fake.idtoken",
      patient: "pat-alice",
      encounter: "enc-1",
    };
    mock.onPost(TOKEN_URL, (req) => {
      const body = new URLSearchParams(req.body ?? "");
      expect(body.get("grant_type")).toBe("authorization_code");
      expect(body.get("code")).toBe("authcode-xyz");
      expect(body.get("redirect_uri")).toBe(REDIRECT_URI);
      expect(body.get("code_verifier")).toBe(codeVerifier);
      expect(body.get("client_id")).toBe(CLIENT_ID);
      return MockFetch.json(tokens);
    });
    mock.onGet(PATIENT_URL, () => MockFetch.fhirJson(bundleOneAlice));

    const exchanged = await exchangeCode({
      smartConfig: smartConfigFixture,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      code: "authcode-xyz",
      codeVerifier,
      fetch: mock.fetch,
    });

    const smart = new SmartClient({
      smartConfig: smartConfigFixture,
      clientId: CLIENT_ID,
      tokens: exchanged,
      fetch: mock.fetch,
    });
    expect(smart.patientId).toBe("pat-alice");
    expect(smart.encounterId).toBe("enc-1");
    expect(smart.idToken).toBe("eyJ.fake.idtoken");

    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth: smart, fetch: mock.fetch });
    const result = await client.search("Patient").execute();
    expect(result.data[0]?.id).toBe("pat-alice");

    const fhirReq = mock.requests.find((r) => r.method === "GET" && r.url.startsWith(PATIENT_URL))!;
    expect(fhirReq.headers.authorization).toBe("Bearer at-1");
  });

  it("auto-refreshes an expired access token via refresh_token before the FHIR call", async () => {
    let now = 2_000_000_000_000;
    let refreshHits = 0;

    mock.onPost(TOKEN_URL, (req) => {
      const body = new URLSearchParams(req.body ?? "");
      expect(body.get("grant_type")).toBe("refresh_token");
      expect(body.get("refresh_token")).toBe("rt-initial");
      expect(body.get("client_id")).toBe(CLIENT_ID);
      refreshHits++;
      return MockFetch.json({
        access_token: "at-2",
        token_type: "bearer",
        scope: "patient/Patient.rs",
        expires_in: 3600,
        refresh_token: "rt-rotated",
      });
    });
    mock.onGet(PATIENT_URL, () => MockFetch.fhirJson(bundleOneAlice));

    const smart = new SmartClient({
      smartConfig: smartConfigFixture,
      clientId: CLIENT_ID,
      tokens: {
        access_token: "at-initial",
        token_type: "bearer",
        scope: "patient/Patient.rs",
        expires_in: 60,
        refresh_token: "rt-initial",
      },
      clockSkewSec: 10,
      fetch: mock.fetch,
      now: () => now,
    });

    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth: smart, fetch: mock.fetch });

    await client.search("Patient").execute();
    expect(mock.requests.filter((r) => r.url.startsWith(PATIENT_URL))[0]!.headers.authorization).toBe(
      "Bearer at-initial",
    );
    expect(refreshHits).toBe(0);

    now += 55_000;
    await client.search("Patient").execute();
    expect(refreshHits).toBe(1);
    expect(smart.tokens.refresh_token).toBe("rt-rotated");
    expect(smart.tokens.access_token).toBe("at-2");

    const fhirCalls = mock.requests.filter((r) => r.method === "GET" && r.url.startsWith(PATIENT_URL));
    expect(fhirCalls[1]!.headers.authorization).toBe("Bearer at-2");
  });

  it("retains old refresh_token when the server omits rotation", async () => {
    let now = 3_000_000_000_000;
    mock.onPost(TOKEN_URL, () =>
      MockFetch.json({
        access_token: "at-fresh",
        token_type: "bearer",
        scope: "patient/Patient.rs",
        expires_in: 3600,
        // no refresh_token field — server did not rotate
      }),
    );
    mock.onGet(PATIENT_URL, () => MockFetch.fhirJson(bundleOneAlice));

    const smart = new SmartClient({
      smartConfig: smartConfigFixture,
      clientId: CLIENT_ID,
      tokens: {
        access_token: "at-old",
        token_type: "bearer",
        scope: "patient/Patient.rs",
        expires_in: 60,
        refresh_token: "rt-keep",
      },
      fetch: mock.fetch,
      now: () => now,
    });
    const client = createFhirClient<E2ESchema>({ baseUrl: FHIR_BASE, auth: smart, fetch: mock.fetch });

    now += 120_000;
    await client.search("Patient").execute();
    expect(smart.tokens.refresh_token).toBe("rt-keep");
    expect(smart.tokens.access_token).toBe("at-fresh");
  });
});

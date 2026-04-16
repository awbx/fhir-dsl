import { describe, expect, it } from "vitest";
import { base64UrlEncode, codeChallengeS256, generateCodeVerifier, generateState } from "./pkce.js";

describe("generateCodeVerifier", () => {
  it("produces a 43-char base64url string at default 32 bytes", () => {
    const v = generateCodeVerifier();
    expect(v.length).toBe(43);
    expect(v).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it("scales with byte count", () => {
    expect(generateCodeVerifier(48).length).toBe(64);
  });

  it("rejects out-of-range byte counts", () => {
    expect(() => generateCodeVerifier(16)).toThrow();
    expect(() => generateCodeVerifier(200)).toThrow();
  });

  it("yields different values each call", () => {
    const vs = new Set([generateCodeVerifier(), generateCodeVerifier(), generateCodeVerifier()]);
    expect(vs.size).toBe(3);
  });
});

describe("codeChallengeS256", () => {
  it("matches the RFC 7636 Appendix B test vector", async () => {
    // Appendix B: code_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
    //             code_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const challenge = await codeChallengeS256(verifier);
    expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("rejects verifiers outside 43–128 chars", async () => {
    await expect(codeChallengeS256("short")).rejects.toThrow();
    await expect(codeChallengeS256("x".repeat(129))).rejects.toThrow();
  });

  it("rejects verifiers with disallowed chars", async () => {
    await expect(codeChallengeS256(`invalid+chars${"x".repeat(40)}`)).rejects.toThrow();
  });
});

describe("generateState", () => {
  it("yields distinct base64url strings", () => {
    const a = generateState();
    const b = generateState();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

describe("base64UrlEncode", () => {
  it("encodes without padding and with url-safe alphabet", () => {
    expect(base64UrlEncode(new Uint8Array([0, 0, 0]))).toBe("AAAA");
    expect(base64UrlEncode(new TextEncoder().encode("?>?>"))).toBe("Pz4_Pg");
  });
});

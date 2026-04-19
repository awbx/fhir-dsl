import { describe, expect, it } from "vitest";
import { computeBackoffMs, parseRetryAfter, resolveRetryPolicy } from "./retry.js";

describe("parseRetryAfter", () => {
  it("parses delta-seconds into ms", () => {
    expect(parseRetryAfter("5")).toBe(5000);
    expect(parseRetryAfter("0")).toBe(0);
  });

  it("parses HTTP-date into ms-from-now", () => {
    const now = Date.parse("2026-01-01T00:00:00Z");
    expect(parseRetryAfter("Thu, 01 Jan 2026 00:00:10 GMT", now)).toBe(10_000);
  });

  it("clamps past dates to 0", () => {
    const now = Date.parse("2026-01-01T00:00:10Z");
    expect(parseRetryAfter("Thu, 01 Jan 2026 00:00:00 GMT", now)).toBe(0);
  });

  it("returns undefined for null, empty, or garbage", () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter("")).toBeUndefined();
    expect(parseRetryAfter("not-a-date")).toBeUndefined();
  });
});

describe("computeBackoffMs (full jitter)", () => {
  it("caps at min(maxBackoffMs, base * 2^attempt)", () => {
    const policy = resolveRetryPolicy({ baseBackoffMs: 100, maxBackoffMs: 1000, random: () => 0.999 })!;
    expect(computeBackoffMs(policy, 0)).toBeLessThan(100);
    expect(computeBackoffMs(policy, 1)).toBeLessThan(200);
    expect(computeBackoffMs(policy, 10)).toBeLessThan(1001); // capped
  });

  it("never returns negative values", () => {
    const policy = resolveRetryPolicy({ random: () => 0 })!;
    expect(computeBackoffMs(policy, 3)).toBe(0);
  });
});

describe("resolveRetryPolicy", () => {
  it("returns undefined for retry:false", () => {
    expect(resolveRetryPolicy(false)).toBeUndefined();
  });

  it("returns defaults for undefined or true", () => {
    const r = resolveRetryPolicy(undefined)!;
    expect(r.maxAttempts).toBe(3);
    expect(r.retryOn).toEqual([429, 503]);
    expect(resolveRetryPolicy(true)!.maxAttempts).toBe(3);
  });

  it("user fields override defaults", () => {
    const r = resolveRetryPolicy({ maxAttempts: 5, retryOn: [500] })!;
    expect(r.maxAttempts).toBe(5);
    expect(r.retryOn).toEqual([500]);
    expect(r.baseBackoffMs).toBe(100); // kept default
  });
});

import { describe, expect, it } from "vitest";
import {
  FhirDslError,
  formatErrorChain,
  isFhirDslError,
  mapErr,
  mapOk,
  match,
  Result,
  tryAsync,
  trySync,
} from "../src/errors.js";

class TestError extends FhirDslError<"test.kind", { detail: string }> {
  readonly kind = "test.kind" as const;
}

class WrapperError extends FhirDslError<"test.wrapper", { upstream: string }> {
  readonly kind = "test.wrapper" as const;
}

describe("FhirDslError base", () => {
  it("captures kind, message, and context", () => {
    const err = new TestError("boom", { detail: "x" });
    expect(err.kind).toBe("test.kind");
    expect(err.message).toBe("boom");
    expect(err.context).toEqual({ detail: "x" });
    expect(err.name).toBe("TestError");
  });

  it("is catchable as a plain Error and as the abstract base", () => {
    const err = new TestError("boom", { detail: "x" });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(FhirDslError);
    expect(err).toBeInstanceOf(TestError);
  });

  it("preserves the ES2022 cause chain", () => {
    const root = new TypeError("network kaput");
    const wrapped = new WrapperError("upstream failed", { upstream: "x" }, { cause: root });
    expect(wrapped.cause).toBe(root);
  });

  it("isFhirDslError narrows unknown values at boundaries", () => {
    const err: unknown = new TestError("boom", { detail: "x" });
    if (isFhirDslError(err)) {
      expect(err.kind).toBe("test.kind");
    } else {
      throw new Error("isFhirDslError narrowed wrongly");
    }
    expect(isFhirDslError(new Error("plain"))).toBe(false);
    expect(isFhirDslError("string-throw")).toBe(false);
  });
});

describe("toJSON serialisation", () => {
  it("emits a transport-safe object", () => {
    const err = new TestError("boom", { detail: "x" });
    const json = err.toJSON();
    expect(json.name).toBe("TestError");
    expect(json.kind).toBe("test.kind");
    expect(json.message).toBe("boom");
    expect(json.context).toEqual({ detail: "x" });
    expect(typeof json.stack).toBe("string");
  });

  it("walks the cause chain into the JSON output", () => {
    const root = new TypeError("network kaput");
    const wrapped = new WrapperError("upstream failed", { upstream: "x" }, { cause: root });
    const json = wrapped.toJSON();
    expect(json.cause).toBeDefined();
    expect(json.cause?.name).toBe("TypeError");
    expect(json.cause?.message).toBe("network kaput");
  });

  it("survives JSON.stringify round-trip", () => {
    const err = new TestError("boom", { detail: "x" });
    const wire = JSON.stringify(err);
    const parsed = JSON.parse(wire);
    expect(parsed.kind).toBe("test.kind");
    expect(parsed.message).toBe("boom");
  });
});

describe("formatErrorChain", () => {
  it("renders a single error", () => {
    expect(formatErrorChain(new TestError("boom", { detail: "x" }))).toBe("TestError: boom");
  });

  it("renders the full chain joined by ←", () => {
    const root = new TypeError("network kaput");
    const wrapped = new WrapperError("upstream failed", { upstream: "x" }, { cause: root });
    expect(formatErrorChain(wrapped)).toBe("WrapperError: upstream failed ← TypeError: network kaput");
  });

  it("handles non-Error throws gracefully", () => {
    expect(formatErrorChain("string-throw")).toBe("string-throw");
    expect(formatErrorChain(42)).toBe("42");
  });

  it("guards against cycles in the cause chain", () => {
    const a = new TestError("a", { detail: "a" });
    const b = new TestError("b", { detail: "b" }, { cause: a });
    // Manually create a cycle for the safety test.
    Object.defineProperty(a, "cause", { value: b });
    const out = formatErrorChain(b);
    expect(out).toContain("TestError: b");
    expect(out).toContain("TestError: a");
  });
});

describe("Result<T, E> + trySync/tryAsync", () => {
  it("Result.ok / Result.err shape", () => {
    expect(Result.ok(42)).toEqual({ ok: true, value: 42 });
    expect(Result.err("nope")).toEqual({ ok: false, error: "nope" });
  });

  it("type-narrows on r.ok", () => {
    const r: Result<number, string> = Result.ok(7);
    if (r.ok) expect(r.value).toBe(7);
    else throw new Error("narrowed wrongly");
  });

  it("trySync lifts thrown values into Err", () => {
    const r = trySync<number>(() => {
      throw new TestError("boom", { detail: "x" });
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect((r.error as TestError).kind).toBe("test.kind");
  });

  it("tryAsync resolves to Ok and rejects to Err", async () => {
    const ok = await tryAsync(async () => 42);
    expect(ok).toEqual({ ok: true, value: 42 });
    const err = await tryAsync<number>(async () => {
      throw new TestError("boom", { detail: "x" });
    });
    expect(err.ok).toBe(false);
  });

  it("tryAsync mapError coerces unknown throws to a domain error", async () => {
    const r = await tryAsync(
      async () => {
        throw new Error("plain");
      },
      (cause) => new WrapperError("wrapped", { upstream: "x" }, { cause }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe("test.wrapper");
      expect(r.error.cause).toBeInstanceOf(Error);
    }
  });

  it("mapErr / mapOk transform the relevant channel", () => {
    const ok: Result<number, string> = Result.ok(2);
    const err: Result<number, string> = Result.err("nope");
    expect(mapOk(ok, (n) => n * 2)).toEqual({ ok: true, value: 4 });
    expect(mapOk(err, (n) => n * 2)).toEqual(err);
    expect(mapErr(ok, (e) => e.toUpperCase())).toEqual(ok);
    expect(mapErr(err, (e) => e.toUpperCase())).toEqual({ ok: false, error: "NOPE" });
  });

  it("match dispatches by variant", () => {
    const r: Result<number, string> = Result.ok(3);
    expect(match(r, { ok: (v) => `value=${v}`, err: (e) => `err=${e}` })).toBe("value=3");
    const r2: Result<number, string> = Result.err("nope");
    expect(match(r2, { ok: (v) => `value=${v}`, err: (e) => `err=${e}` })).toBe("err=nope");
  });
});

/**
 * Cross-cutting check: every domain error in @fhir-dsl/fhirpath flows
 * through the FhirDslError contract — `kind` discriminator, `context`
 * payload, `toJSON()` round-trip, `cause` propagation, and the typed
 * `isFhirDslError` narrow. Mirrors the pattern in the other packages.
 */
import { FhirDslError, isFhirDslError } from "@fhir-dsl/utils";
import { describe, expect, it } from "vitest";
import { fhirpath } from "../src/builder.js";
import { UcumError } from "../src/eval/_internal/ucum.js";
import { FhirPathEvaluationError } from "../src/eval/types.js";
import { FhirPathInvariantEvalError } from "../src/invariant/evaluator.js";
import { FhirPathInvariantCompileError } from "../src/invariant/index.js";
import { FhirPathLexerError } from "../src/invariant/lexer.js";
import { FhirPathParseError } from "../src/invariant/parser.js";
import { FhirPathSetterError } from "../src/setter.js";

describe("fhirpath errors implement the FhirDslError contract", () => {
  it("every class extends the common base", () => {
    expect(new FhirPathSetterError("x")).toBeInstanceOf(FhirDslError);
    expect(new FhirPathEvaluationError("x")).toBeInstanceOf(FhirDslError);
    expect(new FhirPathLexerError("x", 0)).toBeInstanceOf(FhirDslError);
    expect(new FhirPathParseError("x", 0)).toBeInstanceOf(FhirDslError);
    expect(new UcumError("x")).toBeInstanceOf(FhirDslError);
    expect(new FhirPathInvariantEvalError()).toBeInstanceOf(FhirDslError);
    expect(
      new FhirPathInvariantCompileError("x", { key: "k", expression: "x", severity: "error", human: "h" }),
    ).toBeInstanceOf(FhirDslError);
  });

  it("each class declares a unique kind discriminator", () => {
    const kinds = [
      new FhirPathSetterError("x").kind,
      new FhirPathEvaluationError("x").kind,
      new FhirPathLexerError("x", 0).kind,
      new FhirPathParseError("x", 0).kind,
      new UcumError("x").kind,
      new FhirPathInvariantEvalError().kind,
      new FhirPathInvariantCompileError("x", { key: "k", expression: "x", severity: "error", human: "h" }).kind,
    ];
    expect(new Set(kinds).size).toBe(kinds.length);
    expect(kinds).toContain("fhirpath.setter");
    expect(kinds).toContain("fhirpath.evaluation");
    expect(kinds).toContain("fhirpath.ucum");
  });

  it("structural fields are preserved alongside FhirDslError fields", () => {
    // Back-compat: existing fields keep working — pos on lex/parse, definition
    // on invariant-compile, etc.
    const lex = new FhirPathLexerError("bad token", 7);
    expect(lex.pos).toBe(7);
    expect(lex.context).toEqual({ pos: 7 });

    const parse = new FhirPathParseError("expected )", 11);
    expect(parse.pos).toBe(11);
    expect(parse.context).toEqual({ pos: 11 });

    const def = { key: "pat-1", expression: "name.exists()", severity: "error" as const, human: "h" };
    const compile = new FhirPathInvariantCompileError("oops", def);
    expect(compile.definition).toBe(def);
    expect(compile.context).toEqual({ definition: def });
  });

  it("toJSON round-trips with kind + context (transport-safe)", () => {
    const err = new FhirPathLexerError("bad token", 7);
    const wire = JSON.parse(JSON.stringify(err));
    expect(wire.name).toBe("FhirPathLexerError");
    expect(wire.kind).toBe("fhirpath.lexer");
    expect(wire.context).toEqual({ pos: 7 });
  });

  it("isFhirDslError narrows unknown thrown values", () => {
    let caught: unknown;
    try {
      fhirpath("Patient")
        .name.first()
        .setValue({ resourceType: "Patient" } as never, "x" as never);
    } catch (err) {
      caught = err;
    }
    if (!isFhirDslError(caught)) throw new Error("expected FhirDslError");
    expect(caught.kind).toBe("fhirpath.setter");
  });

  it("preserves ES2022 cause chain through the base", () => {
    const root = new TypeError("network");
    const err = new FhirPathEvaluationError("upstream failed");
    Object.defineProperty(err, "cause", { value: root, enumerable: false });
    expect(err.cause).toBe(root);
  });
});

describe("DX: typed Result flow with tryAsync + match", async () => {
  // Demonstrates the headline Effect-style use: lift a throwing op into
  // a Result, then dispatch by `kind` to print structured output.
  const { Result, tryAsync, match } = await import("@fhir-dsl/utils");

  it("captures a domain error as a typed Err without try/catch", async () => {
    const r = await tryAsync(async () =>
      fhirpath("Patient")
        .name.first()
        .setValue({ resourceType: "Patient" } as never, "x" as never),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBeInstanceOf(FhirPathSetterError);
      expect((r.error as FhirPathSetterError).kind).toBe("fhirpath.setter");
    }
  });

  it("match dispatches by the kind discriminator", async () => {
    const r: Awaited<ReturnType<typeof tryAsync<unknown>>> = Result.err(new FhirPathSetterError("nope"));
    const summary = match(r, {
      ok: () => "ok",
      err: (e) => (isFhirDslError(e) ? `domain:${e.kind}` : "other"),
    });
    expect(summary).toBe("domain:fhirpath.setter");
  });
});

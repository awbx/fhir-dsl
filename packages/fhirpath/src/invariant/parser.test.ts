import { describe, expect, it } from "vitest";
import { FhirPathParseError, parseExpression } from "./parser.js";

describe("parseExpression", () => {
  it("parses identifiers and member access", () => {
    expect(parseExpression("name.given")).toEqual({
      kind: "member",
      left: { kind: "ident", name: "name" },
      name: "given",
    });
  });

  it("parses zero-arg function calls", () => {
    expect(parseExpression("name.exists()")).toEqual({
      kind: "call",
      left: { kind: "ident", name: "name" },
      name: "exists",
      args: [],
    });
  });

  it("parses function calls with literal arguments", () => {
    const ast = parseExpression("identifier.value.matches('^[0-9]+$')");
    expect(ast).toMatchObject({
      kind: "call",
      name: "matches",
      args: [{ kind: "literal", value: "^[0-9]+$" }],
    });
  });

  it("respects boolean operator precedence: and > or > implies", () => {
    const ast = parseExpression("a.exists() implies b.exists() or c.exists() and d.exists()");
    // implies binds loosest, so left = (a.exists()), right = ((b or (c and d)))
    expect(ast).toMatchObject({
      kind: "binary",
      op: "implies",
      left: { kind: "call", name: "exists" },
      right: { kind: "binary", op: "or" },
    });
  });

  it("treats `or` and `xor` as left-associative at the same level", () => {
    const ast = parseExpression("a or b xor c");
    expect(ast).toMatchObject({
      kind: "binary",
      op: "xor",
      left: { kind: "binary", op: "or" },
    });
  });

  it("handles nested parentheses", () => {
    const ast = parseExpression("(a.exists() or b.exists()) and c.exists()");
    expect(ast).toMatchObject({
      kind: "binary",
      op: "and",
      left: { kind: "binary", op: "or" },
    });
  });

  it("parses comparison operators", () => {
    const ast = parseExpression("count() = 1");
    expect(ast).toMatchObject({
      kind: "binary",
      op: "=",
      left: { kind: "call", name: "count", left: null, args: [] },
      right: { kind: "literal", value: 1 },
    });
  });

  it("recognises the unary `not` keyword", () => {
    const ast = parseExpression("not a.exists()");
    expect(ast).toMatchObject({ kind: "unary", op: "not" });
  });

  it("throws a FhirPathParseError on syntactic garbage", () => {
    expect(() => parseExpression("name..exists()")).toThrow(FhirPathParseError);
  });

  it("parses an indexer expression", () => {
    const ast = parseExpression("name[0].given");
    expect(ast).toMatchObject({
      kind: "member",
      left: {
        kind: "index",
        left: { kind: "ident", name: "name" },
        index: { kind: "literal", value: 0 },
      },
      name: "given",
    });
  });
});

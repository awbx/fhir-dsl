import type { Expr } from "./ast.js";
import { type Token, type TokenType, tokenize } from "./lexer.js";

// Phase 6 — Pratt parser for the FHIRPath invariant subset. The grammar
// roughly follows §6 of the FHIRPath 2.0 spec, restricted to:
//
//   primary    := literal | ident | $this | "(" expr ")"
//   call-tail  := primary { "." ident "(" args? ")"  |  "." ident  |  "[" expr "]" }
//   unary      := "-" unary | "not" unary | call-tail
//   mul        := unary  { ("*"|"/"|"div"|"mod") unary }
//   add        := mul    { ("+"|"-"|"&") mul }
//   compare    := add    { ("<"|">"|"<="|">="|"="|"!="|"~"|"!~"|"in") add }
//   and-expr   := compare { "and" compare }
//   or-expr    := and-expr { ("or"|"xor") and-expr }
//   implies    := or-expr  { "implies" or-expr }
//
// `or`/`xor` share precedence (left-assoc); `implies` is right-assoc.

export class FhirPathParseError extends Error {
  constructor(
    message: string,
    public readonly pos: number,
  ) {
    super(`FHIRPath parse error at ${pos}: ${message}`);
  }
}

export function parseExpression(source: string): Expr {
  const tokens = tokenize(source);
  const p = new Parser(tokens);
  const expr = p.implies();
  p.expect("eof");
  return expr;
}

class Parser {
  private i = 0;
  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token {
    return this.tokens[this.i + offset]!;
  }

  private advance(): Token {
    return this.tokens[this.i++]!;
  }

  private match(...types: TokenType[]): boolean {
    return types.includes(this.peek().type);
  }

  expect(type: TokenType): Token {
    const t = this.peek();
    if (t.type !== type) {
      throw new FhirPathParseError(`expected ${type} but got ${t.type} (${JSON.stringify(t.value)})`, t.pos);
    }
    return this.advance();
  }

  // Right-associative.
  implies(): Expr {
    const left = this.or();
    if (this.match("implies")) {
      this.advance();
      const right = this.implies();
      return { kind: "binary", op: "implies", left, right };
    }
    return left;
  }

  or(): Expr {
    let left = this.and();
    while (this.match("or", "xor")) {
      const op = this.advance().type as "or" | "xor";
      const right = this.and();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  and(): Expr {
    let left = this.compare();
    while (this.match("and")) {
      this.advance();
      const right = this.compare();
      left = { kind: "binary", op: "and", left, right };
    }
    return left;
  }

  compare(): Expr {
    let left = this.add();
    while (this.match("eq", "neq", "lt", "gt", "lte", "gte", "tilde-eq", "neq-tilde", "in")) {
      const t = this.advance();
      const op = compareTokenToOp(t.type);
      const right = this.add();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  add(): Expr {
    let left = this.mul();
    while (this.match("plus", "minus", "amp")) {
      const t = this.advance();
      const op = t.type === "plus" ? "+" : t.type === "minus" ? "-" : "&";
      const right = this.mul();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  mul(): Expr {
    let left = this.unary();
    while (this.match("star", "slash", "div", "mod")) {
      const t = this.advance();
      const op = t.type === "star" ? "*" : t.type === "slash" ? "/" : (t.type as "div" | "mod");
      const right = this.unary();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  unary(): Expr {
    if (this.match("not")) {
      this.advance();
      // `not` in FHIRPath is a function — we accept the keyword form
      // here (`not field.exists()`) and the call form (`field.exists().not()`).
      // The keyword form binds at unary precedence.
      const arg = this.unary();
      return { kind: "unary", op: "not", arg };
    }
    if (this.match("minus")) {
      this.advance();
      const arg = this.unary();
      return { kind: "unary", op: "-", arg };
    }
    return this.callChain();
  }

  callChain(): Expr {
    let left = this.primary();
    while (this.match("dot", "lbracket")) {
      if (this.match("dot")) {
        this.advance();
        const name = this.expect("ident").value;
        if (this.match("lparen")) {
          this.advance();
          const args = this.argList();
          this.expect("rparen");
          left = { kind: "call", left, name, args };
        } else {
          left = { kind: "member", left, name };
        }
      } else {
        // Indexer
        this.advance();
        const index = this.implies();
        this.expect("rbracket");
        left = { kind: "index", left, index };
      }
    }
    return left;
  }

  primary(): Expr {
    const t = this.peek();
    switch (t.type) {
      case "string":
        this.advance();
        return { kind: "literal", value: t.value };
      case "number":
        this.advance();
        return { kind: "literal", value: Number(t.value) };
      case "true":
        this.advance();
        return { kind: "literal", value: true };
      case "false":
        this.advance();
        return { kind: "literal", value: false };
      case "lparen": {
        this.advance();
        const inner = this.implies();
        this.expect("rparen");
        return inner;
      }
      case "ident": {
        // Identifiers can also be the head of a function call:
        //   exists()             — no left operand
        //   matches('regex')     — likewise
        this.advance();
        const name = t.value;
        if (name === "$this") return { kind: "this" };
        if (this.match("lparen")) {
          this.advance();
          const args = this.argList();
          this.expect("rparen");
          return { kind: "call", left: null, name, args };
        }
        return { kind: "ident", name };
      }
      default:
        throw new FhirPathParseError(`unexpected ${t.type} (${JSON.stringify(t.value)})`, t.pos);
    }
  }

  argList(): Expr[] {
    if (this.match("rparen")) return [];
    const args: Expr[] = [this.implies()];
    while (this.match("comma")) {
      this.advance();
      args.push(this.implies());
    }
    return args;
  }
}

function compareTokenToOp(t: TokenType): "=" | "!=" | "<" | ">" | "<=" | ">=" | "~" | "!~" | "in" {
  switch (t) {
    case "eq":
      return "=";
    case "neq":
      return "!=";
    case "lt":
      return "<";
    case "gt":
      return ">";
    case "lte":
      return "<=";
    case "gte":
      return ">=";
    case "tilde-eq":
      return "~";
    case "neq-tilde":
      return "!~";
    case "in":
      return "in";
    default:
      throw new Error(`not a comparison: ${t}`);
  }
}

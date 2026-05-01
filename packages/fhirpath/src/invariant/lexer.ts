// Phase 6 — small FHIRPath lexer scoped to the subset needed for FHIR
// invariants (`ElementDefinition.constraint[*].expression`). The full
// FHIRPath grammar is much larger; this lexer covers identifiers,
// function-call sugar, dotted paths, comparisons, boolean keywords, and
// the literals invariants actually use (numbers, booleans, single-quoted
// strings).

import { FhirDslError } from "@fhir-dsl/utils";

export type TokenType =
  | "ident"
  | "string"
  | "number"
  | "true"
  | "false"
  | "and"
  | "or"
  | "xor"
  | "implies"
  | "not"
  | "in"
  | "div"
  | "mod"
  | "dot"
  | "lparen"
  | "rparen"
  | "lbracket"
  | "rbracket"
  | "comma"
  | "eq"
  | "neq"
  | "lt"
  | "gt"
  | "lte"
  | "gte"
  | "tilde-eq"
  | "neq-tilde"
  | "plus"
  | "minus"
  | "star"
  | "slash"
  | "amp"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const KEYWORDS = new Map<string, TokenType>([
  ["and", "and"],
  ["or", "or"],
  ["xor", "xor"],
  ["implies", "implies"],
  ["not", "not"],
  ["in", "in"],
  ["div", "div"],
  ["mod", "mod"],
  ["true", "true"],
  ["false", "false"],
]);

export class FhirPathLexerError extends FhirDslError<"fhirpath.lexer", { pos: number }> {
  readonly kind = "fhirpath.lexer" as const;
  readonly pos: number;
  constructor(message: string, pos: number) {
    super(`FHIRPath lex error at ${pos}: ${message}`, { pos });
    this.pos = pos;
  }
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i]!;

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }

    // String literal — FHIRPath uses single quotes. Backslash escapes are
    // permitted (`\'`, `\\`, `\n`, `\t`, `\r`).
    if (ch === "'") {
      const start = i;
      i++;
      let value = "";
      while (i < source.length && source[i] !== "'") {
        const c = source[i]!;
        if (c === "\\" && i + 1 < source.length) {
          const next = source[i + 1]!;
          switch (next) {
            case "'":
              value += "'";
              break;
            case "\\":
              value += "\\";
              break;
            case "n":
              value += "\n";
              break;
            case "t":
              value += "\t";
              break;
            case "r":
              value += "\r";
              break;
            default:
              value += next;
          }
          i += 2;
          continue;
        }
        value += c;
        i++;
      }
      if (i >= source.length) throw new FhirPathLexerError("unterminated string literal", start);
      i++; // closing quote
      tokens.push({ type: "string", value, pos: start });
      continue;
    }

    // Numeric literal — integer or decimal. We don't model FHIRPath
    // quantities here (`5 'mg'`); invariants rarely use them.
    if (ch >= "0" && ch <= "9") {
      const start = i;
      while (i < source.length && source[i]! >= "0" && source[i]! <= "9") i++;
      if (source[i] === "." && i + 1 < source.length && source[i + 1]! >= "0" && source[i + 1]! <= "9") {
        i++;
        while (i < source.length && source[i]! >= "0" && source[i]! <= "9") i++;
      }
      tokens.push({ type: "number", value: source.slice(start, i), pos: start });
      continue;
    }

    // Identifier or keyword. FHIRPath also allows backtick-quoted
    // identifiers for names that collide with keywords; we accept those
    // verbatim.
    if (ch === "`") {
      const start = i;
      i++;
      while (i < source.length && source[i] !== "`") i++;
      if (i >= source.length) throw new FhirPathLexerError("unterminated quoted identifier", start);
      const name = source.slice(start + 1, i);
      i++;
      tokens.push({ type: "ident", value: name, pos: start });
      continue;
    }
    if (isIdentStart(ch)) {
      const start = i;
      while (i < source.length && isIdentPart(source[i]!)) i++;
      const word = source.slice(start, i);
      const kw = KEYWORDS.get(word);
      tokens.push({ type: kw ?? "ident", value: word, pos: start });
      continue;
    }

    // Multi-char operators first.
    if (ch === "!" && source[i + 1] === "=") {
      tokens.push({ type: "neq", value: "!=", pos: i });
      i += 2;
      continue;
    }
    if (ch === "!" && source[i + 1] === "~") {
      tokens.push({ type: "neq-tilde", value: "!~", pos: i });
      i += 2;
      continue;
    }
    if (ch === "<" && source[i + 1] === "=") {
      tokens.push({ type: "lte", value: "<=", pos: i });
      i += 2;
      continue;
    }
    if (ch === ">" && source[i + 1] === "=") {
      tokens.push({ type: "gte", value: ">=", pos: i });
      i += 2;
      continue;
    }
    if (ch === "~") {
      tokens.push({ type: "tilde-eq", value: "~", pos: i });
      i++;
      continue;
    }

    // Single-char tokens.
    switch (ch) {
      case ".":
        tokens.push({ type: "dot", value: ".", pos: i });
        i++;
        continue;
      case "(":
        tokens.push({ type: "lparen", value: "(", pos: i });
        i++;
        continue;
      case ")":
        tokens.push({ type: "rparen", value: ")", pos: i });
        i++;
        continue;
      case "[":
        tokens.push({ type: "lbracket", value: "[", pos: i });
        i++;
        continue;
      case "]":
        tokens.push({ type: "rbracket", value: "]", pos: i });
        i++;
        continue;
      case ",":
        tokens.push({ type: "comma", value: ",", pos: i });
        i++;
        continue;
      case "=":
        tokens.push({ type: "eq", value: "=", pos: i });
        i++;
        continue;
      case "<":
        tokens.push({ type: "lt", value: "<", pos: i });
        i++;
        continue;
      case ">":
        tokens.push({ type: "gt", value: ">", pos: i });
        i++;
        continue;
      case "+":
        tokens.push({ type: "plus", value: "+", pos: i });
        i++;
        continue;
      case "-":
        tokens.push({ type: "minus", value: "-", pos: i });
        i++;
        continue;
      case "*":
        tokens.push({ type: "star", value: "*", pos: i });
        i++;
        continue;
      case "/":
        tokens.push({ type: "slash", value: "/", pos: i });
        i++;
        continue;
      case "&":
        tokens.push({ type: "amp", value: "&", pos: i });
        i++;
        continue;
    }

    throw new FhirPathLexerError(`unexpected character ${JSON.stringify(ch)}`, i);
  }

  tokens.push({ type: "eof", value: "", pos: source.length });
  return tokens;
}

function isIdentStart(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_" || c === "$";
}

function isIdentPart(c: string): boolean {
  return isIdentStart(c) || (c >= "0" && c <= "9");
}

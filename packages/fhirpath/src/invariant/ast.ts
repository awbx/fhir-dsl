// Phase 6 — AST nodes for the FHIRPath invariant subset. The parser in
// ./parser.ts produces these; the evaluator in ./evaluator.ts walks them.
// Names match the FHIRPath spec where possible so future extensions stay
// straightforward.

export type Expr =
  | { kind: "literal"; value: string | number | boolean | null }
  | { kind: "ident"; name: string }
  | { kind: "this" } // `$this`
  | { kind: "member"; left: Expr; name: string }
  | { kind: "index"; left: Expr; index: Expr }
  | { kind: "call"; left: Expr | null; name: string; args: Expr[] }
  | { kind: "unary"; op: "not" | "-"; arg: Expr }
  | {
      kind: "binary";
      op:
        | "and"
        | "or"
        | "xor"
        | "implies"
        | "="
        | "!="
        | "<"
        | ">"
        | "<="
        | ">="
        | "+"
        | "-"
        | "*"
        | "/"
        | "div"
        | "mod"
        | "&"
        | "in"
        | "~"
        | "!~";
      left: Expr;
      right: Expr;
    };

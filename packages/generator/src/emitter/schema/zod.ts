import type { InvariantNode, ObjectField, SchemaNode, ValidatorAdapter } from "./adapter.js";
import { FHIR_PRIMITIVE_RULES, type PrimitiveRules, regexLiteral } from "./primitive-rules.js";

const INDENT = "  ";

function renderPrimitive(fhirType: string, rules: PrimitiveRules): string {
  const rule = rules[fhirType];
  if (!rule) return "z.unknown()";

  if (rule.kind === "boolean") return "z.boolean()";

  if (rule.kind === "integer" || rule.kind === "number") {
    let expr = "z.number()";
    if (rule.kind === "integer") expr += ".int()";
    if (rule.min !== undefined) expr += `.min(${rule.min})`;
    return expr;
  }

  let expr = "z.string()";
  if (rule.regex) expr += `.regex(${regexLiteral(rule.regex)})`;
  if (rule.maxLength !== undefined) expr += `.max(${rule.maxLength})`;
  return expr;
}

function renderEnum(values: string[], extensible: boolean): string {
  if (values.length === 0) return "z.string()";
  const literal = `z.enum([${values.map((v) => JSON.stringify(v)).join(", ")}] as const)`;
  return extensible ? `z.union([${literal}, z.string()])` : literal;
}

function renderNode(node: SchemaNode, indent: number, rules: PrimitiveRules): string {
  switch (node.kind) {
    case "primitive":
      return renderPrimitive(node.fhirType, rules);
    case "literal":
      return `z.literal(${JSON.stringify(node.value)})`;
    case "enum":
      return renderEnum(node.values, node.extensible);
    case "ref":
      return node.name;
    case "lazy":
      return `z.lazy((): z.ZodTypeAny => ${node.ref})`;
    case "unknown":
      return "z.unknown()";
    case "array": {
      const inner = renderNode(node.inner, indent, rules);
      const expr = `z.array(${inner})`;
      return node.minItems !== undefined && node.minItems > 0 ? `${expr}.min(${node.minItems})` : expr;
    }
    case "union": {
      if (node.options.length === 0) return "z.unknown()";
      if (node.options.length === 1) return renderNode(node.options[0]!, indent, rules);
      const pad = INDENT.repeat(indent + 1);
      const close = INDENT.repeat(indent);
      const parts = node.options.map((o) => `${pad}${renderNode(o, indent + 1, rules)}`).join(",\n");
      return `z.union([\n${parts},\n${close}])`;
    }
    case "object": {
      const obj = renderObject(node.fields, indent, rules);
      return node.invariants?.length ? wrapWithInvariants(obj, node.invariants, indent) : obj;
    }
  }
}

function wrapWithInvariants(objectExpr: string, invariants: readonly InvariantNode[], indent: number): string {
  const pad = INDENT.repeat(indent + 1);
  const close = INDENT.repeat(indent);
  const innerPad = INDENT.repeat(indent + 2);
  const literal = renderInvariantsLiteral(invariants, indent + 1);
  return [
    `${objectExpr}.superRefine((value, ctx) => {`,
    `${pad}const oo = validateInvariants(value, ${literal});`,
    `${pad}for (const issue of oo.issue) {`,
    `${innerPad}if (issue.severity === "error") {`,
    `${innerPad}${INDENT}ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.diagnostics });`,
    `${innerPad}}`,
    `${pad}}`,
    `${close}})`,
  ].join("\n");
}

function renderInvariantsLiteral(invariants: readonly InvariantNode[], indent: number): string {
  const pad = INDENT.repeat(indent + 1);
  const close = INDENT.repeat(indent);
  const lines = invariants.map(
    (i) =>
      `${pad}{ key: ${JSON.stringify(i.key)}, severity: ${JSON.stringify(i.severity)}, expression: ${JSON.stringify(i.expression)}, human: ${JSON.stringify(i.human)} }`,
  );
  return `[\n${lines.join(",\n")},\n${close}]`;
}

function renderObject(fields: ObjectField[], indent: number, rules: PrimitiveRules): string {
  if (fields.length === 0) return "z.object({}).catchall(z.unknown())";
  const pad = INDENT.repeat(indent + 1);
  const close = INDENT.repeat(indent);
  const lines = fields.map((f) => {
    const keyOk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(f.name);
    const key = keyOk ? f.name : JSON.stringify(f.name);
    const value = renderNode(f.schema, indent + 1, rules);
    const final = f.optional ? `${value}.optional()` : value;
    return `${pad}${key}: ${final},`;
  });
  return `z.object({\n${lines.join("\n")}\n${close}}).catchall(z.unknown())`;
}

export function createZodAdapter(rules: PrimitiveRules): ValidatorAdapter {
  return {
    name: "zod",
    libImport: () => 'import { z } from "zod";',
    render: (node) => renderNode(node, 0, rules),
    declareConst(exportName, node) {
      return `export const ${exportName} = ${renderNode(node, 0, rules)};`;
    },
    declareExtend(exportName, baseName, fields) {
      const obj = renderObject(fields, 0, rules);
      // z.object(...).extend takes another z.object shape — strip the outer
      // `z.object({ ... }).catchall(...)` down to the shape object and use
      // .extend({ ... }) directly.
      const shape = extractShape(obj);
      return `export const ${exportName} = ${baseName}.extend(${shape});`;
    },
  };
}

export const zodAdapter: ValidatorAdapter = createZodAdapter(FHIR_PRIMITIVE_RULES);

/** Extract `{ ... }` from `z.object({ ... }).catchall(z.unknown())`. */
function extractShape(objectExpr: string): string {
  const open = objectExpr.indexOf("{");
  if (open < 0) return "{}";
  // Match balanced braces from `open` to find the end of the shape object.
  let depth = 0;
  for (let i = open; i < objectExpr.length; i++) {
    const c = objectExpr[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return objectExpr.slice(open, i + 1);
    }
  }
  return "{}";
}

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ExtraRuntimeFile,
  InvariantNode,
  LibImportOptions,
  ObjectField,
  SchemaNode,
  ValidatorAdapter,
} from "./adapter.js";
import { FHIR_PRIMITIVE_RULES, type PrimitiveRules, regexLiteral } from "./primitive-rules.js";

const INDENT = "  ";

function renderPrimitive(fhirType: string, rules: PrimitiveRules): string {
  const rule = rules[fhirType];
  if (!rule) return "s.unknown()";

  if (rule.kind === "boolean") return "s.boolean()";

  if (rule.kind === "integer" || rule.kind === "number") {
    const opts: string[] = [];
    if (rule.kind === "integer") opts.push("int: true");
    if (rule.min !== undefined) opts.push(`min: ${rule.min}`);
    return opts.length > 0 ? `s.number({ ${opts.join(", ")} })` : "s.number()";
  }

  const opts: string[] = [];
  if (rule.regex) opts.push(`regex: ${regexLiteral(rule.regex)}`);
  if (rule.maxLength !== undefined) opts.push(`maxLength: ${rule.maxLength}`);
  return opts.length > 0 ? `s.string({ ${opts.join(", ")} })` : "s.string()";
}

function renderEnum(values: string[], extensible: boolean): string {
  if (values.length === 0) return "s.string()";
  const list = `[${values.map((v) => JSON.stringify(v)).join(", ")}] as const`;
  return extensible ? `s.enum(${list}, true)` : `s.enum(${list})`;
}

function renderNode(node: SchemaNode, indent: number, rules: PrimitiveRules): string {
  switch (node.kind) {
    case "primitive":
      return renderPrimitive(node.fhirType, rules);
    case "literal":
      return `s.literal(${JSON.stringify(node.value)})`;
    case "enum":
      return renderEnum(node.values, node.extensible);
    case "ref":
      return node.name;
    case "lazy":
      return `s.lazy(() => ${node.ref})`;
    case "unknown":
      return "s.unknown()";
    case "array": {
      const inner = renderNode(node.inner, indent, rules);
      return node.minItems !== undefined && node.minItems > 0
        ? `s.array(${inner}, ${node.minItems})`
        : `s.array(${inner})`;
    }
    case "union": {
      if (node.options.length === 0) return "s.unknown()";
      if (node.options.length === 1) return renderNode(node.options[0]!, indent, rules);
      const pad = INDENT.repeat(indent + 1);
      const close = INDENT.repeat(indent);
      const parts = node.options.map((o) => `${pad}${renderNode(o, indent + 1, rules)}`).join(",\n");
      return `s.union([\n${parts},\n${close}])`;
    }
    case "object": {
      const obj = renderObject(node.fields, indent, rules);
      return node.invariants?.length ? wrapWithInvariants(obj, node.invariants, indent) : obj;
    }
    case "refine": {
      const inner = renderNode(node.inner, indent, rules);
      return wrapWithInvariants(inner, node.invariants, indent);
    }
  }
}

function renderObject(fields: ObjectField[], indent: number, rules: PrimitiveRules): string {
  if (fields.length === 0) return "s.object({})";
  const pad = INDENT.repeat(indent + 1);
  const close = INDENT.repeat(indent);
  const lines = fields.map((f) => {
    const keyOk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(f.name);
    const key = keyOk ? f.name : JSON.stringify(f.name);
    const value = renderNode(f.schema, indent + 1, rules);
    return `${pad}${key}: { schema: ${value}, optional: ${f.optional} },`;
  });
  return `s.object({\n${lines.join("\n")}\n${close}})`;
}

export function renderInvariantsLiteral(invariants: readonly InvariantNode[], indent: number): string {
  const pad = INDENT.repeat(indent + 1);
  const close = INDENT.repeat(indent);
  const lines = invariants.map(
    (i) =>
      `${pad}{ key: ${JSON.stringify(i.key)}, severity: ${JSON.stringify(i.severity)}, expression: ${JSON.stringify(i.expression)}, human: ${JSON.stringify(i.human)} }`,
  );
  return `[\n${lines.join(",\n")},\n${close}]`;
}

function wrapWithInvariants(objectExpr: string, invariants: readonly InvariantNode[], indent: number): string {
  const pad = INDENT.repeat(indent + 1);
  const close = INDENT.repeat(indent);
  const literal = renderInvariantsLiteral(invariants, indent + 1);
  return [
    "s.refine(",
    `${pad}${objectExpr},`,
    `${pad}(value) => {`,
    `${pad}${INDENT}const oo = validateInvariants(value, ${literal});`,
    `${pad}${INDENT}return oo.issue`,
    `${pad}${INDENT}${INDENT}.filter((i) => i.severity === "error")`,
    `${pad}${INDENT}${INDENT}.map((i) => ({ message: i.diagnostics }));`,
    `${pad}}`,
    `${close})`,
  ].join("\n");
}

export function createNativeAdapter(rules: PrimitiveRules): ValidatorAdapter {
  return {
    name: "native",
    libImport: (opts?: LibImportOptions) => `import * as s from "${opts?.runtimePath ?? "./__runtime.js"}";`,
    render: (node) => renderNode(node, 0, rules),
    declareConst(exportName, node) {
      return `export const ${exportName} = ${renderNode(node, 0, rules)};`;
    },
    declareExtend(exportName, baseName, fields) {
      const pad = INDENT;
      const lines = fields.map((f) => {
        const keyOk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(f.name);
        const key = keyOk ? f.name : JSON.stringify(f.name);
        const value = renderNode(f.schema, 1, rules);
        return `${pad}${key}: { schema: ${value}, optional: ${f.optional} },`;
      });
      if (lines.length === 0) return `export const ${exportName} = ${baseName};`;
      return `export const ${exportName} = s.extend(${baseName}, {\n${lines.join("\n")}\n});`;
    },
    runtimeFile(): ExtraRuntimeFile {
      return { filename: "__runtime.ts", source: loadNativeRuntime() };
    },
    datatypeAnnotation: (runtimePath: string) => ({
      annotation: "StandardSchema<unknown>",
      importStatement: `import type { StandardSchema } from "${runtimePath}";`,
    }),
  };
}

export const nativeAdapter: ValidatorAdapter = createNativeAdapter(FHIR_PRIMITIVE_RULES);

let cachedRuntime: string | undefined;
function loadNativeRuntime(): string {
  if (cachedRuntime !== undefined) return cachedRuntime;
  // tsup's `shims: true` provides `import.meta.url` in CJS builds.
  const here = dirname(fileURLToPath(import.meta.url));
  cachedRuntime = readFileSync(join(here, "native-runtime.ts"), "utf-8");
  return cachedRuntime;
}

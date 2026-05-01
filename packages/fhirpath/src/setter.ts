/**
 * Write-back through a typed FHIRPath builder. Tracks #50:
 *   https://github.com/awbx/fhir-dsl/issues/50
 *
 * Given a builder expression like
 *   `fhirpath<Patient>("Patient").name.where($this => $this.use.eq("official")).given`
 * `setValue(resource, ["maximilian"])` returns a *new* resource with the path
 * updated, creating any missing intermediate nodes whose shape is implied by
 * the predicate. `createPatch(resource, value)` returns the equivalent
 * RFC 6902 JSON Patch document.
 *
 * Supported subset (everything else throws `FhirPathSetterError`):
 *   - property navigation (`.name.given`)
 *   - `.where($this => $this.field.eq(value))` and conjunctions of the same
 *     shape (`and`-joined equalities) — find or create the matching array
 *     element with the predicate's fields populated.
 *
 * Out of scope intentionally: filter/order/aggregate ops, `select`, math,
 * type narrowing (`ofType`), descendants(), index ops, FHIR functions like
 * `extension(url)` or `resolve()`.
 */

import type { OperatorOp, PathOp } from "./ops.js";
import type { JsonPatchOp } from "./types.js";

export type { JsonPatchOp };

export class FhirPathSetterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FhirPathSetterError";
  }
}

interface PropStep {
  kind: "prop";
  name: string;
}

interface WhereStep {
  kind: "where";
  /** Partial template — values the matching array element must equal. */
  template: Record<string, unknown>;
}

type Step = PropStep | WhereStep;

export function setValue<R>(resource: R, ops: PathOp[], value: unknown): R {
  const steps = opsToSteps(ops);
  const out = deepClone(resource) as Record<string, unknown> | unknown[];
  applySteps(out, steps, value);
  return out as R;
}

export function createPatch(resource: unknown, ops: PathOp[], value: unknown): JsonPatchOp[] {
  const steps = opsToSteps(ops);
  const patch: JsonPatchOp[] = [];
  buildPatch(resource as Record<string, unknown>, steps, value, "", patch);
  return patch;
}

// ──────────────── op → step translation ────────────────

function opsToSteps(ops: PathOp[]): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]!;

    if (op.type === "nav") {
      steps.push({ kind: "prop", name: op.prop });
      continue;
    }

    if (op.type === "where") {
      const template = predicateToTemplate(op.predicate.ops);
      steps.push({ kind: "where", template });
      continue;
    }

    if (op.type === "where_simple") {
      steps.push({ kind: "where", template: { [op.field]: op.value } });
      continue;
    }

    throw new FhirPathSetterError(
      `Unsupported FHIRPath op for setValue/createPatch: '${op.type}'. ` +
        "Supported ops are property navigation and where-equality predicates.",
    );
  }
  return steps;
}

/**
 * Convert a predicate's op list into a partial template by interpreting
 * each comparison as `field = value`. Conjunctions (`and`) merge templates
 * across the conjuncts. Anything else → unsupported.
 *
 * The predicate ops always start with `$this` (or implicit focus); the
 * first nav after that is the field name.
 */
function predicateToTemplate(ops: readonly PathOp[]): Record<string, unknown> {
  // The predicate body looks like a nav chain followed by a comparison op.
  // For `$this.use.eq("official")` → ops are [nav("use"), op(eq, "official")].
  // For `$this.use.eq("official") and $this.system.eq("phone")` the parser
  // emits [...left] then [{ type: "and", other: { ops: [...right] } }] etc.
  return interpretPredicate(ops);
}

function interpretPredicate(ops: readonly PathOp[]): Record<string, unknown> {
  // Walk to the comparison operator, gathering the field path.
  const fieldPath: string[] = [];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]!;
    if (op.type === "nav") {
      fieldPath.push(op.prop);
      continue;
    }
    if (isEqualityOp(op)) {
      if (fieldPath.length === 0) {
        throw new FhirPathSetterError("where(): equality predicate must reference at least one field");
      }
      const template = expandFieldPath(fieldPath, op.value);
      const remaining = ops.slice(i + 1);
      // Conjunctions: continue with the right-hand predicate ops and merge.
      if (remaining.length === 0) return template;
      const conjunct = consumeConjunctions(remaining);
      return mergeTemplates(template, conjunct);
    }
    throw new FhirPathSetterError(
      `where(): unsupported op in predicate: '${op.type}'. ` +
        "Only navigation followed by equality (and 'and'-joined equalities) are supported.",
    );
  }
  throw new FhirPathSetterError(
    "where(): predicate did not resolve to an equality. Setter requires `$this.field.eq(value)`-style predicates.",
  );
}

function consumeConjunctions(ops: readonly PathOp[]): Record<string, unknown> {
  // We only handle 'and' conjunctions where each conjunct is itself a
  // navigation+equality. 'or' is ambiguous (can't construct from it); 'not'
  // can't be inverted into a partial object.
  const op = ops[0];
  if (!op) return {};
  if (op.type === "and" && "other" in op) {
    const right = interpretPredicate(op.other.ops);
    const after = consumeConjunctions(ops.slice(1));
    return mergeTemplates(right, after);
  }
  throw new FhirPathSetterError(`where(): only 'and'-joined equality predicates can be inverted; got '${op.type}'.`);
}

function isEqualityOp(op: PathOp): op is OperatorOp & { type: "eq"; value: unknown } {
  return op.type === "eq";
}

function expandFieldPath(path: string[], value: unknown): Record<string, unknown> {
  // ["use"] + "official" → { use: "official" }
  // ["coding", "code"] + "X" → { coding: { code: "X" } } (best-effort; arrays
  //   inside templates are uncommon for predicates so we don't try to coerce).
  const out: Record<string, unknown> = {};
  let cursor: Record<string, unknown> = out;
  for (let i = 0; i < path.length - 1; i++) {
    const next: Record<string, unknown> = {};
    cursor[path[i]!] = next;
    cursor = next;
  }
  cursor[path[path.length - 1]!] = value;
  return out;
}

function mergeTemplates(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a };
  for (const key of Object.keys(b)) {
    const aVal = out[key];
    const bVal = b[key];
    if (
      aVal &&
      bVal &&
      typeof aVal === "object" &&
      typeof bVal === "object" &&
      !Array.isArray(aVal) &&
      !Array.isArray(bVal)
    ) {
      out[key] = mergeTemplates(aVal as Record<string, unknown>, bVal as Record<string, unknown>);
    } else {
      out[key] = bVal;
    }
  }
  return out;
}

// ──────────────── apply steps to a deep clone ────────────────

function applySteps(root: unknown, steps: readonly Step[], value: unknown): void {
  if (steps.length === 0) {
    throw new FhirPathSetterError("setValue: empty path; nothing to set.");
  }
  let cursor: Record<string, unknown> | unknown[] = root as Record<string, unknown>;
  for (let i = 0; i < steps.length - 1; i++) {
    cursor = walkOrCreate(cursor, steps[i]!, steps[i + 1]!);
  }
  const last = steps[steps.length - 1]!;
  writeFinal(cursor, last, value);
}

function walkOrCreate(
  cursor: Record<string, unknown> | unknown[],
  step: Step,
  next: Step,
): Record<string, unknown> | unknown[] {
  if (step.kind === "prop") {
    if (Array.isArray(cursor)) {
      throw new FhirPathSetterError(
        `setValue: cannot navigate property '${step.name}' on an array — insert a where() filter first.`,
      );
    }
    let child = cursor[step.name];
    if (child == null) {
      // Decide whether to create [] or {} based on the next step shape.
      child = next.kind === "where" ? [] : {};
      cursor[step.name] = child;
    }
    return child as Record<string, unknown> | unknown[];
  }

  // step.kind === "where"
  if (!Array.isArray(cursor)) {
    throw new FhirPathSetterError("setValue: where() applied to a non-array — preceding nav must yield a list.");
  }
  let idx = cursor.findIndex((item) => matchesTemplate(item, step.template));
  if (idx === -1) {
    const created = deepClone(step.template) as Record<string, unknown>;
    cursor.push(created);
    idx = cursor.length - 1;
  }
  return cursor[idx] as Record<string, unknown>;
}

function writeFinal(cursor: Record<string, unknown> | unknown[], step: Step, value: unknown): void {
  if (step.kind === "prop") {
    if (Array.isArray(cursor)) {
      throw new FhirPathSetterError(
        `setValue: cannot write property '${step.name}' on an array; final step must navigate into an object.`,
      );
    }
    cursor[step.name] = value;
    return;
  }
  // where as the terminal step is unusual but defensible: it means "ensure
  // the matching element exists with these fields set".
  if (!Array.isArray(cursor)) {
    throw new FhirPathSetterError("setValue: terminal where() applied to a non-array.");
  }
  const idx = cursor.findIndex((item) => matchesTemplate(item, step.template));
  if (idx === -1) {
    cursor.push(deepClone(value));
  } else {
    cursor[idx] = deepClone(value);
  }
}

function matchesTemplate(item: unknown, template: Record<string, unknown>): boolean {
  if (item == null || typeof item !== "object" || Array.isArray(item)) return false;
  const obj = item as Record<string, unknown>;
  for (const key of Object.keys(template)) {
    const tv = template[key];
    const iv = obj[key];
    if (tv && typeof tv === "object" && !Array.isArray(tv)) {
      if (!matchesTemplate(iv, tv as Record<string, unknown>)) return false;
    } else if (iv !== tv) {
      return false;
    }
  }
  return true;
}

// ──────────────── JSON Patch builder ────────────────

function buildPatch(
  resource: Record<string, unknown> | unknown[],
  steps: readonly Step[],
  value: unknown,
  pathSoFar: string,
  out: JsonPatchOp[],
): void {
  if (steps.length === 0) return;
  // Walk a deep-cloned mirror so we can collapse "create empty array" +
  // "append template" into a single seeded `add`. The mirror is detached
  // from the patch document we emit; we never read it back into the patch.
  let cursor: unknown = deepClone(resource);
  let path = pathSoFar;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const isFinal = i === steps.length - 1;

    if (step.kind === "prop") {
      const segment = `/${jsonPointerEscape(step.name)}`;
      const parent = cursor as Record<string, unknown>;
      const exists = parent != null && typeof parent === "object" && !Array.isArray(parent) && step.name in parent;
      if (isFinal) {
        out.push({ op: exists ? "replace" : "add", path: path + segment, value });
        return;
      }
      if (!exists) {
        const next = steps[i + 1];
        const placeholder: unknown = next?.kind === "where" ? [] : {};
        // The next iteration may decide to seed this array with a
        // predicate template; we'll emit the `add` AFTER that decision.
        // For object placeholders, emit immediately and keep walking.
        if (Array.isArray(placeholder)) {
          // Defer: rewrite the would-be `add /name []` into a single
          // `add /name [seed]` if the next step is a where with no match.
          const where = steps[i + 1] as WhereStep;
          const seed = deepClone(where.template) as Record<string, unknown>;
          (placeholder as unknown[]).push(seed);
          out.push({ op: "add", path: path + segment, value: placeholder });
          path += segment;
          path += "/0";
          cursor = seed;
          // Skip the where step — we already handled it above.
          i += 1;
          // If that where was the FINAL step, write the value now.
          if (i === steps.length - 1) {
            out.push({ op: "replace", path, value });
            return;
          }
          continue;
        }
        out.push({ op: "add", path: path + segment, value: placeholder });
        cursor = placeholder;
        path += segment;
      } else {
        cursor = (parent as Record<string, unknown>)[step.name];
        path += segment;
      }
      continue;
    }

    // where step on an array that already existed at the parent
    if (!Array.isArray(cursor)) {
      throw new FhirPathSetterError("createPatch: where() applied to a non-array.");
    }
    let idx = cursor.findIndex((item) => matchesTemplate(item, step.template));
    if (idx === -1) {
      const seed = deepClone(step.template) as Record<string, unknown>;
      out.push({ op: "add", path: `${path}/-`, value: deepClone(seed) });
      idx = cursor.length;
      cursor.push(seed);
    }
    if (isFinal) {
      out.push({ op: "replace", path: `${path}/${idx}`, value });
      return;
    }
    cursor = cursor[idx];
    path = `${path}/${idx}`;
  }
}

function jsonPointerEscape(segment: string): string {
  // RFC 6901: `~` → `~0`, `/` → `~1`.
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

// ──────────────── tiny deep clone ────────────────

function deepClone<T>(v: T): T {
  if (v == null) return v;
  if (typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(deepClone) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(v as Record<string, unknown>)) {
    out[key] = deepClone((v as Record<string, unknown>)[key]);
  }
  return out as unknown as T;
}

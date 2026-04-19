import type { NavOp } from "../ops.js";
import { boxPrimitive } from "./_internal/primitive-box.js";

// FHIRPath §2.1.9.4 / FHIR §2.1.9.1.1: navigating to a `value[x]` base label
// must dispatch to whichever variant is present on the element (`valueQuantity`,
// `valueString`, …). The runtime has no SpecCatalog, so gate the sibling scan
// on this allowlist of known R5 choice-type base names. Non-choice props like
// `reference` stay on direct-lookup semantics and cannot trip over siblings
// such as `referenceRange`.
const CHOICE_TYPE_BASES: ReadonlySet<string> = new Set([
  "value",
  "effective",
  "onset",
  "abatement",
  "deceased",
  "multipleBirth",
  "occurrence",
  "medication",
  "reported",
  "born",
  "allowed",
  "dose",
  "rate",
  "performed",
  "timing",
  "indication",
  "asNeeded",
  "amount",
  "collected",
  "instantiates",
  "serviced",
  "product",
  "result",
  "source",
]);

function isPrimitiveValue(v: unknown): v is string | number | boolean {
  const t = typeof v;
  return t === "string" || t === "number" || t === "boolean";
}

/**
 * Merge a FHIR primitive value with its `_prop` sibling. Parallel-array
 * primitives use positional siblings (`_prop[i]` describes `prop[i]`);
 * scalars merge one-to-one. Non-primitive values are returned as-is — the
 * spec's "Element with metadata" merge applies only to primitive types.
 */
function mergePrimitiveSibling(value: unknown, sibling: unknown): unknown[] {
  if (Array.isArray(value)) {
    const siblings = Array.isArray(sibling) ? sibling : [];
    return value.map((v, i) => {
      const s = siblings[i];
      if (isPrimitiveValue(v) && s != null && typeof s === "object") {
        return boxPrimitive(v, s as Record<string, unknown>);
      }
      return v;
    });
  }
  if (isPrimitiveValue(value) && sibling != null && typeof sibling === "object") {
    return [boxPrimitive(value, sibling as Record<string, unknown>)];
  }
  return [value];
}

function dispatchChoiceType(item: Record<string, unknown>, prop: string): unknown {
  if (!CHOICE_TYPE_BASES.has(prop)) return undefined;
  for (const key of Object.keys(item)) {
    if (key.length > prop.length && key.startsWith(prop)) {
      const next = key.charCodeAt(prop.length);
      if (next >= 65 && next <= 90) return item[key];
    }
  }
  return undefined;
}

export function evalNav(op: NavOp, collection: unknown[]): unknown[] {
  switch (op.type) {
    case "nav":
      return collection.flatMap((item) => {
        if (item == null || typeof item !== "object") return [];
        const obj = item as Record<string, unknown>;
        let val: unknown = obj[op.prop];
        // §5.1 edge-case a.3 (BUG-024): distinguish explicit-null property
        // values (present but null-valued → yield `{null}`) from absence
        // (yield `{}`). Only `undefined` triggers choice-type fallback and
        // empty return; an explicit `null` is a present collection member.
        if (val === undefined) val = dispatchChoiceType(obj, op.prop);
        if (val === undefined) return [];
        // FP.9 / §2.1.9.2: primitive properties may carry metadata on a
        // `_<prop>` sibling (id, extension, …). Merge the sibling with the
        // primitive so `.extension` / `.id` navigation reaches it.
        const sibling = obj[`_${op.prop}`];
        if (sibling !== undefined) return mergePrimitiveSibling(val, sibling);
        return Array.isArray(val) ? val : [val];
      });

    case "children":
      return collection.flatMap((item) => {
        if (item == null || typeof item !== "object") return [];
        return Object.values(item as Record<string, unknown>).flatMap((val) => {
          if (val == null) return [];
          return Array.isArray(val) ? val : [val];
        });
      });

    case "descendants": {
      // §5.2.3: walk transitive children. Track visited object identities so
      // cyclic FHIR graphs (e.g. Bundle entries that reference each other, or
      // circular contained/extension chains) terminate instead of infinite-
      // looping. `repeat()` uses an analogous `seen` Set in filtering.ts.
      // We dedupe object nodes on the way into `result` as well: an object
      // reached via two paths is the same descendant and should appear once,
      // matching repeat()'s set-semantics. Primitives are not deduped (they
      // have no identity).
      const result: unknown[] = [];
      const seen = new WeakSet<object>();
      const stack = [...collection];
      while (stack.length > 0) {
        const item = stack.pop()!;
        if (item == null || typeof item !== "object") continue;
        if (seen.has(item as object)) continue;
        seen.add(item as object);
        const children = Object.values(item as Record<string, unknown>).flatMap((val) => {
          if (val == null) return [];
          return Array.isArray(val) ? val : [val];
        });
        for (const c of children) {
          if (c != null && typeof c === "object") {
            if (seen.has(c as object)) continue;
            result.push(c);
            stack.push(c);
          } else {
            result.push(c);
          }
        }
      }
      return result;
    }
  }
}

import { findChoiceVariant, recordChoiceType } from "../fhir-choice.js";
import type { NavOp } from "../ops.js";
import { boxPrimitive } from "./_internal/primitive-box.js";

// FHIRPath §2.1.9.4 / FHIR §2.1.9.1.1: navigating to a `value[x]` base label
// dispatches to whichever variant is present on the element (`valueQuantity`,
// `valueString`, …). The base/suffix tables are shared with the invariant
// engine (`../fhir-choice.ts`); non-choice props like `reference` keep
// direct-lookup semantics and cannot trip over siblings such as `referenceRange`.

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

export function evalNav(op: NavOp, collection: unknown[]): unknown[] {
  switch (op.type) {
    case "nav":
      return collection.flatMap((item) => {
        if (item == null || typeof item !== "object") return [];
        const obj = item as Record<string, unknown>;
        let key = op.prop;
        let val: unknown = obj[key];
        // §5.1 edge-case a.3 (BUG-024): distinguish explicit-null property
        // values (present but null-valued → yield `{null}`) from absence
        // (yield `{}`). Only `undefined` triggers choice-type fallback and
        // empty return; an explicit `null` is a present collection member.
        if (val === undefined) {
          const variant = findChoiceVariant(obj, op.prop);
          if (variant === undefined) return [];
          recordChoiceType(variant.value, variant.type);
          key = variant.key;
          val = variant.value;
        }
        // FP.9 / §2.1.9.2: primitive properties may carry metadata on a
        // `_<prop>` sibling (id, extension, …). Merge the sibling with the
        // primitive so `.extension` / `.id` navigation reaches it. For a
        // dispatched choice the sibling follows the concrete key
        // (`_valueString`), not the base label.
        const sibling = obj[`_${key}`];
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

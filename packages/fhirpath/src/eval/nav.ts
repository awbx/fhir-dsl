import type { NavOp } from "../ops.js";

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

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
        if (val == null) val = dispatchChoiceType(obj, op.prop);
        if (val == null) return [];
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
      const result: unknown[] = [];
      const stack = [...collection];
      while (stack.length > 0) {
        const item = stack.pop()!;
        if (item == null || typeof item !== "object") continue;
        const children = Object.values(item as Record<string, unknown>).flatMap((val) => {
          if (val == null) return [];
          return Array.isArray(val) ? val : [val];
        });
        result.push(...children);
        stack.push(...children.filter((c) => c != null && typeof c === "object"));
      }
      return result;
    }
  }
}

import type { NavOp } from "../ops.js";

export function evalNav(op: NavOp, collection: unknown[]): unknown[] {
  switch (op.type) {
    case "nav":
      return collection.flatMap((item) => {
        if (item == null || typeof item !== "object") return [];
        const val = (item as Record<string, unknown>)[op.prop];
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

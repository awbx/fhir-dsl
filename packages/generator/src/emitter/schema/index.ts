import type { ValidatorAdapter } from "./adapter.js";
import { nativeAdapter } from "./native.js";
import { zodAdapter } from "./zod.js";

export type { ObjectField, SchemaNode, ValidatorAdapter } from "./adapter.js";

export function getAdapter(target: "zod" | "native"): ValidatorAdapter {
  switch (target) {
    case "zod":
      return zodAdapter;
    case "native":
      return nativeAdapter;
  }
}

import type { ValidatorAdapter } from "./adapter.js";
import { createNativeAdapter, nativeAdapter } from "./native.js";
import type { PrimitiveRules } from "./primitive-rules.js";
import { createZodAdapter, zodAdapter } from "./zod.js";

export type { ObjectField, SchemaNode, ValidatorAdapter } from "./adapter.js";

export function getAdapter(target: "zod" | "native", rules?: PrimitiveRules): ValidatorAdapter {
  switch (target) {
    case "zod":
      return rules ? createZodAdapter(rules) : zodAdapter;
    case "native":
      return rules ? createNativeAdapter(rules) : nativeAdapter;
  }
}

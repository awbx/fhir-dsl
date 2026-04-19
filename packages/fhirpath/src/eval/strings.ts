import type { StringOp } from "../ops.js";
import { unwrapPrimitive } from "./_internal/primitive-box.js";
import { codePointIndexOf, codePointLength, codePointSlice, toNFC } from "./_internal/strings.js";

// §2.1.20 MUST: string inputs are NFC-normalized and indexed by code points.
// Both the focus string and predicate-side operands (`op.substring`, etc.)
// are normalized so NFD-encoded resources match NFC-encoded server values
// and astral-plane characters count as one character, not two UTF-16 units.

export function evalString(op: StringOp, collection: unknown[]): unknown[] {
  // FP.9: unbox primitive carriers (a FHIR string with `_field.extension`
  // metadata) so string ops operate on the value. The `_field` metadata is
  // orthogonal to string content.
  collection = collection.map(unwrapPrimitive);
  switch (op.type) {
    case "indexOf":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [codePointIndexOf(item, op.substring)];
      });

    case "substring":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        const len = codePointLength(item);
        if (op.start < 0 || op.start >= len) return [];
        return [codePointSlice(item, op.start, op.length ?? undefined)];
      });

    case "startsWith":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [toNFC(item).startsWith(toNFC(op.prefix))];
      });

    case "endsWith":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [toNFC(item).endsWith(toNFC(op.suffix))];
      });

    case "str_contains":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [toNFC(item).includes(toNFC(op.substring))];
      });

    case "upper":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [toNFC(item).toUpperCase()];
      });

    case "lower":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [toNFC(item).toLowerCase()];
      });

    case "replace":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [toNFC(item).split(toNFC(op.pattern)).join(toNFC(op.substitution))];
      });

    case "matches":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [new RegExp(op.regex, "u").test(toNFC(item))];
      });

    case "replaceMatches":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [toNFC(item).replace(new RegExp(op.regex, "gu"), toNFC(op.substitution))];
      });

    case "str_length":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [codePointLength(item)];
      });

    case "toChars":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return Array.from(toNFC(item));
      });
  }
}

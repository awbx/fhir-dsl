import type { StringOp } from "../ops.js";

export function evalString(op: StringOp, collection: unknown[]): unknown[] {
  switch (op.type) {
    case "indexOf":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.indexOf(op.substring)];
      });

    case "substring":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        if (op.start < 0 || op.start >= item.length) return [];
        const result = op.length != null ? item.substring(op.start, op.start + op.length) : item.substring(op.start);
        return [result];
      });

    case "startsWith":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.startsWith(op.prefix)];
      });

    case "endsWith":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.endsWith(op.suffix)];
      });

    case "str_contains":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.includes(op.substring)];
      });

    case "upper":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.toUpperCase()];
      });

    case "lower":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.toLowerCase()];
      });

    case "replace":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.split(op.pattern).join(op.substitution)];
      });

    case "matches":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [new RegExp(op.regex).test(item)];
      });

    case "replaceMatches":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.replace(new RegExp(op.regex, "g"), op.substitution)];
      });

    case "str_length":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return [item.length];
      });

    case "toChars":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        return item.split("");
      });
  }
}

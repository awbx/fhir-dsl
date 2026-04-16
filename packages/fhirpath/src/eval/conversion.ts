import type { ConversionOp } from "../ops.js";

export function evalConversion(op: ConversionOp, collection: unknown[]): unknown[] {
  switch (op.type) {
    case "toBoolean":
      return collection.flatMap((item) => {
        const result = convertToBoolean(item);
        return result != null ? [result] : [];
      });

    case "toInteger":
      return collection.flatMap((item) => {
        const result = convertToInteger(item);
        return result != null ? [result] : [];
      });

    case "toDecimal":
      return collection.flatMap((item) => {
        const result = convertToDecimal(item);
        return result != null ? [result] : [];
      });

    case "toFhirString":
      return collection.flatMap((item) => {
        if (item == null) return [];
        if (typeof item === "string") return [item];
        if (typeof item === "number" || typeof item === "boolean") return [String(item)];
        return [];
      });

    case "toDate":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        // Extract date portion from ISO datetime
        const match = /^\d{4}(-\d{2}(-\d{2})?)?/.exec(item);
        return match ? [match[0]!] : [];
      });

    case "toDateTime":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        // Must be parseable as ISO date or datetime
        const d = Date.parse(item);
        return Number.isNaN(d) ? [] : [item];
      });

    case "toTime":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [];
        const match = /^T?(\d{2}:\d{2}(:\d{2}(\.\d+)?)?)/.exec(item);
        return match ? [match[1]!] : [];
      });

    case "toQuantity":
      return collection.flatMap((item) => {
        if (typeof item === "number") {
          return [{ value: item, unit: op.unit ?? "1" }];
        }
        if (typeof item === "object" && item != null && "value" in item) {
          return [item]; // Already a quantity-like object
        }
        return [];
      });

    case "convertsToBoolean":
      return collection.flatMap((item) => [convertToBoolean(item) != null]);

    case "convertsToInteger":
      return collection.flatMap((item) => [convertToInteger(item) != null]);

    case "convertsToDecimal":
      return collection.flatMap((item) => [convertToDecimal(item) != null]);

    case "convertsToString":
      return collection.flatMap((item) => [
        item != null && (typeof item === "string" || typeof item === "number" || typeof item === "boolean"),
      ]);

    case "convertsToDate":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [false];
        return [/^\d{4}(-\d{2}(-\d{2})?)?/.test(item)];
      });

    case "convertsToDateTime":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [false];
        return [!Number.isNaN(Date.parse(item))];
      });

    case "convertsToTime":
      return collection.flatMap((item) => {
        if (typeof item !== "string") return [false];
        return [/^T?\d{2}:\d{2}(:\d{2}(\.\d+)?)?/.test(item)];
      });

    case "convertsToQuantity":
      return collection.flatMap((item) => {
        if (typeof item === "number") return [true];
        if (typeof item === "object" && item != null && "value" in item) return [true];
        return [false];
      });
  }
}

function convertToBoolean(item: unknown): boolean | undefined {
  if (typeof item === "boolean") return item;
  if (typeof item === "string") {
    if (item === "true") return true;
    if (item === "false") return false;
    return undefined;
  }
  if (typeof item === "number") {
    if (item === 1) return true;
    if (item === 0) return false;
    return undefined;
  }
  return undefined;
}

function convertToInteger(item: unknown): number | undefined {
  if (typeof item === "number" && Number.isInteger(item)) return item;
  if (typeof item === "string") {
    const n = Number.parseInt(item, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  if (typeof item === "boolean") return item ? 1 : 0;
  return undefined;
}

function convertToDecimal(item: unknown): number | undefined {
  if (typeof item === "number") return item;
  if (typeof item === "string") {
    const n = Number.parseFloat(item);
    return Number.isNaN(n) ? undefined : n;
  }
  if (typeof item === "boolean") return item ? 1.0 : 0.0;
  return undefined;
}

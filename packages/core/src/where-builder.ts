import type { SearchPrefixFor } from "./types.js";

/**
 * One leaf condition: `[paramName, operator, value]`. Each tuple's operator
 * and value are typed against the paramName via the search-param map.
 */
export type ConditionTuple<SP> = {
  [K in string & keyof SP]: SP[K] extends { value: infer V }
    ? readonly [K, SearchPrefixFor<SP[K]>, V]
    : readonly [K, SearchPrefixFor<SP[K]>, string];
}[string & keyof SP];

export interface ConditionGroup<SP> {
  readonly type: "and" | "or";
  readonly conditions: ReadonlyArray<Condition<SP>>;
}

export type Condition<SP> = ConditionTuple<SP> | ConditionGroup<SP>;

/**
 * The builder passed to `where(cb)` callbacks. Provides `.and(...)` and
 * `.or(...)` constructors that wrap a list of conditions into a group.
 *
 * Groups are pure data; `where(cb)` runs the callback once at compile time
 * to extract the tree, then routes it to either implicit-AND, comma-OR, or
 * `_filter` depending on shape.
 */
export interface WhereBuilder<SP> {
  and(conditions: ReadonlyArray<Condition<SP>>): ConditionGroup<SP>;
  or(conditions: ReadonlyArray<Condition<SP>>): ConditionGroup<SP>;
}

export function createWhereBuilder<SP>(): WhereBuilder<SP> {
  return {
    and: (conditions) => ({ type: "and", conditions }),
    or: (conditions) => ({ type: "or", conditions }),
  };
}

export function isConditionGroup<SP>(node: Condition<SP>): node is ConditionGroup<SP> {
  return !Array.isArray(node) && typeof node === "object" && node !== null && "type" in node && "conditions" in node;
}

export interface ResolvedCode {
  code: string;
  display?: string | undefined;
  system?: string | undefined;
}

export interface ResolvedValueSet {
  url: string;
  name: string;
  version?: string | undefined;
  codes: ResolvedCode[];
  /** true if all includes were resolved offline; false if some were skipped */
  isComplete: boolean;
}

/**
 * Phase 3.2 — extended concept model.
 *
 * `parents` carries the codes inherited via `concept.property[code=parent]`
 * (or implicit nesting under another concept). `children` is the inverse,
 * derived after a full pass. Both are optional; older callers that only
 * need `code`/`display` keep working.
 */
export interface ConceptNode {
  code: string;
  display?: string | undefined;
  /** Hierarchy parents (direct). Empty for root concepts. */
  parents?: readonly string[] | undefined;
  /** Direct children (computed after the full code system loads). */
  children?: readonly string[] | undefined;
  /** Concept-level properties (`property[code]` → value). */
  properties?: Readonly<Record<string, string | number | boolean>> | undefined;
  /** Localized / alternate display strings. */
  designations?: ReadonlyArray<{ language?: string | undefined; use?: string | undefined; value: string }> | undefined;
}

export interface CodeSystemModel {
  url: string;
  name: string;
  content: "complete" | "not-present" | "example" | "fragment" | "supplement";
  concepts: ResolvedCode[];
  /** Phase 3.2: hierarchy + properties for each concept. Aligned with `concepts` by `.code`. */
  nodes?: readonly ConceptNode[] | undefined;
  /**
   * Phase 3.2: returns true when `descendant` is `ancestor` or has it
   * transitively in its `parents` chain. Implemented by the parser when
   * a hierarchy is present.
   */
  isA?: ((ancestor: string, descendant: string) => boolean) | undefined;
}

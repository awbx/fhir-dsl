import type { TypeRef } from "./resource-model.js";

// Phase 2.2 — IR for IG-defined extension StructureDefinitions.
//
// FHIR extensions are SDs with `type: "Extension"`, `kind: "complex-type"`,
// `derivation: "constraint"`, and a fixed `Extension.url`. Most have a
// single narrowed `value[x]` (simple extensions); a smaller set defines
// sub-extensions instead (complex). For the first cut we model only the
// simple shape — a complex extension is recorded but emits as
// `Extension<URL>` with no narrowed value, deferring sub-extension
// emission to a later phase.

export interface ExtensionModel {
  /** Sanitised PascalCase name for the emitted interface (e.g. `USCoreRaceExtension`). */
  name: string;
  /** Canonical URL — the value of `Extension.url` after profiling. */
  url: string;
  /** Source IG package name. */
  igName: string;
  /** Title or short description from the SD. */
  description?: string | undefined;
  /**
   * Allowed types for `value[x]` after profiling. Empty when the
   * extension is complex (sub-extensions only) — emitter falls back to
   * the open `Extension<URL>` shape in that case.
   */
  valueTypes: TypeRef[];
  /** True for extensions that nest sub-extensions instead of carrying a value. */
  isComplex: boolean;
}

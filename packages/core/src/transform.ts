import type { PathToCodingArray, PathToSystemValueArray, PathValue, ValidatePath } from "./path.js";
import type { BundleLink, ExecuteOptions, StreamOptions } from "./query-builder.js";

// The `t` projection namespace. Callers pass `t => ({ ... })` to
// `.transform()` and get back typed rows. Every helper returns a concrete
// value — no wrappers, no thunks. Nulls are sinkable: if any segment of a
// path is null/undefined, the helper returns the supplied fallback (or `null`
// for `ref` / `coding` / `valueOf`) without calling the user's `map`.

/**
 * Declaration-merging surface for user-land helpers. Mirrors the Zod/Kysely
 * pattern: consumers augment this interface with `declare module` and register
 * an implementation via `registerTHelper`. Helpers mounted this way appear on
 * every `t` closure produced by `.transform(...)`.
 *
 * Example:
 * ```ts
 * declare module "@fhir-dsl/core" {
 *   interface TExtensions<Scope> {
 *     age(dob: Path<Scope>): number | null;
 *   }
 * }
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: intentional declaration-merging surface
// biome-ignore lint/correctness/noUnusedVariables: Scope is exposed to consumers via module augmentation
export interface TExtensions<Scope> {}

/**
 * Projection namespace passed to `.transform(fn)`. `t(path, fallback, map?)`
 * reads a single field, walking through `.include()`d references when the path
 * crosses an activated reference field. Paths are constrained by `Scope`, so
 * only fields whose references were `.include()`d descend into the target
 * resource.
 */
export interface T<Scope> extends TExtensions<Scope> {
  <P extends string, D, R = NonNullable<PathValue<Scope, P>>>(
    path: P & ValidatePath<Scope, P>,
    fallback: D,
    map?: (value: NonNullable<PathValue<Scope, P>>) => R,
  ): R | D;

  /**
   * Strip the `TypeName/` prefix from a reference string and return the bare
   * id. Returns `null` if the path is nullish or the value isn't a string.
   * Paths pointing at the structural Reference fields (`.reference`, `.type`,
   * `.identifier`, `.display`) are read directly and are NOT dereferenced.
   */
  ref: <P extends string>(path: P & ValidatePath<Scope, P>) => string | null;

  /**
   * Scan an array of `{ system?, code? }` and return the first code whose
   * `system` matches. Returns `null` if the path is missing, the array is
   * empty, or no entry matches.
   */
  coding: <P extends PathToCodingArray<Scope>>(path: P, system: string) => string | null;

  /**
   * Same shape as `coding` but for arrays of `{ system?, value? }` —
   * telecom, identifier.
   */
  valueOf: <P extends PathToSystemValueArray<Scope>>(path: P, system: string) => string | null;

  /**
   * Map a string value through a lookup table. Returns the mapped value if the
   * key is present, otherwise the fallback. Accepts a plain record or a `Map`.
   */
  enum: <P extends string, R>(
    path: P & ValidatePath<Scope, P>,
    table: ReadonlyMap<string, R> | Readonly<Record<string, R>>,
    fallback: NoInfer<R>,
  ) => R;

  /**
   * **Type-unsafe escape hatch** — same runtime behavior as `t(path, fallback, map?)`
   * but accepts `path: string` directly, bypassing the `Path<Scope>` constraint.
   *
   * Use this when you're projecting a high-row-count dataset with a wide scope
   * (e.g. Encounter + 3 includes) and IntelliSense on the typed form is
   * noticeably slow. The runtime still walks and auto-dereferences through
   * activated expressions — you just lose compile-time path validation and
   * return-type inference (result is `R | D`, where `R` defaults to `unknown`).
   *
   * Prefer the typed `t(...)` callable for normal use.
   */
  raw: <R = unknown, D = null>(path: string, fallback: D, map?: (value: unknown) => R) => R | D;
}

/**
 * The result of `.transform(fn)`. Deferred execution like the parent builder —
 * nothing is dispatched until `.execute()` or `.stream()` is called.
 */
export interface TransformedQuery<Out> {
  execute(options?: StreamOptions): Promise<TransformedResult<Out>>;
  stream(options?: StreamOptions): AsyncIterable<Out>;
}

export interface TransformedResult<Out> {
  data: Out[];
  total?: number | undefined;
  link?: BundleLink[] | undefined;
  raw: unknown;
}

/**
 * The result of `.transform(fn)` on a `.read(...)` builder. Single-resource —
 * no bundle, no pagination, no auto-dereferencing. `t(path, fallback)` walks
 * the resource directly with the same nullish-fallback semantics as the search
 * variant.
 */
export interface ReadTransformedQuery<Out> {
  execute(options?: ExecuteOptions): Promise<Out>;
}

// Reference structural fields: when the user's path steps into one of these
// right after reaching an activated reference field, we do NOT dereference —
// they want the Reference itself. This is the mechanism that lets
// `t.ref("subject.reference")` and `t("subject.name", ...)` coexist on a
// type where `subject` is `Reference | Patient`.
const REFERENCE_FIELDS = new Set(["reference", "type", "identifier", "display"]);

type ReferenceLike = { reference?: unknown; type?: unknown; identifier?: unknown; display?: unknown };

function isReferenceLike(value: unknown): value is ReferenceLike {
  return typeof value === "object" && value !== null && typeof (value as ReferenceLike).reference === "string";
}

/** Precompiled path — split into segments once per `.transform()` call, reused per row. */
export interface CompiledPath {
  segments: string[];
}

export function compilePath(path: string): CompiledPath {
  return { segments: path.split(".") };
}

// Structural walker over unknown bundle JSON — `any` is intentional here.
type Json = any;

/**
 * Walk `root` along `compiled`, transparently dereferencing into `includedMap`
 * when a canonical sub-path matches an entry in `activatedExpressions`.
 *
 * Returns `undefined` for any missing segment — callers convert that to their
 * own fallback (or `null` for `t.ref` / `t.coding` / `t.valueOf`). Never
 * throws: we deliberately swallow missing-include failures since servers may
 * legitimately drop includes (permissions, bundle filters).
 */
export function walkPath(
  root: Json,
  compiled: CompiledPath,
  activatedExpressions: ReadonlySet<string>,
  includedMap: ReadonlyMap<string, Json>,
): Json {
  let current: Json = root;
  const canonical: string[] = [];
  const segments = compiled.segments;

  for (let i = 0; i < segments.length; i++) {
    if (current == null) return undefined;

    const seg = segments[i]!;
    const isNumeric = seg.length > 0 && seg.charCodeAt(0) >= 0x30 && seg.charCodeAt(0) <= 0x39 && /^\d+$/.test(seg);

    if (isNumeric) {
      if (!Array.isArray(current)) return undefined;
      const idx = Number.parseInt(seg, 10);
      current = current[idx];
      continue;
    }

    if (Array.isArray(current)) {
      // Named access against an array without an index is ambiguous — the
      // FHIRPath equivalent would flatMap, but we chose explicit-indexing
      // semantics in the type layer. Return undefined rather than guessing.
      return undefined;
    }
    if (typeof current !== "object") return undefined;

    current = (current as Record<string, Json>)[seg];
    canonical.push(seg);

    if (current != null && isReferenceLike(current) && activatedExpressions.has(canonical.join("."))) {
      const nextSeg = segments[i + 1];
      const nextIsRefField = nextSeg !== undefined && REFERENCE_FIELDS.has(nextSeg);
      if (!nextIsRefField) {
        const resolved = includedMap.get(String((current as ReferenceLike).reference));
        if (resolved !== undefined) {
          current = resolved;
        }
      }
    }
  }

  return current;
}

// --- TExtensions runtime registry ---

type HelperImpl = (root: Json, ctx: WalkerCtx, ...args: unknown[]) => unknown;
const registeredHelpers = new Map<string, HelperImpl>();

interface WalkerCtx {
  activatedExpressions: ReadonlySet<string>;
  includedMap: ReadonlyMap<string, Json>;
  compile: (path: string) => CompiledPath;
  walk: (path: string) => Json;
}

/**
 * Register a user-land helper that becomes callable as `t.<name>(...)` on
 * every `t` closure. Augment `TExtensions<Scope>` with a matching method
 * signature (via `declare module`) to make it typecheck.
 *
 * The impl receives a walker context — call `ctx.walk(path)` to read a path
 * through the same dereferencing machinery `t(...)` uses.
 */
export function registerTHelper(name: string, impl: (ctx: WalkerCtx, ...args: unknown[]) => unknown): void {
  registeredHelpers.set(name, (_root, ctx, ...args) => impl(ctx, ...args));
}

export function unregisterTHelper(name: string): void {
  registeredHelpers.delete(name);
}

// --- t factory ---

function stripRefPrefix(ref: string): string {
  const slash = ref.indexOf("/");
  return slash >= 0 ? ref.substring(slash + 1) : ref;
}

export function makeT<Scope>(
  root: Json,
  activatedExpressions: ReadonlySet<string>,
  includedMap: ReadonlyMap<string, Json>,
  pathCache: Map<string, CompiledPath>,
): T<Scope> {
  const compile = (path: string): CompiledPath => {
    let hit = pathCache.get(path);
    if (!hit) {
      hit = compilePath(path);
      pathCache.set(path, hit);
    }
    return hit;
  };

  const walk = (path: string): Json => walkPath(root, compile(path), activatedExpressions, includedMap);

  const base = ((path: string, fallback: unknown, map?: (v: unknown) => unknown) => {
    const v = walk(path);
    if (v == null) return fallback;
    return map ? map(v) : v;
  }) as unknown as T<Scope>;

  base.ref = ((path: string) => {
    const v = walk(path);
    if (typeof v === "string") return stripRefPrefix(v);
    if (v != null && typeof v === "object" && typeof (v as ReferenceLike).reference === "string") {
      return stripRefPrefix((v as { reference: string }).reference);
    }
    return null;
  }) as T<Scope>["ref"];

  base.coding = ((path: string, system: string) => {
    const v = walk(path);
    if (!Array.isArray(v)) return null;
    for (const entry of v) {
      if (entry && typeof entry === "object" && entry.system === system && typeof entry.code === "string") {
        return entry.code as string;
      }
    }
    return null;
  }) as T<Scope>["coding"];

  base.valueOf = ((path: string, system: string) => {
    const v = walk(path);
    if (!Array.isArray(v)) return null;
    for (const entry of v) {
      if (entry && typeof entry === "object" && entry.system === system && typeof entry.value === "string") {
        return entry.value as string;
      }
    }
    return null;
  }) as T<Scope>["valueOf"];

  base.enum = ((path: string, table: ReadonlyMap<string, unknown> | Record<string, unknown>, fallback: unknown) => {
    const v = walk(path);
    if (typeof v !== "string") return fallback;
    if (table instanceof Map) {
      return table.has(v) ? table.get(v) : fallback;
    }
    return Object.hasOwn(table, v) ? (table as Record<string, unknown>)[v] : fallback;
  }) as T<Scope>["enum"];

  base.raw = ((path: string, fallback: unknown, map?: (v: unknown) => unknown) => {
    const v = walk(path);
    if (v == null) return fallback;
    return map ? map(v) : v;
  }) as T<Scope>["raw"];

  if (registeredHelpers.size > 0) {
    const ctx: WalkerCtx = { activatedExpressions, includedMap, compile, walk };
    for (const [name, impl] of registeredHelpers) {
      (base as unknown as Record<string, unknown>)[name] = (...args: unknown[]) => impl(root, ctx, ...args);
    }
  }

  return base;
}

// --- Activated-expression discovery ---
//
// Given the configured includes on the builder and the schema's
// `includeExpressions`, compute the set of canonical dotted expressions that
// are "activated". Pulled out so the impl can precompute it once per
// `.transform()` call instead of per row.

export function collectActivatedExpressions(
  expressionsForResource: Record<string, string | readonly string[]> | undefined,
  activeParams: readonly string[],
): Set<string> {
  const set = new Set<string>();
  if (!expressionsForResource) return set;
  for (const param of activeParams) {
    const expr = expressionsForResource[param];
    if (!expr) continue;
    // Multi-expression params (e.g. `Encounter.subject | Encounter.patient`)
    // emit as `string[]` at runtime. Single-expression params emit as a plain
    // string. Both shapes are valid — we just union all paths into the set.
    if (typeof expr === "string") set.add(expr);
    else for (const e of expr) set.add(e);
  }
  return set;
}

/**
 * Build the `includedMap` for a single bundle — keyed by `"ResourceType/id"`.
 * Entries without both fields are skipped (servers sometimes return
 * `urn:uuid:` references, which don't participate in our auto-deref scheme).
 */
export function buildIncludedMap(included: readonly Json[]): Map<string, Json> {
  const map = new Map<string, Json>();
  for (const resource of included) {
    if (!resource || typeof resource !== "object") continue;
    const rt = (resource as { resourceType?: unknown }).resourceType;
    const id = (resource as { id?: unknown }).id;
    if (typeof rt === "string" && typeof id === "string") {
      map.set(`${rt}/${id}`, resource);
    }
  }
  return map;
}

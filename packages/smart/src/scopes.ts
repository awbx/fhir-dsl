/**
 * SMART v2 scope helpers.
 * @see https://hl7.org/fhir/smart-app-launch/scopes-and-launch-context.html
 */

export type ScopeContext = "patient" | "user" | "system";
export type ScopePermission = "c" | "r" | "u" | "d" | "s";

const PERM_ORDER: readonly ScopePermission[] = ["c", "r", "u", "d", "s"] as const;

export interface ResourceScopeOpts {
  context: ScopeContext;
  resource: string;
  perms: Partial<Record<ScopePermission, boolean>> | ScopePermission[] | "*";
  params?: Record<string, string | number | Array<string | number>>;
}

export interface ParsedResourceScope {
  kind: "resource";
  context: ScopeContext;
  resource: string;
  perms: ScopePermission[];
  params: Record<string, string[]>;
}

export interface ParsedLaunchScope {
  kind: "launch";
  context?: "patient" | "encounter";
}

export interface ParsedSimpleScope {
  kind: "simple";
  name: string;
}

export type ParsedScope = ParsedResourceScope | ParsedLaunchScope | ParsedSimpleScope;

export const openid = "openid";
export const fhirUser = "fhirUser";
export const offlineAccess = "offline_access";
export const onlineAccess = "online_access";

/**
 * Build a single SMART v2 resource scope.
 * Examples:
 *   resourceScope({ context: "patient", resource: "Observation", perms: ["r", "s"] })
 *     → "patient/Observation.rs"
 *   resourceScope({ context: "system", resource: "*", perms: "*" })
 *     → "system/*.cruds"
 */
export function resourceScope(opts: ResourceScopeOpts): string {
  const perms = normalizePerms(opts.perms);
  if (perms.length === 0) {
    throw new Error("resourceScope requires at least one permission");
  }
  let out = `${opts.context}/${opts.resource}.${perms.join("")}`;
  if (opts.params) {
    const qs = serializeScopeParams(opts.params);
    if (qs) out += `?${qs}`;
  }
  return out;
}

/**
 * Build a launch-context scope: "launch", "launch/patient", or "launch/encounter".
 */
export function launchScope(ctx?: "patient" | "encounter"): string {
  return ctx ? `launch/${ctx}` : "launch";
}

/**
 * Join scope parts into a single space-delimited scope string, trimming falsy
 * values. Accepts nested arrays for ergonomic composition.
 */
export function buildScopes(...parts: Array<string | false | null | undefined | string[]>): string {
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) {
      for (const q of p) if (q) out.push(q);
    } else {
      out.push(p);
    }
  }
  return out.join(" ");
}

/**
 * Parse a single scope string. Recognizes v2 resource scopes, launch scopes,
 * and OIDC/refresh scopes.
 */
export function parseScope(scope: string): ParsedScope {
  const s = scope.trim();
  if (s === "launch") return { kind: "launch" };
  if (s === "launch/patient") return { kind: "launch", context: "patient" };
  if (s === "launch/encounter") return { kind: "launch", context: "encounter" };

  const m = /^(patient|user|system)\/([^.]+)\.([cruds]+)(?:\?(.*))?$/.exec(s);
  if (m) {
    const [, ctxRaw, resource, permsRaw, query] = m;
    const perms = Array.from(new Set(permsRaw!.split("") as ScopePermission[])).sort(
      (a, b) => PERM_ORDER.indexOf(a) - PERM_ORDER.indexOf(b),
    );
    return {
      kind: "resource",
      context: ctxRaw as ScopeContext,
      resource: resource!,
      perms,
      params: parseScopeParams(query),
    };
  }

  return { kind: "simple", name: s };
}

function normalizePerms(perms: ResourceScopeOpts["perms"]): ScopePermission[] {
  let list: ScopePermission[];
  if (perms === "*") {
    list = [...PERM_ORDER];
  } else if (Array.isArray(perms)) {
    list = perms;
  } else {
    list = (Object.keys(perms) as ScopePermission[]).filter((k) => perms[k]);
  }
  const unique = Array.from(new Set(list));
  unique.sort((a, b) => PERM_ORDER.indexOf(a) - PERM_ORDER.indexOf(b));
  return unique;
}

function serializeScopeParams(params: Record<string, string | number | Array<string | number>>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    const values = Array.isArray(v) ? v : [v];
    for (const vv of values) {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(vv))}`);
    }
  }
  return parts.join("&");
}

function parseScopeParams(query: string | undefined): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!query) return out;
  for (const part of query.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const k = decodeURIComponent(eq === -1 ? part : part.slice(0, eq));
    const v = eq === -1 ? "" : decodeURIComponent(part.slice(eq + 1));
    const bucket = out[k] ?? [];
    bucket.push(v);
    out[k] = bucket;
  }
  return out;
}

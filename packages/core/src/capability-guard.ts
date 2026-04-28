// Phase 4.1 — runtime guard derived from a server's CapabilityStatement.
//
// FHIR servers advertise which interactions they support per resource
// (read / vread / search / create / update / patch / delete / history)
// plus capability flags (versioning, conditional ops, search params,
// supported profiles). Until now consumers had no way to detect a
// mismatch except by trying the call and seeing a 404 / 400.
//
// `createCapabilityGuard(stmt, opts)` produces a `CapabilityGuard` —
// a small object that exposes typed predicates plus a `check` method
// that fires on every attempted interaction and throws / warns / logs
// according to `opts.onUnsupported`.
//
// The guard is intentionally additive: wrap any FhirClient call in
// `guard.check("read", "Patient")` before issuing it, or compose the
// guard into your own client wrapper. We don't modify FhirClient
// directly so existing consumers keep working unchanged.

export type FhirInteraction =
  | "read"
  | "vread"
  | "update"
  | "patch"
  | "delete"
  | "history-instance"
  | "history-type"
  | "history-system"
  | "create"
  | "search-type"
  | "search-system"
  | "capabilities"
  | "transaction"
  | "batch"
  | "operation";

export type UnsupportedAction = "throw" | "warn" | "log" | "ignore";

interface CapabilityResource {
  type: string;
  interaction?: Array<{ code: string }>;
  versioning?: string;
  readHistory?: boolean;
  updateCreate?: boolean;
  conditionalCreate?: boolean;
  conditionalRead?: string;
  conditionalUpdate?: boolean;
  conditionalDelete?: string;
  searchParam?: Array<{ name: string; type: string }>;
  supportedProfile?: string[];
}

interface CapabilityRest {
  mode: "client" | "server";
  resource?: CapabilityResource[];
  interaction?: Array<{ code: string }>;
}

export interface CapabilityStatementShape {
  resourceType: "CapabilityStatement";
  rest?: CapabilityRest[];
}

export interface CapabilityGuardOptions {
  /** What to do when a check fails. Default: "warn". */
  onUnsupported?: UnsupportedAction;
  /** Treat resources missing from the statement as supporting everything (`true`) or nothing (`false`). Default: `true` (forgiving). */
  assumeMissingSupportsAll?: boolean;
}

export interface CapabilityGuard {
  /** Throws / warns / logs based on options if the interaction is unsupported. Returns `true` if the call is safe to proceed. */
  check(interaction: FhirInteraction, resourceType?: string): boolean;
  /** Pure predicate — does not enforce, just answers the question. */
  supports(interaction: FhirInteraction, resourceType?: string): boolean;
  /** Search params advertised for a resource (empty when missing → unknown). */
  searchParamsFor(resourceType: string): readonly string[];
  /** Profiles the server advertises support for, per resource. */
  supportedProfilesFor(resourceType: string): readonly string[];
  /** Conditional-operation flag accessor. */
  supportsConditional(resourceType: string, op: "create" | "read" | "update" | "delete"): boolean;
}

export function createCapabilityGuard(
  stmt: CapabilityStatementShape,
  opts: CapabilityGuardOptions = {},
): CapabilityGuard {
  const { onUnsupported = "warn", assumeMissingSupportsAll = true } = opts;
  const server = stmt.rest?.find((r) => r.mode === "server");
  const systemInteractions = new Set((server?.interaction ?? []).map((i) => i.code));
  const byResource = new Map<string, CapabilityResource>();
  for (const r of server?.resource ?? []) {
    byResource.set(r.type, r);
  }

  function supports(interaction: FhirInteraction, resourceType?: string): boolean {
    if (
      interaction === "transaction" ||
      interaction === "batch" ||
      interaction === "search-system" ||
      interaction === "history-system" ||
      interaction === "capabilities"
    ) {
      return systemInteractions.has(interaction) || interaction === "capabilities";
    }
    if (interaction === "operation") return true;
    if (!resourceType) return assumeMissingSupportsAll;
    const r = byResource.get(resourceType);
    if (!r) return assumeMissingSupportsAll;
    const codes = new Set((r.interaction ?? []).map((i) => i.code));
    return codes.has(interaction);
  }

  function check(interaction: FhirInteraction, resourceType?: string): boolean {
    if (supports(interaction, resourceType)) return true;
    const message = `CapabilityGuard: server does not advertise '${interaction}'${
      resourceType ? ` on ${resourceType}` : ""
    }`;
    if (onUnsupported === "throw") throw new Error(message);
    if (onUnsupported === "warn") console.warn(message);
    else if (onUnsupported === "log") console.log(message);
    return false;
  }

  function searchParamsFor(resourceType: string): readonly string[] {
    return (byResource.get(resourceType)?.searchParam ?? []).map((p) => p.name);
  }

  function supportedProfilesFor(resourceType: string): readonly string[] {
    return byResource.get(resourceType)?.supportedProfile ?? [];
  }

  function supportsConditional(resourceType: string, op: "create" | "read" | "update" | "delete"): boolean {
    const r = byResource.get(resourceType);
    if (!r) return assumeMissingSupportsAll;
    switch (op) {
      case "create":
        return r.conditionalCreate === true;
      case "read":
        return Boolean(r.conditionalRead && r.conditionalRead !== "not-supported");
      case "update":
        return r.conditionalUpdate === true;
      case "delete":
        return Boolean(r.conditionalDelete && r.conditionalDelete !== "not-supported");
    }
  }

  return { check, supports, searchParamsFor, supportedProfilesFor, supportsConditional };
}

/**
 * Convenience: fetch a server's CapabilityStatement and build a guard
 * in one call.
 *
 *   const guard = await capabilityGuardFromUrl("https://hapi.fhir.org/baseR4");
 *   guard.check("patch", "Patient"); // warns or throws on unsupported
 */
export async function capabilityGuardFromUrl(
  baseUrl: string,
  opts: CapabilityGuardOptions = {},
  fetcher: typeof fetch = fetch,
): Promise<CapabilityGuard> {
  const url = `${baseUrl.replace(/\/$/, "")}/metadata`;
  const res = await fetcher(url, { headers: { accept: "application/fhir+json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  const stmt = (await res.json()) as CapabilityStatementShape;
  if (stmt.resourceType !== "CapabilityStatement") {
    throw new Error("CapabilityGuard: response is not a CapabilityStatement");
  }
  return createCapabilityGuard(stmt, opts);
}

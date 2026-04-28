import type { AuthResolver } from "./auth.js";
import type { VerbCall, VerbResult } from "./types.js";

// Phase 8.2 — single-purpose HTTP client for the bound FHIR server.
// Each verb maps onto one `fetch` invocation; auth headers are resolved
// per-call so dynamic-token strategies (refresh tokens, JWT assertions)
// stay live. We deliberately keep this tiny — the typed query builder in
// `@fhir-dsl/core` is the user-facing surface; this is the bare wire-
// level layer the MCP dispatcher reaches for when serving an LLM.

export interface UpstreamConfig {
  baseUrl: string;
  auth: AuthResolver;
  fetch?: typeof globalThis.fetch;
}

export class FhirUpstream {
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly base: string;

  constructor(private readonly config: UpstreamConfig) {
    this.fetchImpl = config.fetch ?? globalThis.fetch;
    this.base = config.baseUrl.replace(/\/$/, "");
  }

  async run(call: VerbCall): Promise<VerbResult> {
    const start = Date.now();
    try {
      const { url, init } = await this.buildRequest(call);
      const response = await this.fetchImpl(url, init);
      const text = await response.text();
      const body = text.length > 0 ? safeJsonParse(text) : undefined;
      const latencyMs = Date.now() - start;
      if (!response.ok) {
        const upstreamOutcome = isOperationOutcome(body) ? body : null;
        return {
          ok: false,
          outcome:
            upstreamOutcome ??
            ({
              resourceType: "OperationOutcome",
              issue: [
                {
                  severity: "error",
                  code: "exception",
                  diagnostics: `Upstream ${response.status} ${response.statusText}`,
                },
              ],
            } as const),
          latencyMs,
        };
      }
      return { ok: true, body, latencyMs };
    } catch (err) {
      return {
        ok: false,
        outcome: {
          resourceType: "OperationOutcome",
          issue: [
            {
              severity: "error",
              code: "transient",
              diagnostics: `Upstream error: ${(err as Error).message}`,
            },
          ],
        },
        latencyMs: Date.now() - start,
      };
    }
  }

  private async buildRequest(call: VerbCall): Promise<{ url: string; init: RequestInit }> {
    const auth = await this.config.auth.authorize();
    const baseHeaders: Record<string, string> = {
      Accept: "application/fhir+json",
      ...stripUndefined(auth),
    };
    switch (call.verb) {
      case "read":
        return { url: `${this.base}/${call.resourceType}/${requireId(call)}`, init: { headers: baseHeaders } };
      case "vread": {
        const versionId = readStringParam(call, "versionId");
        if (!versionId) throw new Error("vread requires params.versionId");
        return {
          url: `${this.base}/${call.resourceType}/${requireId(call)}/_history/${versionId}`,
          init: { headers: baseHeaders },
        };
      }
      case "search": {
        const qs = buildQueryString(call.params);
        const path = call.resourceType ? `${call.resourceType}` : "";
        return { url: `${this.base}/${path}${qs}`, init: { headers: baseHeaders } };
      }
      case "history": {
        const path = call.id
          ? `${this.base}/${call.resourceType}/${call.id}/_history`
          : `${this.base}/${call.resourceType}/_history`;
        return { url: path, init: { headers: baseHeaders } };
      }
      case "capabilities":
        return { url: `${this.base}/metadata`, init: { headers: baseHeaders } };
      case "create":
        return {
          url: `${this.base}/${call.resourceType}`,
          init: {
            method: "POST",
            headers: { ...baseHeaders, "Content-Type": "application/fhir+json" },
            body: JSON.stringify(call.params ?? {}),
          },
        };
      case "update":
        return {
          url: `${this.base}/${call.resourceType}/${requireId(call)}`,
          init: {
            method: "PUT",
            headers: { ...baseHeaders, "Content-Type": "application/fhir+json" },
            body: JSON.stringify(call.params ?? {}),
          },
        };
      case "patch":
        return {
          url: `${this.base}/${call.resourceType}/${requireId(call)}`,
          init: {
            method: "PATCH",
            headers: { ...baseHeaders, "Content-Type": "application/json-patch+json" },
            body: JSON.stringify(call.patch ?? []),
          },
        };
      case "delete":
        return {
          url: `${this.base}/${call.resourceType}/${requireId(call)}`,
          init: { method: "DELETE", headers: baseHeaders },
        };
      case "operation": {
        if (!call.operation) throw new Error("operation verb requires `operation` field");
        const segment = call.operation.startsWith("$") ? call.operation : `$${call.operation}`;
        const path = call.id
          ? `${this.base}/${call.resourceType}/${call.id}/${segment}`
          : call.resourceType
            ? `${this.base}/${call.resourceType}/${segment}`
            : `${this.base}/${segment}`;
        return {
          url: path,
          init: {
            method: "POST",
            headers: { ...baseHeaders, "Content-Type": "application/fhir+json" },
            body: JSON.stringify(call.params ?? { resourceType: "Parameters", parameter: [] }),
          },
        };
      }
    }
  }
}

function requireId(call: VerbCall): string {
  if (!call.id) throw new Error(`${call.verb} requires an id`);
  return call.id;
}

function readStringParam(call: VerbCall, key: string): string | undefined {
  const v = call.params?.[key];
  return typeof v === "string" ? v : undefined;
}

function buildQueryString(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

function stripUndefined(headers: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isOperationOutcome(value: unknown): value is { resourceType: "OperationOutcome" } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { resourceType?: unknown }).resourceType === "OperationOutcome"
  );
}

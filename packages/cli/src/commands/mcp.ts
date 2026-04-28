import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer, JsonLogAuditSink, stdioTransport } from "@fhir-dsl/mcp";
import { Command } from "commander";

// Phase 8.9 — `fhir-gen mcp <baseUrl>` launches an MCP server over stdio
// against the given FHIR endpoint. Designed as a one-liner for trying
// the server with `claude` or any MCP host without writing code.
//
// Resource types come from `--resources Patient,Observation` (explicit)
// or `fhir-dsl.config.json` in the cwd (when scaffold-ig created one) or
// fall back to a small read-friendly default set.

const FALLBACK_RESOURCE_TYPES = [
  "Patient",
  "Observation",
  "Condition",
  "Encounter",
  "MedicationRequest",
  "DiagnosticReport",
  "Practitioner",
  "Organization",
  "Bundle",
];

const WRITE_VERBS = ["create", "update", "patch", "delete"] as const;
type WriteVerb = (typeof WRITE_VERBS)[number];

interface FhirDslConfig {
  resourceTypes?: string[];
  baseUrl?: string;
}

function loadConfig(cwd: string): FhirDslConfig | null {
  const path = resolve(cwd, "fhir-dsl.config.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as FhirDslConfig;
  } catch {
    return null;
  }
}

function parseWrites(value: string | undefined): readonly WriteVerb[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (!WRITE_VERBS.includes(part as WriteVerb)) {
      throw new Error(`Unknown write verb: ${part}. Expected one or more of ${WRITE_VERBS.join(", ")}.`);
    }
  }
  return parts as readonly WriteVerb[];
}

export const mcpCommand = new Command("mcp")
  .description("Launch a Model Context Protocol server over stdio against a FHIR endpoint")
  .argument("<baseUrl>", "FHIR server base URL (e.g. https://hapi.fhir.org/baseR4)")
  .option("--resources <list>", "Comma-separated resource types to expose (overrides fhir-dsl.config.json)")
  .option("--writes <list>", "Comma-separated write verbs to expose: create,update,patch,delete")
  .option("--write-resource-types <list>", "Limit writes to a subset of --resources")
  .option("--dry-run", "Short-circuit writes; return synthetic OperationOutcome without hitting upstream")
  .option("--confirm-writes", "Require {confirm: true} on every write call")
  .option("--default-count <n>", "Default _count for searches (0 disables, default 20)")
  .option("--default-summary <mode>", "Default _summary for reads: text | data | count | false | true")
  .option("--max-bytes <n>", "Cap on response bytes (default 65536, 0 disables)")
  .option("--auth-bearer-env <var>", "Read a bearer token from this env var (e.g. FHIR_TOKEN)")
  .option("--name <name>", "Server name advertised via MCP initialize")
  .action((baseUrl: string, opts: Record<string, string | boolean | undefined>) => {
    const cfg = loadConfig(process.cwd());

    const explicitResources =
      typeof opts.resources === "string"
        ? opts.resources
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    const resourceTypes = explicitResources ?? cfg?.resourceTypes ?? FALLBACK_RESOURCE_TYPES;
    if (resourceTypes.length === 0) {
      console.error("No resource types — pass --resources or run inside a scaffolded project.");
      process.exit(1);
    }

    let writes: readonly WriteVerb[] | undefined;
    try {
      writes = parseWrites(typeof opts.writes === "string" ? opts.writes : undefined);
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }

    const writeResourceTypes =
      typeof opts.writeResourceTypes === "string"
        ? opts.writeResourceTypes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const defaultSearchCount = parseNumber(opts.defaultCount, "default-count");
    const maxResponseBytes = parseNumber(opts.maxBytes, "max-bytes");
    const defaultReadSummary = parseSummary(opts.defaultSummary);

    let bearer: string | undefined;
    if (typeof opts.authBearerEnv === "string") {
      const envName = opts.authBearerEnv;
      bearer = process.env[envName];
      if (!bearer) {
        console.error(`Env var ${envName} is not set — pass a token in via that variable.`);
        process.exit(1);
      }
    }

    const server = createServer({
      name: typeof opts.name === "string" ? opts.name : "fhir-dsl-mcp",
      version: "0.0.0",
      baseUrl,
      resourceTypes,
      audit: new JsonLogAuditSink(),
      ...(writes ? { writes } : {}),
      ...(writeResourceTypes ? { writeResourceTypes } : {}),
      ...(opts.dryRun ? { dryRun: true } : {}),
      ...(opts.confirmWrites ? { confirmWrites: true } : {}),
      ...(defaultSearchCount !== undefined ? { defaultSearchCount } : {}),
      ...(maxResponseBytes !== undefined ? { maxResponseBytes } : {}),
      ...(defaultReadSummary ? { defaultReadSummary } : {}),
      ...(bearer ? { auth: { kind: "bearer" as const, token: bearer } } : {}),
    });

    console.error(
      `[fhir-gen mcp] starting stdio server for ${baseUrl} — ${resourceTypes.length} resource type(s)${writes ? ` + writes: ${writes.join(",")}` : " (read-only)"}`,
    );
    void server.listen(stdioTransport());
  });

function parseNumber(value: string | boolean | undefined, flag: string): number | undefined {
  if (typeof value !== "string") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid --${flag}: ${value}`);
  }
  return n;
}

function parseSummary(value: string | boolean | undefined): "text" | "data" | "count" | "false" | "true" | undefined {
  if (typeof value !== "string") return undefined;
  if (["text", "data", "count", "false", "true"].includes(value)) {
    return value as "text" | "data" | "count" | "false" | "true";
  }
  throw new Error(`Invalid --default-summary: ${value}`);
}

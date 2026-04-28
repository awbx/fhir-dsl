import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";

// Phase 7.2 — `fhir-gen capability <baseUrl>` snapshots a server's
// CapabilityStatement and prints a human-readable summary of supported
// interactions, formats, and resource-level capabilities. Optionally
// dumps the raw JSON to disk.

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

interface CapabilityStatement {
  resourceType: "CapabilityStatement";
  url?: string;
  version?: string;
  name?: string;
  publisher?: string;
  fhirVersion?: string;
  format?: string[];
  rest?: CapabilityRest[];
}

async function fetchCapability(baseUrl: string): Promise<CapabilityStatement> {
  const url = `${baseUrl.replace(/\/$/, "")}/metadata`;
  const res = await fetch(url, { headers: { accept: "application/fhir+json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as CapabilityStatement;
  if (json.resourceType !== "CapabilityStatement") {
    throw new Error(
      `Server did not return a CapabilityStatement (got ${(json as { resourceType?: string }).resourceType ?? "unknown"})`,
    );
  }
  return json;
}

function printSummary(stmt: CapabilityStatement): void {
  console.log(`Server: ${stmt.publisher ?? "(no publisher)"} — ${stmt.name ?? "(no name)"}`);
  console.log(`URL:    ${stmt.url ?? "(none)"}`);
  console.log(`Version: ${stmt.version ?? "(none)"} (FHIR ${stmt.fhirVersion ?? "?"})`);
  console.log(`Formats: ${(stmt.format ?? []).join(", ") || "(none)"}`);

  const server = stmt.rest?.find((r) => r.mode === "server");
  if (!server) {
    console.log("\nNo `mode: server` entry — nothing to summarize.");
    return;
  }

  console.log(`\nSystem-level interactions: ${(server.interaction ?? []).map((i) => i.code).join(", ") || "(none)"}`);

  const resources = server.resource ?? [];
  console.log(`\nResources (${resources.length}):`);
  const sorted = [...resources].sort((a, b) => a.type.localeCompare(b.type));
  for (const r of sorted) {
    const interactions = (r.interaction ?? []).map((i) => i.code).join(",");
    const flags: string[] = [];
    if (r.versioning && r.versioning !== "no-version") flags.push(`vers=${r.versioning}`);
    if (r.readHistory) flags.push("read-history");
    if (r.updateCreate) flags.push("update-create");
    if (r.conditionalCreate) flags.push("conditional-create");
    if (r.conditionalRead && r.conditionalRead !== "not-supported") flags.push(`conditional-read=${r.conditionalRead}`);
    if (r.conditionalUpdate) flags.push("conditional-update");
    if (r.conditionalDelete && r.conditionalDelete !== "not-supported")
      flags.push(`conditional-delete=${r.conditionalDelete}`);
    const profiles = r.supportedProfile?.length ? ` profiles=${r.supportedProfile.length}` : "";
    const params = r.searchParam?.length ? ` params=${r.searchParam.length}` : "";
    console.log(
      `  ${r.type.padEnd(28)} [${interactions}]${flags.length ? ` ${flags.join(",")}` : ""}${profiles}${params}`,
    );
  }
}

export const capabilityCommand = new Command("capability")
  .description("Fetch and summarize a FHIR server's CapabilityStatement")
  .argument("<baseUrl>", "FHIR server base URL (e.g. https://hapi.fhir.org/baseR4)")
  .option("--out <file>", "Write the raw CapabilityStatement JSON to this path")
  .option("--json", "Print the raw JSON instead of a summary")
  .action(async (baseUrl: string, opts: { out?: string; json?: boolean }) => {
    const stmt = await fetchCapability(baseUrl);
    if (opts.out) {
      const path = resolve(opts.out);
      writeFileSync(path, `${JSON.stringify(stmt, null, 2)}\n`, "utf-8");
      console.error(`wrote ${path}`);
    }
    if (opts.json) {
      console.log(JSON.stringify(stmt, null, 2));
    } else {
      printSummary(stmt);
    }
  });

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { Command } from "commander";

// Phase 7.4 — `fhir-gen diff <oldDir> <newDir>` compares two generator
// outputs and reports breaking and additive changes between them. The
// generator emits a stable, line-oriented shape for resource interfaces
// (`<outDir>/<version>/resources/<name>.ts`), which lets us extract field
// information with a small parser instead of pulling in the full
// TypeScript Compiler API. The trade-off: if a generated file ever uses a
// multi-line property type we'll skip the property and warn — acceptable
// because the emitter currently never does that for FHIR types.

export interface FieldInfo {
  optional: boolean;
  type: string;
}

export interface ResourceShape {
  name: string;
  fields: Map<string, FieldInfo>;
}

export interface DiffReport {
  removedResources: string[];
  addedResources: string[];
  changedResources: ResourceDiff[];
}

export interface ResourceDiff {
  name: string;
  removedFields: string[];
  addedFields: string[];
  nowRequired: string[]; // optional in old, required in new — BREAKING
  nowOptional: string[]; // required in old, optional in new — additive
  typeChanged: Array<{ field: string; from: string; to: string }>;
}

export function locateResourcesDir(dir: string): string | null {
  if (!existsSync(dir)) return null;
  const direct = join(dir, "resources");
  if (existsSync(direct) && statSync(direct).isDirectory()) return direct;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const candidate = join(dir, entry, "resources");
    if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate;
  }
  return null;
}

const INTERFACE_RE = /^export interface (\w+)(?: extends [^{]+)?\s*\{$/;
const FIELD_RE = /^\s*(_?[a-zA-Z][\w]*)(\??):\s*(.+?);\s*$/;

export function parseResourceFile(contents: string): ResourceShape | null {
  const lines = contents.split("\n");
  let interfaceName: string | null = null;
  const fields = new Map<string, FieldInfo>();
  let inBlock = false;
  let depth = 0;

  for (const line of lines) {
    if (!inBlock) {
      const m = INTERFACE_RE.exec(line);
      if (m) {
        interfaceName = m[1] ?? null;
        inBlock = true;
        depth = 1;
      }
      continue;
    }

    // Track brace depth so nested `{ ... }` (rare, e.g., inline object types)
    // doesn't confuse the closer detection.
    for (const ch of line) {
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }

    if (depth <= 0) {
      break;
    }

    // Only parse top-level fields (depth was 1 before this line opened anything).
    if (depth === 1) {
      const m = FIELD_RE.exec(line);
      if (m) {
        const [, name, optional, type] = m;
        if (name && type !== undefined) {
          fields.set(name, { optional: optional === "?", type: type.trim() });
        }
      }
    }
  }

  if (!interfaceName) return null;
  return { name: interfaceName, fields };
}

export function loadResourceShapes(resourcesDir: string): Map<string, ResourceShape> {
  const result = new Map<string, ResourceShape>();
  const files = readdirSync(resourcesDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"));
  for (const file of files) {
    const path = join(resourcesDir, file);
    const contents = readFileSync(path, "utf-8");
    const shape = parseResourceFile(contents);
    if (shape) result.set(shape.name, shape);
  }
  return result;
}

export function diffShapes(oldShapes: Map<string, ResourceShape>, newShapes: Map<string, ResourceShape>): DiffReport {
  const removed: string[] = [];
  const added: string[] = [];
  const changed: ResourceDiff[] = [];

  for (const name of oldShapes.keys()) {
    if (!newShapes.has(name)) removed.push(name);
  }
  for (const name of newShapes.keys()) {
    if (!oldShapes.has(name)) added.push(name);
  }

  const common = [...oldShapes.keys()].filter((n) => newShapes.has(n)).sort();
  for (const name of common) {
    const oldShape = oldShapes.get(name);
    const newShape = newShapes.get(name);
    if (!oldShape || !newShape) continue;
    const diff = diffResource(oldShape, newShape);
    if (
      diff.removedFields.length > 0 ||
      diff.addedFields.length > 0 ||
      diff.nowRequired.length > 0 ||
      diff.nowOptional.length > 0 ||
      diff.typeChanged.length > 0
    ) {
      changed.push(diff);
    }
  }

  return {
    removedResources: removed.sort(),
    addedResources: added.sort(),
    changedResources: changed,
  };
}

function diffResource(oldShape: ResourceShape, newShape: ResourceShape): ResourceDiff {
  const removed: string[] = [];
  const added: string[] = [];
  const nowRequired: string[] = [];
  const nowOptional: string[] = [];
  const typeChanged: Array<{ field: string; from: string; to: string }> = [];

  for (const [field, oldInfo] of oldShape.fields) {
    const newInfo = newShape.fields.get(field);
    if (!newInfo) {
      removed.push(field);
      continue;
    }
    if (oldInfo.optional && !newInfo.optional) nowRequired.push(field);
    else if (!oldInfo.optional && newInfo.optional) nowOptional.push(field);
    if (oldInfo.type !== newInfo.type) {
      typeChanged.push({ field, from: oldInfo.type, to: newInfo.type });
    }
  }
  for (const field of newShape.fields.keys()) {
    if (!oldShape.fields.has(field)) added.push(field);
  }

  return {
    name: oldShape.name,
    removedFields: removed.sort(),
    addedFields: added.sort(),
    nowRequired: nowRequired.sort(),
    nowOptional: nowOptional.sort(),
    typeChanged: typeChanged.sort((a, b) => a.field.localeCompare(b.field)),
  };
}

export function hasBreakingChanges(report: DiffReport): boolean {
  if (report.removedResources.length > 0) return true;
  for (const r of report.changedResources) {
    if (r.removedFields.length > 0) return true;
    if (r.nowRequired.length > 0) return true;
    if (r.typeChanged.length > 0) return true;
  }
  return false;
}

export function formatReport(report: DiffReport): string {
  const lines: string[] = [];
  const breaking = hasBreakingChanges(report);

  lines.push(breaking ? "BREAKING changes detected." : "No breaking changes.");
  lines.push("");

  if (report.removedResources.length > 0) {
    lines.push(`Removed resources (${report.removedResources.length}) — BREAKING:`);
    for (const r of report.removedResources) lines.push(`  - ${r}`);
    lines.push("");
  }
  if (report.addedResources.length > 0) {
    lines.push(`Added resources (${report.addedResources.length}):`);
    for (const r of report.addedResources) lines.push(`  + ${r}`);
    lines.push("");
  }

  if (report.changedResources.length === 0) {
    if (report.removedResources.length === 0 && report.addedResources.length === 0) {
      lines.push("No resource shape changes.");
    }
    return `${lines.join("\n")}\n`;
  }

  lines.push(`Changed resources (${report.changedResources.length}):`);
  for (const r of report.changedResources) {
    lines.push(`  ${r.name}`);
    for (const f of r.removedFields) lines.push(`    - ${f}  (BREAKING: removed)`);
    for (const f of r.nowRequired) lines.push(`    ! ${f}  (BREAKING: optional → required)`);
    for (const t of r.typeChanged) lines.push(`    ~ ${t.field}  (BREAKING: ${t.from} → ${t.to})`);
    for (const f of r.addedFields) lines.push(`    + ${f}`);
    for (const f of r.nowOptional) lines.push(`    ? ${f}  (required → optional)`);
  }

  return `${lines.join("\n")}\n`;
}

export const diffCommand = new Command("diff")
  .description("Highlight breaking changes between two fhir-gen output directories")
  .argument("<oldDir>", "Path to the older generator output directory")
  .argument("<newDir>", "Path to the newer generator output directory")
  .option("--json", "Emit a machine-readable JSON report instead of the human summary")
  .action((oldDir: string, newDir: string, opts: { json?: boolean }) => {
    const oldRoot = resolve(oldDir);
    const newRoot = resolve(newDir);
    const oldResources = locateResourcesDir(oldRoot);
    const newResources = locateResourcesDir(newRoot);

    if (!oldResources) {
      console.error(`No \`resources/\` directory found under ${oldRoot}`);
      process.exit(1);
    }
    if (!newResources) {
      console.error(`No \`resources/\` directory found under ${newRoot}`);
      process.exit(1);
    }

    const oldShapes = loadResourceShapes(oldResources);
    const newShapes = loadResourceShapes(newResources);
    const report = diffShapes(oldShapes, newShapes);

    if (opts.json) {
      const payload = {
        ...report,
        breaking: hasBreakingChanges(report),
      };
      console.log(JSON.stringify(payload, null, 2));
    } else {
      process.stdout.write(formatReport(report));
    }

    if (hasBreakingChanges(report)) process.exit(2);
  });

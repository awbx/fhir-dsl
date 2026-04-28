import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  diffCommand,
  diffShapes,
  formatReport,
  hasBreakingChanges,
  loadResourceShapes,
  locateResourcesDir,
  parseResourceFile,
} from "../src/commands/diff.js";

describe("parseResourceFile", () => {
  it("extracts name and fields with optionality and types", () => {
    const src = `import type { FhirCode } from "../primitives.js";
import type { DomainResource } from "../datatypes.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode;
  active?: boolean;
}
`;
    const shape = parseResourceFile(src);
    expect(shape?.name).toBe("Patient");
    expect(shape?.fields.get("resourceType")).toEqual({ optional: false, type: '"Patient"' });
    expect(shape?.fields.get("gender")).toEqual({ optional: true, type: "FhirCode" });
    expect(shape?.fields.get("active")).toEqual({ optional: true, type: "boolean" });
  });

  it("returns null when no interface is found", () => {
    expect(parseResourceFile('export const x = "y";')).toBeNull();
  });

  it("ignores fields nested in inline object types", () => {
    const src = `export interface Foo {
  outer: { inner: string };
  flat?: number;
}
`;
    const shape = parseResourceFile(src);
    expect(shape?.fields.has("outer")).toBe(true);
    expect(shape?.fields.has("inner")).toBe(false);
    expect(shape?.fields.has("flat")).toBe(true);
  });
});

describe("diffShapes", () => {
  it("flags removed and added resources", () => {
    const oldShapes = new Map([
      ["Patient", { name: "Patient", fields: new Map() }],
      ["Encounter", { name: "Encounter", fields: new Map() }],
    ]);
    const newShapes = new Map([
      ["Patient", { name: "Patient", fields: new Map() }],
      ["Observation", { name: "Observation", fields: new Map() }],
    ]);
    const report = diffShapes(oldShapes, newShapes);
    expect(report.removedResources).toEqual(["Encounter"]);
    expect(report.addedResources).toEqual(["Observation"]);
    expect(hasBreakingChanges(report)).toBe(true);
  });

  it("detects field-level breaking and additive changes", () => {
    const oldShapes = new Map([
      [
        "Patient",
        {
          name: "Patient",
          fields: new Map([
            ["resourceType", { optional: false, type: '"Patient"' }],
            ["gender", { optional: true, type: "string" }],
            ["deceased", { optional: true, type: "boolean" }],
            ["activeStatus", { optional: false, type: "boolean" }],
          ]),
        },
      ],
    ]);
    const newShapes = new Map([
      [
        "Patient",
        {
          name: "Patient",
          fields: new Map([
            ["resourceType", { optional: false, type: '"Patient"' }],
            ["gender", { optional: false, type: "FhirCode" }], // BREAKING twice: now required + type narrowed
            // deceased removed: BREAKING
            ["activeStatus", { optional: true, type: "boolean" }], // additive: now optional
            ["birthDate", { optional: true, type: "string" }], // additive: new field
          ]),
        },
      ],
    ]);
    const report = diffShapes(oldShapes, newShapes);
    expect(report.changedResources).toHaveLength(1);
    const change = report.changedResources[0];
    expect(change?.removedFields).toEqual(["deceased"]);
    expect(change?.addedFields).toEqual(["birthDate"]);
    expect(change?.nowRequired).toEqual(["gender"]);
    expect(change?.nowOptional).toEqual(["activeStatus"]);
    expect(change?.typeChanged).toEqual([{ field: "gender", from: "string", to: "FhirCode" }]);
    expect(hasBreakingChanges(report)).toBe(true);
  });

  it("returns no breaking flag when only additive changes are present", () => {
    const oldShapes = new Map([
      ["Patient", { name: "Patient", fields: new Map([["resourceType", { optional: false, type: '"Patient"' }]]) }],
    ]);
    const newShapes = new Map([
      [
        "Patient",
        {
          name: "Patient",
          fields: new Map([
            ["resourceType", { optional: false, type: '"Patient"' }],
            ["birthDate", { optional: true, type: "string" }],
          ]),
        },
      ],
    ]);
    const report = diffShapes(oldShapes, newShapes);
    expect(hasBreakingChanges(report)).toBe(false);
  });
});

describe("formatReport", () => {
  it("includes BREAKING header and per-resource bullets", () => {
    const report = {
      removedResources: ["Encounter"],
      addedResources: ["Observation"],
      changedResources: [
        {
          name: "Patient",
          removedFields: ["deceased"],
          addedFields: ["birthDate"],
          nowRequired: ["gender"],
          nowOptional: [],
          typeChanged: [{ field: "gender", from: "string", to: "FhirCode" }],
        },
      ],
    };
    const out = formatReport(report);
    expect(out).toContain("BREAKING changes detected.");
    expect(out).toContain("Removed resources (1) — BREAKING:");
    expect(out).toContain("- Encounter");
    expect(out).toContain("+ Observation");
    expect(out).toContain("- deceased  (BREAKING: removed)");
    expect(out).toContain("! gender  (BREAKING: optional → required)");
    expect(out).toContain("~ gender  (BREAKING: string → FhirCode)");
    expect(out).toContain("+ birthDate");
  });

  it("says no changes when reports are empty", () => {
    const report = { removedResources: [], addedResources: [], changedResources: [] };
    expect(formatReport(report)).toContain("No breaking changes.");
    expect(formatReport(report)).toContain("No resource shape changes.");
  });
});

describe("locateResourcesDir + loadResourceShapes (filesystem)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "fhir-diff-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("locates a resources/ dir nested under a version subdir", () => {
    mkdirSync(join(dir, "r4", "resources"), { recursive: true });
    expect(locateResourcesDir(dir)).toBe(join(dir, "r4", "resources"));
  });

  it("returns null when no resources dir exists", () => {
    expect(locateResourcesDir(dir)).toBeNull();
  });

  it("loads parsed shapes from generated files", () => {
    const resourcesDir = join(dir, "r4", "resources");
    mkdirSync(resourcesDir, { recursive: true });
    writeFileSync(
      join(resourcesDir, "patient.ts"),
      `export interface Patient {
  resourceType: "Patient";
  gender?: string;
}
`,
      "utf-8",
    );
    const shapes = loadResourceShapes(resourcesDir);
    expect(shapes.has("Patient")).toBe(true);
    expect(shapes.get("Patient")?.fields.get("gender")).toEqual({ optional: true, type: "string" });
  });
});

describe("fhir-gen diff (CLI)", () => {
  let oldDir: string;
  let newDir: string;
  beforeEach(() => {
    oldDir = mkdtempSync(join(tmpdir(), "fhir-diff-old-"));
    newDir = mkdtempSync(join(tmpdir(), "fhir-diff-new-"));
    for (const root of [oldDir, newDir]) {
      mkdirSync(join(root, "r4", "resources"), { recursive: true });
    }
  });
  afterEach(() => {
    rmSync(oldDir, { recursive: true, force: true });
    rmSync(newDir, { recursive: true, force: true });
  });

  it("exits 0 on additive-only changes", async () => {
    writeFileSync(
      join(oldDir, "r4", "resources", "patient.ts"),
      `export interface Patient {\n  resourceType: "Patient";\n}\n`,
    );
    writeFileSync(
      join(newDir, "r4", "resources", "patient.ts"),
      `export interface Patient {\n  resourceType: "Patient";\n  birthDate?: string;\n}\n`,
    );

    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);
    const writes: string[] = [];
    const writeStream = vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
      writes.push(typeof chunk === "string" ? chunk : (chunk as Buffer).toString());
      return true;
    });

    await diffCommand.parseAsync(["node", "fhir-gen", oldDir, newDir]);
    expect(exit).not.toHaveBeenCalled();
    expect(writes.join("")).toContain("No breaking changes");

    writeStream.mockRestore();
    exit.mockRestore();
  });

  it("exits 2 with BREAKING header when fields are removed", async () => {
    writeFileSync(
      join(oldDir, "r4", "resources", "patient.ts"),
      `export interface Patient {\n  resourceType: "Patient";\n  deceased?: boolean;\n}\n`,
    );
    writeFileSync(
      join(newDir, "r4", "resources", "patient.ts"),
      `export interface Patient {\n  resourceType: "Patient";\n}\n`,
    );

    const exit = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit:${code}`);
    }) as never);
    const writes: string[] = [];
    vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
      writes.push(typeof chunk === "string" ? chunk : (chunk as Buffer).toString());
      return true;
    });

    await expect(diffCommand.parseAsync(["node", "fhir-gen", oldDir, newDir])).rejects.toThrow("exit:2");
    expect(writes.join("")).toContain("BREAKING changes detected.");
    expect(writes.join("")).toContain("deceased");

    exit.mockRestore();
    vi.restoreAllMocks();
  });

  it("emits structured JSON with --json", async () => {
    writeFileSync(
      join(oldDir, "r4", "resources", "patient.ts"),
      `export interface Patient {\n  resourceType: "Patient";\n}\n`,
    );
    writeFileSync(
      join(newDir, "r4", "resources", "patient.ts"),
      `export interface Patient {\n  resourceType: "Patient";\n  birthDate?: string;\n}\n`,
    );

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await diffCommand.parseAsync(["node", "fhir-gen", oldDir, newDir, "--json"]);
    const out = log.mock.calls.map((c) => String(c[0])).join("\n");
    const parsed = JSON.parse(out);
    expect(parsed.breaking).toBe(false);
    expect(parsed.changedResources[0].name).toBe("Patient");
    expect(parsed.changedResources[0].addedFields).toEqual(["birthDate"]);
    log.mockRestore();
  });

  it("errors when a target directory has no resources/ subdir", async () => {
    rmSync(newDir, { recursive: true, force: true });
    mkdtempSync(join(tmpdir(), "x"));
    const empty = mkdtempSync(join(tmpdir(), "fhir-diff-empty-"));

    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);

    await expect(diffCommand.parseAsync(["node", "fhir-gen", oldDir, empty])).rejects.toThrow("exit");
    expect(err.mock.calls.some((c) => String(c[0]).includes("No `resources/`"))).toBe(true);

    rmSync(empty, { recursive: true, force: true });
    err.mockRestore();
    exit.mockRestore();
  });
});

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Command } from "commander";

// Phase 7.3 — `fhir-gen scaffold-ig <pkg>` writes a starter project that
// already knows how to regenerate types from the requested IG and use them
// against a FHIR server. The intent is to collapse a 30-minute "wire up the
// client and the build script" into one command.
//
// The scaffold is *minimal on purpose*: a package.json with a `generate`
// script, a tsconfig, a config file recording the version + IG, and a
// `src/client.ts` calling the generator's emitted `createClient`. We do
// not run the generator from here — the user can `pnpm install &&
// pnpm generate` once they're inside the directory.

export interface ScaffoldOptions {
  pkg: string;
  outDir: string;
  version: "r4" | "r4b" | "r5" | "r6";
  projectName?: string | undefined;
}

export interface ScaffoldFile {
  path: string;
  contents: string;
}

const FHIR_DSL_VERSION = "^0.35.0";

export function scaffoldFiles(opts: ScaffoldOptions): ScaffoldFile[] {
  const projectName = opts.projectName ?? deriveProjectName(opts.outDir);
  const igDescription = opts.pkg;
  const baseUrl = defaultBaseUrl(opts.version);

  return [
    { path: "package.json", contents: renderPackageJson(projectName, opts) },
    { path: "tsconfig.json", contents: renderTsconfig() },
    { path: "fhir-dsl.config.json", contents: renderConfig(opts) },
    { path: "src/client.ts", contents: renderClient(baseUrl) },
    { path: "src/index.ts", contents: 'export { client } from "./client.js";\n' },
    { path: ".gitignore", contents: "node_modules\nsrc/generated\ndist\n" },
    { path: "README.md", contents: renderReadme(projectName, igDescription, opts.version) },
  ];
}

function deriveProjectName(outDir: string): string {
  const segments = outDir.split(/[\\/]/).filter(Boolean);
  const last = segments[segments.length - 1] ?? "fhir-app";
  return (
    last
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-") || "fhir-app"
  );
}

function defaultBaseUrl(version: ScaffoldOptions["version"]): string {
  switch (version) {
    case "r4":
      return "https://hapi.fhir.org/baseR4";
    case "r4b":
      return "https://hapi.fhir.org/baseR4B";
    case "r5":
      return "https://hapi.fhir.org/baseR5";
    case "r6":
      return "https://hapi.fhir.org/baseR6";
  }
}

function renderPackageJson(name: string, opts: ScaffoldOptions): string {
  const generateCmd = `fhir-gen generate --version ${opts.version} --ig ${opts.pkg} --out src/generated`;
  const pkg = {
    name,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      generate: generateCmd,
      typecheck: "tsc --noEmit",
    },
    dependencies: {
      "@fhir-dsl/core": FHIR_DSL_VERSION,
      "@fhir-dsl/runtime": FHIR_DSL_VERSION,
      "@fhir-dsl/types": FHIR_DSL_VERSION,
    },
    devDependencies: {
      "@fhir-dsl/cli": FHIR_DSL_VERSION,
      typescript: "^5.9.3",
    },
  };
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function renderTsconfig(): string {
  const config = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      exactOptionalPropertyTypes: true,
      noUncheckedIndexedAccess: true,
      esModuleInterop: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      outDir: "dist",
      declaration: true,
    },
    include: ["src/**/*.ts"],
  };
  return `${JSON.stringify(config, null, 2)}\n`;
}

function renderConfig(opts: ScaffoldOptions): string {
  const config = {
    version: opts.version,
    ig: [opts.pkg],
    out: "src/generated",
  };
  return `${JSON.stringify(config, null, 2)}\n`;
}

function renderClient(baseUrl: string): string {
  return `import { createClient } from "./generated/index.js";

// Generated types come from \`pnpm generate\` (or \`npm run generate\`).
// Run that once after installing dependencies, then this file becomes
// type-safe end-to-end against the IG declared in fhir-dsl.config.json.

export const client = createClient({
  baseUrl: process.env.FHIR_BASE_URL ?? ${JSON.stringify(baseUrl)},
});
`;
}

function renderReadme(projectName: string, ig: string, version: string): string {
  return `# ${projectName}

A type-safe FHIR client scaffolded with \`fhir-gen scaffold-ig\`.

- **FHIR version:** \`${version}\`
- **Implementation Guide:** \`${ig}\`

## Quickstart

\`\`\`sh
pnpm install        # or npm install / yarn install
pnpm generate       # downloads the IG and emits src/generated/
pnpm typecheck
\`\`\`

After \`pnpm generate\` runs, \`src/client.ts\` exposes a typed client:

\`\`\`ts
import { client } from "./client.js";

const patients = await client.from("Patient").where("name", "$contains", "smith").execute();
\`\`\`

The base URL defaults to a public test server — override it via the
\`FHIR_BASE_URL\` environment variable, or edit \`src/client.ts\` directly.

## Regenerating after the IG changes

Bump the version pin in \`fhir-dsl.config.json\` (and the \`generate\`
script in \`package.json\`), then re-run \`pnpm generate\`. Use
\`fhir-gen diff\` to inspect breaking changes before upgrading.
`;
}

export interface WriteResult {
  written: string[];
  skipped: string[];
}

export function writeScaffold(files: ScaffoldFile[], outDir: string, force: boolean): WriteResult {
  const written: string[] = [];
  const skipped: string[] = [];
  for (const file of files) {
    const target = resolve(outDir, file.path);
    if (existsSync(target) && !force) {
      skipped.push(file.path);
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.contents, "utf-8");
    written.push(file.path);
  }
  return { written, skipped };
}

function isDirectoryNonEmpty(dir: string): boolean {
  if (!existsSync(dir)) return false;
  try {
    return readdirSync(dir).length > 0;
  } catch {
    return false;
  }
}

export const scaffoldIgCommand = new Command("scaffold-ig")
  .description("Initialise a starter project with a FHIR IG pre-wired")
  .argument("<pkg>", "IG package spec (e.g. hl7.fhir.us.core@6.1.0)")
  .option("--out <dir>", "Target directory (defaults to current directory)", ".")
  .option("--version <ver>", "FHIR version: r4 | r4b | r5 | r6", "r4")
  .option("--name <name>", "Project name written to package.json")
  .option("--force", "Overwrite files even if the target directory is non-empty")
  .action((pkg: string, opts: { out: string; version: string; name?: string; force?: boolean }) => {
    const version = opts.version.toLowerCase();
    if (!["r4", "r4b", "r5", "r6"].includes(version)) {
      console.error(`Invalid --version: ${opts.version}. Expected one of r4, r4b, r5, r6.`);
      process.exit(1);
    }

    const outDir = resolve(opts.out);
    if (!opts.force && isDirectoryNonEmpty(outDir)) {
      const files = scaffoldFiles({
        pkg,
        outDir,
        version: version as ScaffoldOptions["version"],
        projectName: opts.name,
      });
      const wouldClobber = files.filter((f) => existsSync(resolve(outDir, f.path)));
      if (wouldClobber.length > 0) {
        console.error(
          `Refusing to overwrite existing files in ${outDir}: ${wouldClobber
            .map((f) => f.path)
            .join(", ")}. Pass --force to override.`,
        );
        process.exit(1);
      }
    }

    const files = scaffoldFiles({
      pkg,
      outDir,
      version: version as ScaffoldOptions["version"],
      projectName: opts.name,
    });
    const result = writeScaffold(files, outDir, opts.force ?? false);

    console.log(`Scaffolded ${result.written.length} file(s) in ${outDir}:`);
    for (const path of result.written) console.log(`  + ${path}`);
    if (result.skipped.length > 0) {
      console.log(`\nSkipped ${result.skipped.length} existing file(s) (re-run with --force to overwrite):`);
      for (const path of result.skipped) console.log(`  - ${path}`);
    }
    console.log("\nNext steps:");
    console.log(`  cd ${opts.out}`);
    console.log("  pnpm install     # or npm install");
    console.log("  pnpm generate    # downloads the IG and emits src/generated");
  });

#!/usr/bin/env node
// Walks each workspace package's `src/index.ts`, dumps its public export
// surface as a snapshot, and (with --check) fails if it drifts from
// `.surface-snapshot.json`.
//
// The snapshot is intentionally coarse — symbol name + kind. Signatures
// and member shapes are checked by `tsc` in `pnpm typecheck`; this script
// guards against accidental additions/removals at the package boundary.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const snapshotPath = join(root, ".surface-snapshot.json");
const mode = process.argv[2] === "--check" ? "check" : "write";

const packages = [
	"types",
	"core",
	"runtime",
	"fhirpath",
	"smart",
	"terminology",
	"utils",
	"generator",
	"cli",
	"mcp",
	"tanstack-query",
];

function symbolKind(sym) {
	const f = sym.getFlags();
	if (f & ts.SymbolFlags.TypeAlias) return "type";
	if (f & ts.SymbolFlags.Interface) return "interface";
	if (f & ts.SymbolFlags.Class) return "class";
	if (f & ts.SymbolFlags.Enum) return "enum";
	if (f & ts.SymbolFlags.Function) return "function";
	if (f & ts.SymbolFlags.ConstEnum) return "const-enum";
	if (f & ts.SymbolFlags.Variable) return "const";
	if (f & ts.SymbolFlags.Module) return "namespace";
	return "other";
}

function exportsForEntry(entry) {
	const program = ts.createProgram({
		rootNames: [entry],
		options: {
			target: ts.ScriptTarget.ES2022,
			module: ts.ModuleKind.ESNext,
			moduleResolution: ts.ModuleResolutionKind.Bundler,
			allowJs: false,
			noEmit: true,
			skipLibCheck: true,
			strict: false,
		},
	});
	const checker = program.getTypeChecker();
	const source = program.getSourceFile(entry);
	if (!source) throw new Error(`Cannot load ${entry}`);
	const sym = checker.getSymbolAtLocation(source);
	if (!sym) return [];
	return checker
		.getExportsOfModule(sym)
		.map((e) => ({ name: e.getName(), kind: symbolKind(e) }))
		.filter((e) => !e.name.startsWith("_"))
		.sort((a, b) => a.name.localeCompare(b.name));
}

const snapshot = { generatedAt: new Date().toISOString().slice(0, 10), packages: {} };

for (const pkg of packages) {
	const entry = join(root, "packages", pkg, "src", "index.ts");
	if (!existsSync(entry)) continue;
	try {
		snapshot.packages[`@fhir-dsl/${pkg}`] = exportsForEntry(entry);
	} catch (err) {
		console.error(`failed to read ${pkg}: ${err.message}`);
		process.exit(2);
	}
}

const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;

if (mode === "write") {
	writeFileSync(snapshotPath, serialized);
	const total = Object.values(snapshot.packages).reduce(
		(n, arr) => n + arr.length,
		0,
	);
	console.log(
		`wrote ${relative(root, snapshotPath)} — ${total} exports across ${
			Object.keys(snapshot.packages).length
		} packages`,
	);
} else {
	if (!existsSync(snapshotPath)) {
		console.error(`no snapshot at ${snapshotPath}; run \`pnpm audit:export-surface\` first`);
		process.exit(1);
	}
	const previous = readFileSync(snapshotPath, "utf-8");
	// Compare ignoring `generatedAt` so timestamp drift alone doesn't fail CI.
	const stripDate = (s) =>
		s.replace(/"generatedAt": "[^"]+"/, '"generatedAt": "DATE"');
	if (stripDate(previous) !== stripDate(serialized)) {
		console.error(
			"export surface drift detected. Run `pnpm audit:export-surface` and review the diff.",
		);
		process.exit(1);
	}
	console.log("export surface unchanged");
}

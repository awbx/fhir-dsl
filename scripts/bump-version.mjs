import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
	console.error("Usage: pnpm version:bump <version>");
	console.error("Example: pnpm version:bump 0.3.0");
	process.exit(1);
}

const root = new URL("..", import.meta.url).pathname;

// Update root package.json
const rootPkg = join(root, "package.json");
const rootJson = JSON.parse(readFileSync(rootPkg, "utf-8"));
const oldVersion = rootJson.version;
rootJson.version = version;
writeFileSync(rootPkg, `${JSON.stringify(rootJson, null, 2)}\n`);

// Update all public workspace packages
const output = execSync("pnpm -r list --json --depth -1", {
	encoding: "utf-8",
});
const packages = JSON.parse(output);

for (const pkg of packages) {
	if (pkg.private) continue;
	const pkgPath = join(pkg.path, "package.json");
	const json = JSON.parse(readFileSync(pkgPath, "utf-8"));
	json.version = version;
	writeFileSync(pkgPath, `${JSON.stringify(json, null, 2)}\n`);
	console.log(`  ${json.name} -> ${version}`);
}

// Update version references in docs
const docsDir = join(root, "apps", "docs", "docs");
if (existsSync(docsDir)) {
	const updateFile = (filePath) => {
		if (!existsSync(filePath)) return;
		const content = readFileSync(filePath, "utf-8");
		const updated = content.replaceAll(oldVersion, version);
		if (content !== updated) {
			writeFileSync(filePath, updated);
			console.log(`  docs: ${filePath.replace(root, "")}`);
		}
	};

	updateFile(join(docsDir, "roadmap.md"));
	updateFile(join(docsDir, "monorepo", "setup.md"));
}

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "v${version}"`, { stdio: "inherit" });
execSync(`git tag v${version}`, { stdio: "inherit" });
execSync(`git push origin main v${version}`, { stdio: "inherit" });

console.log(`\nReleased v${version}`);

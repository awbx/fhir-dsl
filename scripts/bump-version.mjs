import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
	console.error("Usage: pnpm version:bump <version>");
	console.error("Example: pnpm version:bump 0.3.0");
	process.exit(1);
}

const root = new URL("..", import.meta.url).pathname;

const rootPkg = join(root, "package.json");
const rootJson = JSON.parse(readFileSync(rootPkg, "utf-8"));
rootJson.version = version;
writeFileSync(rootPkg, `${JSON.stringify(rootJson, null, 2)}\n`);

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

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "v${version}"`, { stdio: "inherit" });
execSync(`git tag v${version}`, { stdio: "inherit" });
execSync(`git push origin main v${version}`, { stdio: "inherit" });

console.log(`\nReleased v${version}`);

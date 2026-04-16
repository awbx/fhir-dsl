import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "../../../dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");
const goldenDir = join(__dirname, "golden");
const legacyGoldenDir = join(__dirname, "legacy-golden");

async function main() {
  await rm(goldenDir, { recursive: true, force: true });
  await rm(legacyGoldenDir, { recursive: true, force: true });
  await mkdir(goldenDir, { recursive: true });
  await mkdir(legacyGoldenDir, { recursive: true });

  await generate({
    version: "r4",
    outDir: goldenDir,
    localSpecDir: fixturesDir,
    expandValueSets: true,
    resolveCodeSystems: true,
  });

  await generate({
    version: "r4",
    outDir: legacyGoldenDir,
    localSpecDir: fixturesDir,
    expandValueSets: false,
    resolveCodeSystems: false,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { generate } from "../../../dist/index.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rm, mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

async function run() {
  const goldenDir = join(__dirname, "golden");
  const legacyGoldenDir = join(__dirname, "legacy-golden");

  // Cleanup
  await rm(goldenDir, { recursive: true, force: true });
  await rm(legacyGoldenDir, { recursive: true, force: true });
  await mkdir(goldenDir, { recursive: true });
  await mkdir(legacyGoldenDir, { recursive: true });

  console.info("Generating golden bundle...");
  await generate({
    version: "r4",
    outDir: goldenDir,
    localSpecDir: fixturesDir,
    expandValueSets: true,
    resolveCodeSystems: true,
  });

  console.info("Generating legacy-golden bundle...");
  await generate({
    version: "r4",
    outDir: legacyGoldenDir,
    localSpecDir: fixturesDir,
    expandValueSets: false,
    resolveCodeSystems: false, // assuming this doesn't matter if expandValueSets is false
  });

  console.info("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

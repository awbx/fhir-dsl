#!/usr/bin/env node
/**
 * Regenerates the two golden bundles from the fixtures.
 *
 * - generated-golden/         — pipeline with --expand-valuesets (terminology on)
 * - generated-legacy-golden/  — pipeline without (backward-compat baseline)
 *
 * Run via:
 *   node packages/generator/test/fixtures/.regen-goldens.mjs
 *
 * The backward-compat test uses `UPDATE_GOLDEN=1` to trigger regen of just the
 * legacy bundle; this script regenerates both unconditionally.
 */
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "../../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "terminology");
const goldenDir = join(here, "generated-golden");
const legacyGoldenDir = join(here, "generated-legacy-golden");

await rm(goldenDir, { recursive: true, force: true });
await rm(legacyGoldenDir, { recursive: true, force: true });

console.log("Generating golden (expandValueSets: true)...");
await generate({
  version: "r4",
  outDir: goldenDir,
  localSpecDir: fixturesDir,
  expandValueSets: true,
  resolveCodeSystems: true,
});

console.log("Generating legacy-golden (expandValueSets: false)...");
await generate({
  version: "r4",
  outDir: legacyGoldenDir,
  localSpecDir: fixturesDir,
  expandValueSets: false,
});

console.log("Done.");

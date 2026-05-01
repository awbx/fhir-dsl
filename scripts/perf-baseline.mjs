#!/usr/bin/env node
/**
 * v1 perf baseline.
 *
 * Three signals — each one corresponds to a path users will exercise often
 * enough that a regression would be felt. Numbers go in
 * audit/perf-baseline.md and are CI-guarded thereafter.
 *
 *   1) Generator end-to-end on R4 (warm cache).
 *   2) Bundle parse + validate on a 1000-resource Bundle.
 *   3) FHIRPath evaluate on Patient.contact[*] across 10k iterations.
 *
 * Run from the repo root:
 *   node scripts/perf-baseline.mjs
 */

import { performance } from "node:perf_hooks";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);

function ms(start) {
  return (performance.now() - start).toFixed(1);
}

// ───────── 1) Generator end-to-end ─────────
async function benchGenerator() {
  const { generate } = await import(`${repoRoot}/packages/generator/dist/index.js`);
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  // Emit into a throwaway tmpdir so the bench is repeatable and doesn't
  // mutate the tracked example output (which has its own formatting/lint
  // expectations).
  const out = await mkdtemp(`${tmpdir()}/fhir-dsl-perf-`);
  const start = performance.now();
  await generate({
    version: "r4",
    outDir: out,
    cacheDir: `${repoRoot}/.cache/r4`,
    ig: ["hl7.fhir.us.core@6.1.0"],
  });
  const took = ms(start);
  await rm(out, { recursive: true, force: true });
  return took;
}

// ───────── 2) Bundle parse + validate ─────────
async function benchBundleValidate() {
  // The native runtime is a TS template (dist/native-runtime.ts) that the
  // generator inlines into consumer projects. We can't `import` the .ts
  // directly from .mjs, so the bench runs in a child process with
  // --experimental-strip-types, then we read its stdout for the timing.
  const out = execSync(
    `node --experimental-strip-types --no-warnings ${repoRoot}/scripts/perf-bundle-validate.mts`,
    { cwd: repoRoot, encoding: "utf8" },
  );
  return out.trim();
}

// ───────── 3) FHIRPath evaluate ─────────
async function benchFhirpathEval() {
  const { fhirpath } = await import(`${repoRoot}/packages/fhirpath/dist/index.js`);
  const expr = fhirpath("Patient").name.family;
  const sample = {
    resourceType: "Patient",
    name: [{ given: ["Ada"], family: "Lovelace", use: "official" }],
  };
  // Warm.
  for (let i = 0; i < 100; i++) expr.evaluate(sample);
  const start = performance.now();
  for (let i = 0; i < 10_000; i++) expr.evaluate(sample);
  return ms(start);
}

const results = {
  generator_e2e_ms: await benchGenerator(),
  bundle_1k_validate_ms: await benchBundleValidate(),
  fhirpath_eval_10k_ms: await benchFhirpathEval(),
  node: process.version,
  platform: `${process.platform} ${process.arch}`,
  ts: new Date().toISOString(),
};

// biome-ignore lint/suspicious/noConsole: this is a CLI script
console.log(JSON.stringify(results, null, 2));

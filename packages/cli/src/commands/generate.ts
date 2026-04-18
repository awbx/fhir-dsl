import { resolve } from "node:path";
import { generate } from "@fhir-dsl/generator";
import { Command } from "commander";

export const generateCommand = new Command("generate")
  .description("Generate TypeScript types from FHIR specification")
  .requiredOption("--version <version>", "FHIR version (e.g., r4, r4b, r5, r6)", "r4")
  .option("--ig <packages...>", "IG packages to include (e.g., hl7.fhir.us.core@6.1.0)")
  .option("--resources <list>", "Comma-separated resource names (default: all)")
  .requiredOption("--out <dir>", "Output directory for generated types")
  .option("--src <path>", "Local path to FHIR definitions (skip download)")
  .option("--cache <dir>", "Cache directory for downloaded specs")
  .option("--expand-valuesets", "Generate typed unions from FHIR ValueSet bindings")
  .option("--resolve-codesystems", "Generate CodeSystem namespace objects for IntelliSense")
  .option("--include-spec", "Emit markdown spec files alongside types for AI/LLM context")
  .option("--validator <target>", "Emit Standard Schema validators using: zod | native")
  .option("--strict-extensible", "Treat extensible bindings as closed enums in validators")
  .action(async (opts) => {
    const resources = opts.resources ? opts.resources.split(",").map((r: string) => r.trim()) : undefined;

    const validator = opts.validator as "zod" | "native" | undefined;
    if (validator && !["zod", "native"].includes(validator)) {
      throw new Error(`Invalid --validator value: ${validator}. Expected zod | native.`);
    }

    await generate({
      version: opts.version,
      outDir: resolve(opts.out),
      resources,
      localSpecDir: opts.src ? resolve(opts.src) : undefined,
      cacheDir: opts.cache ? resolve(opts.cache) : undefined,
      ig: opts.ig,
      expandValueSets: opts.expandValuesets,
      resolveCodeSystems: opts.resolveCodesystems,
      includeSpec: opts.includeSpec,
      validator,
      strictExtensible: opts.strictExtensible,
    });
  });

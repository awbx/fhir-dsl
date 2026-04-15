import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { generateCommand } from "./commands/generate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const program = new Command();

program
  .name("fhir-gen")
  .description("Type-safe FHIR TypeScript code generator")
  .version(pkg.version, "-V, --cli-version");

program.addCommand(generateCommand);

program.parse();

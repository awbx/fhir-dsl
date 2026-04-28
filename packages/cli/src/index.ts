import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { capabilityCommand } from "./commands/capability.js";
import { generateCommand } from "./commands/generate.js";
import { scaffoldIgCommand } from "./commands/scaffold-ig.js";
import { validateCommand } from "./commands/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const program = new Command();

program
  .name("fhir-gen")
  .description("Type-safe FHIR TypeScript code generator")
  .version(pkg.version, "-V, --cli-version");

program.addCommand(generateCommand);
program.addCommand(capabilityCommand);
program.addCommand(validateCommand);
program.addCommand(scaffoldIgCommand);

program.parse();

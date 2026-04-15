import { Command } from "commander";
import { generateCommand } from "./commands/generate.js";

const program = new Command();

program.name("fhir-gen").description("Type-safe FHIR TypeScript code generator").version("0.1.0");

program.addCommand(generateCommand);

program.parse();

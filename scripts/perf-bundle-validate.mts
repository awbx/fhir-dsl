/**
 * Run via `node --experimental-strip-types`. Imports the native runtime as
 * source so we measure exactly the validator the generator emits into
 * consumer projects. Prints a single ms number on stdout.
 */
import { performance } from "node:perf_hooks";
import * as s from "../packages/generator/src/emitter/schema/native-runtime.ts";

const HumanName = s.object({
  use: { schema: s.string(), optional: true },
  family: { schema: s.string(), optional: true },
  given: { schema: s.array(s.string()), optional: true },
});
const Patient = s.object({
  resourceType: { schema: s.literal("Patient"), optional: false },
  id: { schema: s.string(), optional: true },
  birthDate: { schema: s.string(), optional: true },
  name: { schema: s.array(HumanName), optional: true },
});

const sample = {
  resourceType: "Patient" as const,
  id: "p",
  name: [{ given: ["Ada"], family: "Lovelace", use: "official" }],
  birthDate: "1815-12-10",
};
const bundle = Array.from({ length: 1000 }, (_, i) => ({ ...sample, id: `p-${i}` }));

for (let i = 0; i < 100; i++) Patient["~standard"].validate(bundle[0]);

const start = performance.now();
for (const r of bundle) Patient["~standard"].validate(r);
const took = (performance.now() - start).toFixed(1);

process.stdout.write(took);

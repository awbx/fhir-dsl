import { copyFile, mkdir } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  shims: true,
  async onSuccess() {
    // The native adapter reads this file at runtime and emits its contents
    // as `__runtime.ts` in consumer projects. Keep it as raw source next to
    // the bundled dist files.
    await mkdir("dist", { recursive: true });
    await copyFile("src/emitter/schema/native-runtime.ts", "dist/native-runtime.ts");
  },
});

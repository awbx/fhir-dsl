import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["packages/*/src/**/*.test.ts", "packages/*/test/**/*.test.ts"],
    // Run pipeline e2e tests serially — each writes to its own tmpdir but
    // they're heavy and produce cleaner output run sequentially.
    testTimeout: 60_000,
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["packages/*/src/**/*.test.ts", "packages/example/**", "packages/types/src/.cache/**"],
    },
    typecheck: {
      enabled: true,
      include: ["packages/*/test/**/*.test-d.ts"],
      tsconfig: "./tsconfig.test.json",
    },
  },
});

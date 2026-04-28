import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

// Conformance test #1 — public export surface stability.
//
// Runs `node scripts/export-surface.mjs --check`. If the public exports
// of any package drift from `.surface-snapshot.json`, this fails with the
// drift detected message. Refresh with `pnpm audit:export-surface`.

const here = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(here, "..", "..", "..", "scripts", "export-surface.mjs");

describe("conformance: export surface", () => {
  it("matches the checked-in snapshot", () => {
    execFileSync("node", [scriptPath, "--check"], {
      stdio: "pipe",
      encoding: "utf-8",
    });
  });
});

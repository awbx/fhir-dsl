import { readdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");
const tmpOutputDir = join(__dirname, ".tmp-backward-compat");
const legacyGoldenDir = join(__dirname, "legacy-golden");

async function listFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, baseDir)));
      continue;
    }
    files.push(fullPath.slice(baseDir.length + 1));
  }

  return files;
}

describe("codex terminology backward compatibility", () => {
  beforeAll(async () => {
    await rm(tmpOutputDir, { recursive: true, force: true });

    await generate({
      version: "r4",
      outDir: tmpOutputDir,
      localSpecDir: fixturesDir,
      expandValueSets: false,
      resolveCodeSystems: false,
    });
  });

  it("does not emit a terminology directory when the flag is off", async () => {
    await expect(stat(join(tmpOutputDir, "r4", "terminology"))).rejects.toThrow();
  });

  it("matches the checked-in legacy bundle byte for byte", async () => {
    const generatedFiles = (await listFiles(join(tmpOutputDir, "r4"))).filter((file) => !file.startsWith(".cache"));
    const legacyFiles = (await listFiles(join(legacyGoldenDir, "r4"))).filter((file) => !file.startsWith(".cache"));

    expect(generatedFiles.sort()).toEqual(legacyFiles.sort());

    for (const file of generatedFiles) {
      const generated = await readFile(join(tmpOutputDir, "r4", file));
      const legacy = await readFile(join(legacyGoldenDir, "r4", file));
      expect(generated.equals(legacy), file).toBe(true);
    }
  });
});

import { mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");
const tmpOutputDir = join(__dirname, ".tmp-backward-compat");
const legacyGoldenDir = join(__dirname, "legacy-golden");

async function getAllFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, baseDir)));
    } else {
      files.push(fullPath.slice(baseDir.length + 1));
    }
  }
  return files;
}

describe("gemini-2-0-flash-thinking-exp Backward Compat", () => {
  beforeAll(async () => {
    await rm(tmpOutputDir, { recursive: true, force: true });
    await mkdir(tmpOutputDir, { recursive: true });

    await generate({
      version: "r4",
      outDir: tmpOutputDir,
      localSpecDir: fixturesDir,
      expandValueSets: false,
      resolveCodeSystems: false,
    });
  });

  it("should NOT generate terminology directory when expandValueSets is false", async () => {
    const termDir = join(tmpOutputDir, "r4", "terminology");
    await expect(stat(termDir)).rejects.toThrow();
  });

  it("should match legacy golden bundle byte-for-byte", async () => {
    const generatedFiles = await getAllFiles(join(tmpOutputDir, "r4"));
    const goldenFiles = await getAllFiles(join(legacyGoldenDir, "r4"));

    // Exclude .cache if it exists
    const filteredGenerated = generatedFiles.filter((f) => !f.startsWith(".cache"));
    const filteredGolden = goldenFiles.filter((f) => !f.startsWith(".cache"));

    expect(filteredGenerated.sort()).toEqual(filteredGolden.sort());

    for (const file of filteredGenerated) {
      const generatedContent = await readFile(join(tmpOutputDir, "r4", file));
      const goldenContent = await readFile(join(legacyGoldenDir, "r4", file));

      if (!generatedContent.equals(goldenContent)) {
        throw new Error(`Byte-diff failure in ${file}`);
      }
    }
  });
});

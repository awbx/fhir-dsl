import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const FHIR_SPEC_URLS: Record<string, string> = {
  r4: "https://hl7.org/fhir/R4",
  r4b: "https://hl7.org/fhir/R4B",
  r5: "https://hl7.org/fhir/R5",
  // R6 is not yet published — use the CI build (latest draft)
  r6: "https://build.fhir.org",
};

function resolveSpecBaseUrl(version: string): string {
  return FHIR_SPEC_URLS[version.toLowerCase()] ?? `https://hl7.org/fhir/${version.toUpperCase()}`;
}

export interface DownloadedSpec {
  resourceDefinitions: unknown[];
  searchParameters: unknown[];
}

export async function downloadSpec(version: string, cacheDir: string): Promise<DownloadedSpec> {
  const baseUrl = resolveSpecBaseUrl(version);

  await mkdir(cacheDir, { recursive: true });

  const profilesPath = join(cacheDir, "profiles-resources.json");
  const searchParamsPath = join(cacheDir, "search-parameters.json");

  const resourceDefinitions = await loadOrDownload(profilesPath, `${baseUrl}/profiles-resources.json`);

  const searchParameters = await loadOrDownload(searchParamsPath, `${baseUrl}/search-parameters.json`);

  return {
    resourceDefinitions: extractEntries(resourceDefinitions),
    searchParameters: extractEntries(searchParameters),
  };
}

export async function loadLocalSpec(dir: string): Promise<DownloadedSpec> {
  const files = await readdir(dir);
  const resourceDefinitions: unknown[] = [];
  const searchParameters: unknown[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = JSON.parse(await readFile(join(dir, file), "utf-8"));

    if (content.resourceType === "Bundle") {
      const entries = extractEntries(content);
      for (const entry of entries) {
        const rt = (entry as any).resourceType;
        if (rt === "StructureDefinition") resourceDefinitions.push(entry);
        if (rt === "SearchParameter") searchParameters.push(entry);
      }
    } else if (content.resourceType === "StructureDefinition") {
      resourceDefinitions.push(content);
    } else if (content.resourceType === "SearchParameter") {
      searchParameters.push(content);
    }
  }

  return { resourceDefinitions, searchParameters };
}

// --- IG Package Support ---

const FHIR_PACKAGE_REGISTRY = "https://packages.fhir.org";

export interface DownloadedIG {
  name: string;
  version: string;
  profiles: unknown[];
}

export async function downloadIG(packageRef: string, cacheDir: string): Promise<DownloadedIG> {
  const { name, version } = parsePackageRef(packageRef);

  await mkdir(cacheDir, { recursive: true });

  const igDir = join(cacheDir, `${name}#${version}`);
  await mkdir(igDir, { recursive: true });

  const _manifestPath = join(igDir, ".index.json");

  // Check if already downloaded
  let files: string[];
  try {
    const existing = await readdir(igDir);
    if (existing.some((f) => f.endsWith(".json") && f !== ".index.json")) {
      files = existing;
      console.info(`Using cached IG: ${name}@${version}`);
    } else {
      files = await fetchAndExtractIG(name, version, igDir);
    }
  } catch {
    files = await fetchAndExtractIG(name, version, igDir);
  }

  // Load profile StructureDefinitions
  const profiles: unknown[] = [];
  for (const file of files) {
    if (!file.endsWith(".json") || file === ".index.json" || file === "package.json") continue;
    try {
      const content = JSON.parse(await readFile(join(igDir, file), "utf-8"));
      if (
        content.resourceType === "StructureDefinition" &&
        content.derivation === "constraint" &&
        content.kind === "resource" &&
        !content.abstract
      ) {
        profiles.push(content);
      }
    } catch {
      // Skip invalid files
    }
  }

  console.info(`Loaded ${profiles.length} profiles from ${name}@${version}`);

  return { name, version, profiles };
}

function parsePackageRef(ref: string): { name: string; version: string } {
  // Support "name@version" and "name#version" formats
  const atIdx = ref.lastIndexOf("@");
  const hashIdx = ref.lastIndexOf("#");
  const sepIdx = Math.max(atIdx, hashIdx);

  if (sepIdx <= 0) {
    throw new Error(`Invalid package reference: "${ref}". Use format: name@version (e.g., hl7.fhir.us.core@6.1.0)`);
  }

  return {
    name: ref.slice(0, sepIdx),
    version: ref.slice(sepIdx + 1),
  };
}

async function fetchAndExtractIG(name: string, version: string, outDir: string): Promise<string[]> {
  const tgzUrl = `${FHIR_PACKAGE_REGISTRY}/${name}/${version}`;
  console.info(`Downloading IG: ${name}@${version} from ${tgzUrl}...`);

  const response = await fetch(tgzUrl);
  if (!response.ok) {
    throw new Error(`Failed to download IG ${name}@${version}: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const { gunzipSync } = await import("node:zlib");
  const decompressed = gunzipSync(Buffer.from(buffer));

  // Parse tar (simplified - FHIR packages use standard POSIX tar)
  const files = parseTar(decompressed);
  const written: string[] = [];

  for (const [filePath, content] of files) {
    // FHIR packages have files under "package/" prefix
    const stripped = filePath.replace(/^package\//, "");
    if (!stripped || stripped.includes("/")) continue; // Only top-level files
    if (!stripped.endsWith(".json")) continue;

    await writeFile(join(outDir, stripped), content, "utf-8");
    written.push(stripped);
  }

  console.info(`Extracted ${written.length} files from ${name}@${version}`);
  return written;
}

function parseTar(buffer: Buffer): Array<[string, string]> {
  const files: Array<[string, string]> = [];
  let offset = 0;

  while (offset < buffer.length - 512) {
    // Read header (512 bytes)
    const header = buffer.subarray(offset, offset + 512);

    // Check for end-of-archive (two zero blocks)
    if (header.every((b) => b === 0)) break;

    // File name (bytes 0-99)
    const nameEnd = header.indexOf(0, 0);
    const name = header.subarray(0, Math.min(nameEnd >= 0 ? nameEnd : 100, 100)).toString("utf-8");

    // File size (bytes 124-135, octal)
    const sizeStr = header.subarray(124, 136).toString("utf-8").trim().replace(/\0/g, "");
    const size = Number.parseInt(sizeStr, 8) || 0;

    // Type flag (byte 156): '0' or '\0' = regular file
    const typeFlag = header[156];

    offset += 512; // Move past header

    if ((typeFlag === 48 || typeFlag === 0) && size > 0 && name) {
      const content = buffer.subarray(offset, offset + size).toString("utf-8");
      files.push([name, content]);
    }

    // Move past data blocks (rounded up to 512)
    offset += Math.ceil(size / 512) * 512;
  }

  return files;
}

async function loadOrDownload(filePath: string, url: string): Promise<unknown> {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    // File doesn't exist, download it
  }

  console.info(`Downloading ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  await writeFile(filePath, text, "utf-8");

  return JSON.parse(text);
}

function extractEntries(bundle: unknown): unknown[] {
  const b = bundle as any;
  if (b?.resourceType === "Bundle" && Array.isArray(b.entry)) {
    return b.entry.filter((e: any) => e.resource).map((e: any) => e.resource);
  }
  if (Array.isArray(bundle)) return bundle;
  return [bundle];
}

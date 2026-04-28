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
  expansions?: unknown[] | undefined;
  valueSets?: unknown[] | undefined;
  codeSystems?: unknown[] | undefined;
}

export interface DownloadSpecOptions {
  expandValueSets?: boolean | undefined;
}

export async function downloadSpec(
  version: string,
  cacheDir: string,
  options?: DownloadSpecOptions,
): Promise<DownloadedSpec> {
  const baseUrl = resolveSpecBaseUrl(version);

  await mkdir(cacheDir, { recursive: true });

  const profilesPath = join(cacheDir, "profiles-resources.json");
  const searchParamsPath = join(cacheDir, "search-parameters.json");
  const typesPath = join(cacheDir, "profiles-types.json");

  const resourceDefinitions = await loadOrDownload(profilesPath, `${baseUrl}/profiles-resources.json`);
  const searchParameters = await loadOrDownload(searchParamsPath, `${baseUrl}/search-parameters.json`);
  const typeDefinitions = await loadOrDownload(typesPath, `${baseUrl}/profiles-types.json`);

  const allDefinitions = extractEntries(resourceDefinitions);
  allDefinitions.push(...extractEntries(typeDefinitions));

  const result: DownloadedSpec = {
    resourceDefinitions: allDefinitions,
    searchParameters: extractEntries(searchParameters),
  };

  if (options?.expandValueSets) {
    const expansionsPath = join(cacheDir, "expansions.json");
    const expansions = await loadOrDownload(expansionsPath, `${baseUrl}/expansions.json`);
    result.expansions = extractEntries(expansions);
  }

  return result;
}

export async function loadLocalSpec(dir: string): Promise<DownloadedSpec> {
  const files = await readdir(dir);
  const resourceDefinitions: unknown[] = [];
  const searchParameters: unknown[] = [];
  const valueSets: unknown[] = [];
  const codeSystems: unknown[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = JSON.parse(await readFile(join(dir, file), "utf-8"));

    if (content.resourceType === "Bundle") {
      const entries = extractEntries(content);
      for (const entry of entries) {
        const rt = isRecord(entry) ? entry.resourceType : undefined;
        if (rt === "StructureDefinition") resourceDefinitions.push(entry);
        else if (rt === "SearchParameter") searchParameters.push(entry);
        else if (rt === "ValueSet") valueSets.push(entry);
        else if (rt === "CodeSystem") codeSystems.push(entry);
      }
    } else if (content.resourceType === "StructureDefinition") {
      resourceDefinitions.push(content);
    } else if (content.resourceType === "SearchParameter") {
      searchParameters.push(content);
    } else if (content.resourceType === "ValueSet") {
      valueSets.push(content);
    } else if (content.resourceType === "CodeSystem") {
      codeSystems.push(content);
    }
  }

  return {
    resourceDefinitions,
    searchParameters,
    valueSets: valueSets.length > 0 ? valueSets : undefined,
    codeSystems: codeSystems.length > 0 ? codeSystems : undefined,
  };
}

// --- IG Package Support ---

const FHIR_PACKAGE_REGISTRY = "https://packages.fhir.org";

export interface DownloadedIG {
  name: string;
  version: string;
  profiles: unknown[];
  /** Phase 2.2: extension StructureDefinitions defined in the IG. */
  extensions: unknown[];
  valueSets: unknown[];
  codeSystems: unknown[];
  /** Phase 2.3: parsed `ImplementationGuide` manifest (when present in the package). */
  manifest?: ImplementationGuideManifest | undefined;
}

/**
 * Phase 2.3: a flattened view of an IG's `ImplementationGuide` resource.
 *
 * `global` lets the generator default-narrow base FHIR types to their
 * IG-specific profile (e.g., `Patient` → us-core-patient when
 * `--ig hl7.fhir.us.core` is passed).
 *
 * `dependsOn` lists transitive IG references — surfaced for downstream
 * tooling but not auto-loaded. Callers that want transitive support
 * inspect `dependsOn` and call `downloadIG` per entry.
 */
export interface ImplementationGuideManifest {
  url?: string | undefined;
  version?: string | undefined;
  packageId?: string | undefined;
  fhirVersion?: string[] | undefined;
  /** Default profile binding per resource type — `Patient` → profile URL. */
  global: Record<string, string>;
  /** Transitive IG dependencies (`packageId@version`). */
  dependsOn: Array<{ packageId: string; version?: string; uri?: string }>;
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

  // Load resources from IG package
  const profiles: unknown[] = [];
  const extensions: unknown[] = [];
  const valueSets: unknown[] = [];
  const codeSystems: unknown[] = [];
  let manifest: ImplementationGuideManifest | undefined;
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
      } else if (
        content.resourceType === "StructureDefinition" &&
        content.derivation === "constraint" &&
        content.type === "Extension" &&
        content.kind === "complex-type" &&
        !content.abstract
      ) {
        extensions.push(content);
      } else if (content.resourceType === "ValueSet") {
        valueSets.push(content);
      } else if (content.resourceType === "CodeSystem") {
        codeSystems.push(content);
      } else if (content.resourceType === "ImplementationGuide") {
        manifest = parseImplementationGuide(content);
      }
    } catch {
      // Skip invalid files
    }
  }

  const manifestSummary = manifest
    ? ` (${Object.keys(manifest.global).length} globals, ${manifest.dependsOn.length} deps)`
    : "";
  console.info(
    `Loaded ${profiles.length} profiles, ${extensions.length} extensions, ${valueSets.length} ValueSets, ${codeSystems.length} CodeSystems from ${name}@${version}${manifestSummary}`,
  );

  return { name, version, profiles, extensions, valueSets, codeSystems, manifest };
}

/** Phase 2.3: extract `global[*]` and `dependsOn[*]` from an ImplementationGuide resource. */
function parseImplementationGuide(ig: Record<string, unknown>): ImplementationGuideManifest {
  const global: Record<string, string> = {};
  const globals = (ig.global ?? []) as Array<{ type?: string; profile?: string }>;
  for (const g of globals) {
    if (g.type && g.profile) global[g.type] = g.profile;
  }
  const dependsOn: ImplementationGuideManifest["dependsOn"] = [];
  const deps = (ig.dependsOn ?? []) as Array<{ packageId?: string; version?: string; uri?: string }>;
  for (const d of deps) {
    if (d.packageId) {
      const entry: { packageId: string; version?: string; uri?: string } = { packageId: d.packageId };
      if (d.version !== undefined) entry.version = d.version;
      if (d.uri !== undefined) entry.uri = d.uri;
      dependsOn.push(entry);
    }
  }
  const manifest: ImplementationGuideManifest = { global, dependsOn };
  if (typeof ig.url === "string") manifest.url = ig.url;
  if (typeof ig.version === "string") manifest.version = ig.version;
  if (typeof ig.packageId === "string") manifest.packageId = ig.packageId;
  if (Array.isArray(ig.fhirVersion)) manifest.fhirVersion = ig.fhirVersion as string[];
  return manifest;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractEntries(bundle: unknown): unknown[] {
  if (!isRecord(bundle)) return [bundle];
  if (bundle.resourceType === "Bundle" && Array.isArray(bundle.entry)) {
    return (bundle.entry as unknown[])
      .filter((e) => isRecord(e) && e.resource)
      .map((e) => (e as Record<string, unknown>).resource as unknown);
  }
  if (Array.isArray(bundle)) return bundle;
  return [bundle];
}

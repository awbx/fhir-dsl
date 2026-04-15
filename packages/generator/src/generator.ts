import { access, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { toKebabCase } from "@fhir-dsl/utils";
import { type DownloadedSpec, downloadIG, downloadSpec, loadLocalSpec } from "./downloader.js";
import { emitResourceIndex, emitRootIndex } from "./emitter/index-emitter.js";
import { emitProfile, emitProfileIndex, emitProfileRegistry } from "./emitter/profile-emitter.js";
import { emitRegistry } from "./emitter/registry-emitter.js";
import { emitResource } from "./emitter/resource-emitter.js";
import { emitSearchParams, emitSearchParamTypes } from "./emitter/search-param-emitter.js";
import type { ProfileModel } from "./model/profile-model.js";
import type { ResourceModel } from "./model/resource-model.js";
import { parseProfile } from "./parser/profile.js";
import { parseSearchParameters } from "./parser/search-parameter.js";
import { parseStructureDefinition } from "./parser/structure-definition.js";

export interface GeneratorOptions {
  version: string;
  outDir: string;
  resources?: string[];
  cacheDir?: string;
  localSpecDir?: string;
  ig?: string[];
}

export async function generate(options: GeneratorOptions): Promise<void> {
  const { version, outDir, resources: filterResources, cacheDir, localSpecDir } = options;

  console.info(`Generating FHIR ${version} types...`);

  // Load spec
  let spec: DownloadedSpec;
  if (localSpecDir) {
    spec = await loadLocalSpec(localSpecDir);
  } else {
    const cache = cacheDir ?? join(outDir, ".cache");
    spec = await downloadSpec(version, cache);
  }

  console.info(
    `Loaded ${spec.resourceDefinitions.length} definitions, ${spec.searchParameters.length} search parameters`,
  );

  // Parse StructureDefinitions
  let resourceModels: ResourceModel[] = [];
  for (const sd of spec.resourceDefinitions) {
    const sdAny = sd as any;
    if (sdAny.resourceType !== "StructureDefinition") continue;
    if (sdAny.kind !== "resource") continue;
    if (sdAny.abstract) continue;
    if (!sdAny.snapshot?.element?.length) continue;

    try {
      const model = parseStructureDefinition(sdAny);
      resourceModels.push(model);
    } catch (err) {
      console.warn(`Failed to parse ${sdAny.name}: ${err}`);
    }
  }

  // Filter if requested
  if (filterResources?.length) {
    const filterSet = new Set(filterResources.map((r) => r.toLowerCase()));
    resourceModels = resourceModels.filter((m) => filterSet.has(m.name.toLowerCase()));
  }

  console.info(`Generating types for ${resourceModels.length} resources`);

  // Parse SearchParameters
  const searchParamsMap = parseSearchParameters(spec.searchParameters as any[]);

  // Create output directories
  const versionDir = join(outDir, version.toLowerCase());
  const resourcesDir = join(versionDir, "resources");
  await mkdir(resourcesDir, { recursive: true });

  // Only write primitives/datatypes if they don't already exist (don't overwrite hand-written ones)
  const primitivesPath = join(versionDir, "primitives.ts");
  const datatypesPath = join(versionDir, "datatypes.ts");
  if (!(await fileExists(primitivesPath))) {
    await writeFile(primitivesPath, PRIMITIVES_TEMPLATE, "utf-8");
  }
  if (!(await fileExists(datatypesPath))) {
    await writeFile(datatypesPath, DATATYPES_STUB, "utf-8");
  }

  // Emit search param types
  await writeFile(join(versionDir, "search-param-types.ts"), emitSearchParamTypes(), "utf-8");

  // Emit resource files
  for (const model of resourceModels) {
    const fileName = `${toKebabCase(model.name)}.ts`;
    const content = emitResource(model);
    await writeFile(join(resourcesDir, fileName), content, "utf-8");
  }

  // Emit search params
  const filteredSearchParams = new Map<string, any>();
  for (const model of resourceModels) {
    const sp = searchParamsMap.get(model.name);
    if (sp) filteredSearchParams.set(model.name, sp);
  }
  await writeFile(join(versionDir, "search-params.ts"), emitSearchParams(filteredSearchParams), "utf-8");

  // --- IG Profile Generation ---
  const igPackages = options.ig ?? [];
  const allProfiles: ProfileModel[] = [];

  if (igPackages.length > 0) {
    const cache = cacheDir ?? join(outDir, ".cache");

    for (const igRef of igPackages) {
      const ig = await downloadIG(igRef, join(cache, "igs"));

      for (const sd of ig.profiles) {
        try {
          const profile = parseProfile(sd as any, ig.name);
          allProfiles.push(profile);
        } catch (err) {
          console.warn(`Failed to parse profile ${(sd as any).name}: ${err}`);
        }
      }
    }

    if (allProfiles.length > 0) {
      const profilesDir = join(versionDir, "profiles");
      await mkdir(profilesDir, { recursive: true });

      for (const profile of allProfiles) {
        const fileName = `${toKebabCase(profile.name)}.ts`;
        await writeFile(join(profilesDir, fileName), emitProfile(profile), "utf-8");
      }

      await writeFile(join(profilesDir, "index.ts"), emitProfileIndex(allProfiles), "utf-8");
      await writeFile(join(profilesDir, "profile-registry.ts"), emitProfileRegistry(allProfiles), "utf-8");

      console.info(`Generated ${allProfiles.length} profiles`);
    }
  }

  // Detect subdirectories with index.ts (profiles/, etc.)
  const extraExports: string[] = [];
  let hasProfilesDir = false;
  try {
    const entries = await readdir(versionDir);
    for (const entry of entries) {
      if (entry === "resources") continue;
      const entryPath = join(versionDir, entry);
      const entryStat = await stat(entryPath);
      if (entryStat.isDirectory() && (await fileExists(join(entryPath, "index.ts")))) {
        extraExports.push(`./${entry}/index.js`);
        if (entry === "profiles") hasProfilesDir = true;
      }
    }
  } catch {
    // Directory might not exist yet on first run
  }

  // Emit registry (skip ProfileRegistry if profiles/ directory defines it)
  await writeFile(
    join(versionDir, "registry.ts"),
    emitRegistry(resourceModels, filteredSearchParams, { skipProfileRegistry: hasProfilesDir }),
    "utf-8",
  );

  // Emit index files
  await writeFile(join(versionDir, "index.ts"), emitResourceIndex(resourceModels, extraExports), "utf-8");

  // Only write root index if it doesn't already exist (user manages this file)
  const rootIndexPath = join(outDir, "index.ts");
  if (!(await fileExists(rootIndexPath))) {
    await writeFile(rootIndexPath, emitRootIndex(version), "utf-8");
  }

  console.info(`Generated types in ${outDir}`);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const PRIMITIVES_TEMPLATE = `export type FhirString = string;
export type FhirBoolean = boolean;
export type FhirDate = string;
export type FhirDateTime = string;
export type FhirInstant = string;
export type FhirDecimal = number;
export type FhirInteger = number;
export type FhirPositiveInt = number;
export type FhirUnsignedInt = number;
export type FhirCode<T extends string = string> = T;
export type FhirUri = string;
export type FhirUrl = string;
export type FhirCanonical = string;
export type FhirId = string;
export type FhirOid = string;
export type FhirUuid = string;
export type FhirMarkdown = string;
export type FhirBase64Binary = string;
export type FhirTime = string;
export type FhirXhtml = string;
`;

const DATATYPES_STUB = `// Generated datatypes stub
// In a full implementation, complex datatypes would be generated from StructureDefinitions
export { type Element, type Extension, type Coding, type CodeableConcept, type Identifier, type Period, type HumanName, type Address, type ContactPoint, type Quantity, type Range, type Ratio, type Attachment, type Annotation, type SampledData, type Duration, type Age, type SimpleQuantity, type Reference, type Narrative, type Meta, type Resource, type DomainResource, type BackboneElement, type Timing, type Dosage } from "@fhir-dsl/types";
`;

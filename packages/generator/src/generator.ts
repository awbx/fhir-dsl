import { access, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { TerminologyRegistry } from "@fhir-dsl/terminology";
import { toKebabCase } from "@fhir-dsl/utils";
import { type DownloadedSpec, downloadIG, downloadSpec, loadLocalSpec } from "./downloader.js";
import { emitClient, emitResourceIndex, emitRootIndex } from "./emitter/index-emitter.js";
import { emitProfile, emitProfileIndex, emitProfileRegistry } from "./emitter/profile-emitter.js";
import { emitRegistry } from "./emitter/registry-emitter.js";
import { emitResource } from "./emitter/resource-emitter.js";
import type { SearchParamBindingMap } from "./emitter/search-param-emitter.js";
import { emitSearchParams, emitSearchParamTypes } from "./emitter/search-param-emitter.js";
import { emitProfileSpec, emitResourceSpec, emitSpecIndex } from "./emitter/spec-emitter.js";
import { type BindingTypeMap, emitTerminology } from "./emitter/terminology-emitter.js";
import type { ProfileModel } from "./model/profile-model.js";
import type { ResourceModel, ResourceSearchParams } from "./model/resource-model.js";
import { parseProfile } from "./parser/profile.js";
import { parseSearchParameters } from "./parser/search-parameter.js";
import { parseStructureDefinition } from "./parser/structure-definition.js";

interface FhirStructureDefinition {
  resourceType: "StructureDefinition";
  url: string;
  name: string;
  kind: string;
  abstract: boolean;
  type: string;
  baseDefinition?: string | undefined;
  derivation?: string | undefined;
  snapshot?: { element: unknown[] } | undefined;
  differential?: { element: unknown[] } | undefined;
  [key: string]: unknown;
}

function isStructureDefinition(value: unknown): value is FhirStructureDefinition {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.resourceType === "StructureDefinition" &&
    typeof record.name === "string" &&
    typeof record.url === "string" &&
    typeof record.type === "string"
  );
}

export interface GeneratorOptions {
  version: string;
  outDir: string;
  resources?: string[] | undefined;
  cacheDir?: string | undefined;
  localSpecDir?: string | undefined;
  ig?: string[] | undefined;
  expandValueSets?: boolean | undefined;
  resolveCodeSystems?: boolean | undefined;
  includeSpec?: boolean | undefined;
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
    spec = await downloadSpec(version, cache, {
      expandValueSets: options.expandValueSets,
    });
  }

  console.info(
    `Loaded ${spec.resourceDefinitions.length} definitions, ${spec.searchParameters.length} search parameters`,
  );

  // Parse StructureDefinitions
  let resourceModels: ResourceModel[] = [];
  for (const sd of spec.resourceDefinitions) {
    if (!isStructureDefinition(sd)) continue;
    if (sd.kind !== "resource") continue;
    if (sd.abstract) continue;
    if (!sd.snapshot?.element?.length) continue;

    try {
      const model = parseStructureDefinition(sd as Parameters<typeof parseStructureDefinition>[0]);
      resourceModels.push(model);
    } catch (err) {
      console.warn(`Failed to parse ${sd.name}: ${err}`);
    }
  }

  // Filter if requested
  if (filterResources?.length) {
    const filterSet = new Set(filterResources.map((r) => r.toLowerCase()));
    resourceModels = resourceModels.filter((m) => filterSet.has(m.name.toLowerCase()));
  }

  console.info(`Generating types for ${resourceModels.length} resources`);

  // Parse SearchParameters
  const searchParamsMap = parseSearchParameters(spec.searchParameters);

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

  // --- Terminology resolution ---
  let bindingTypeMap: BindingTypeMap | undefined;

  if (options.expandValueSets) {
    const registry = new TerminologyRegistry();

    // Load pre-expanded ValueSets from spec
    if (spec.expansions) {
      registry.loadExpansions(spec.expansions);
    }

    // Load CodeSystems and ValueSets from spec (local or downloaded)
    if (spec.codeSystems) {
      for (const cs of spec.codeSystems) {
        registry.loadCodeSystem(cs);
      }
    }
    if (spec.valueSets) {
      for (const vs of spec.valueSets) {
        registry.loadValueSet(vs);
      }
    }

    registry.resolveAll();

    console.info(
      `Terminology: ${registry.resolvedCount} ValueSets resolved, ${registry.codeSystemCount} CodeSystems loaded`,
    );

    // Emit terminology files
    const allResolved = [...registry.allResolved()];
    const termResult = emitTerminology(allResolved);
    bindingTypeMap = termResult.bindingTypeMap;

    if (termResult.valueSetsSource) {
      const terminologyDir = join(versionDir, "terminology");
      await mkdir(terminologyDir, { recursive: true });

      await writeFile(join(terminologyDir, "valuesets.ts"), termResult.valueSetsSource, "utf-8");

      if (options.resolveCodeSystems && termResult.codeSystemsSource) {
        await writeFile(join(terminologyDir, "codesystems.ts"), termResult.codeSystemsSource, "utf-8");
      }

      console.info(`Generated ${bindingTypeMap.size} terminology types`);
    }
  }

  // Emit resource files
  for (const model of resourceModels) {
    const fileName = `${toKebabCase(model.name)}.ts`;
    const content = emitResource(model, bindingTypeMap);
    await writeFile(join(resourcesDir, fileName), content, "utf-8");
  }

  // Build search param binding map from resource properties with bindings
  let searchParamBindingMap: SearchParamBindingMap | undefined;
  if (bindingTypeMap) {
    searchParamBindingMap = new Map();
    for (const model of resourceModels) {
      for (const prop of model.properties) {
        if (!prop.binding) continue;
        let typeName = bindingTypeMap.get(prop.binding.valueSet);
        if (!typeName) {
          const bareUrl = prop.binding.valueSet.split("|")[0]!;
          typeName = bindingTypeMap.get(bareUrl);
        }
        if (typeName) {
          searchParamBindingMap.set(`${model.name}.${prop.name}`, {
            typeName,
            strength: prop.binding.strength,
          });
        }
      }
    }
  }

  // Emit search params
  const filteredSearchParams = new Map<string, ResourceSearchParams>();
  for (const model of resourceModels) {
    const sp = searchParamsMap.get(model.name);
    if (sp) filteredSearchParams.set(model.name, sp);
  }
  await writeFile(
    join(versionDir, "search-params.ts"),
    emitSearchParams(filteredSearchParams, searchParamBindingMap),
    "utf-8",
  );

  // --- Spec markdown (resources) ---
  if (options.includeSpec) {
    const specResourcesDir = join(versionDir, "spec", "resources");
    await mkdir(specResourcesDir, { recursive: true });
    for (const model of resourceModels) {
      const fileName = `${toKebabCase(model.name)}.md`;
      const content = emitResourceSpec(model, filteredSearchParams.get(model.name));
      await writeFile(join(specResourcesDir, fileName), content, "utf-8");
    }
  }

  // --- IG Profile Generation ---
  const igPackages = options.ig ?? [];
  const allProfiles: ProfileModel[] = [];

  if (igPackages.length > 0) {
    const cache = cacheDir ?? join(outDir, ".cache");

    for (const igRef of igPackages) {
      const ig = await downloadIG(igRef, join(cache, "igs"));

      for (const sd of ig.profiles) {
        if (!isStructureDefinition(sd)) continue;
        try {
          const profile = parseProfile(sd as Parameters<typeof parseProfile>[0], ig.name);
          allProfiles.push(profile);
        } catch (err) {
          console.warn(`Failed to parse profile ${sd.name}: ${err}`);
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

      // --- Spec markdown (profiles) ---
      if (options.includeSpec) {
        const specProfilesDir = join(versionDir, "spec", "profiles");
        await mkdir(specProfilesDir, { recursive: true });
        for (const profile of allProfiles) {
          const fileName = `${toKebabCase(profile.name)}.md`;
          await writeFile(join(specProfilesDir, fileName), emitProfileSpec(profile), "utf-8");
        }
      }
    }
  }

  // --- Spec index ---
  if (options.includeSpec) {
    const specDir = join(versionDir, "spec");
    await mkdir(specDir, { recursive: true });
    await writeFile(join(specDir, "index.md"), emitSpecIndex(version, resourceModels, allProfiles), "utf-8");
    console.info(`Generated spec markdown in ${specDir}`);
  }

  // Detect subdirectories with index.ts (profiles/, etc.)
  const extraExports: string[] = [];
  let hasProfilesDir = false;
  try {
    const entries = await readdir(versionDir);
    for (const entry of entries) {
      if (entry === "resources" || entry === "terminology") continue;
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

  // Emit typed client helper
  await writeFile(join(versionDir, "client.ts"), emitClient(hasProfilesDir), "utf-8");

  // Emit index files (include client export)
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

const DATATYPES_STUB = `// Re-exports base FHIR datatypes from @fhir-dsl/types
// Bundle/BundleEntry/BundleLink are omitted here — they come from the generated resources/bundle.ts
export { type Element, type Extension, type Coding, type CodeableConcept, type Identifier, type Period, type HumanName, type Address, type ContactPoint, type Quantity, type Range, type Ratio, type Attachment, type Annotation, type SampledData, type Duration, type Age, type SimpleQuantity, type Reference, type Narrative, type Meta, type Resource, type DomainResource, type BackboneElement, type Timing, type Dosage, type Money, type ContactDetail, type UsageContext, type RelatedArtifact, type Expression, type DataRequirement, type TriggerDefinition, type Signature, type Distance, type Count, type SubstanceAmount, type Contributor, type ParameterDefinition, type Population, type ProdCharacteristic, type ProductShelfLife, type MarketingStatus, type ElementDefinition } from "@fhir-dsl/types";
`;

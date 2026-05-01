import { access, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type ResolvedValueSet, TerminologyRegistry } from "@fhir-dsl/terminology";
import { toKebabCase } from "@fhir-dsl/utils";
import { type DownloadedSpec, downloadIG, downloadSpec, loadLocalSpec } from "./downloader.js";
import { emitExtension, emitExtensionIndex, emitExtensionRegistry } from "./emitter/extension-emitter.js";
import { emitClient, emitResourceIndex, emitRootIndex } from "./emitter/index-emitter.js";
import { emitLayers } from "./emitter/layer-emitter.js";
import { emitDatatypes, emitPrimitives } from "./emitter/primitives-emitter.js";
import { emitProfile, emitProfileIndex, emitProfileRegistry } from "./emitter/profile-emitter.js";
import { emitRegistry } from "./emitter/registry-emitter.js";
import { emitResource } from "./emitter/resource-emitter.js";
import { getAdapter } from "./emitter/schema/index.js";
import { buildPrimitiveRules } from "./emitter/schema/primitive-rules.js";
import {
  emitProfileSchema,
  emitProfileSchemaIndex,
  emitProfileSchemaRegistry,
} from "./emitter/schema/profile-schema-emitter.js";
import {
  emitDatatypeSchemas,
  emitResourceSchema,
  emitResourceSchemaIndex,
  emitSchemaRegistry,
  emitSchemaRootIndex,
} from "./emitter/schema/schema-emitter.js";
import { emitTerminologySchemas } from "./emitter/schema/terminology-schema-emitter.js";
import type { SearchParamBindingMap } from "./emitter/search-param-emitter.js";
import { emitSearchParams, emitSearchParamTypes } from "./emitter/search-param-emitter.js";
import { emitProfileSpec, emitResourceSpec, emitSpecIndex } from "./emitter/spec-emitter.js";
import { type BindingTypeMap, emitTerminology } from "./emitter/terminology-emitter.js";
import type { ExtensionModel } from "./model/extension-model.js";
import type { ProfileModel } from "./model/profile-model.js";
import type { ResourceModel, ResourceSearchParams } from "./model/resource-model.js";
import { isExtensionSD, parseExtension } from "./parser/extension.js";
import { parseProfile } from "./parser/profile.js";
import { parseSearchParameters } from "./parser/search-parameter.js";
import { parseStructureDefinition } from "./parser/structure-definition.js";
import { buildSpecCatalog } from "./spec/build-catalog.js";
import { makeTypeMapper } from "./spec/type-mapping.js";

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

export type ValidatorTarget = "zod" | "native";

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
  /** Emit Standard Schema-compatible runtime validators using the chosen library. */
  validator?: ValidatorTarget | undefined;
  /** Treat extensible bindings as closed enums in validators (default: open). */
  strictExtensible?: boolean | undefined;
  /**
   * Phase 6 follow-up — when emitting validators, also wire compiled FHIRPath
   * invariants from `ElementDefinition.constraint[*]` into the schemas via a
   * `.refine()` / `.superRefine()` pass. Adds `@fhir-dsl/fhirpath` as a
   * runtime dependency of the generated project. Default: `true` whenever
   * `validator` is set; pass `invariants: false` to skip.
   */
  invariants?: boolean | undefined;
  /**
   * Phase 8.8 — when set, emit an MCP server scaffold under this directory
   * containing `mcp.config.json` (resource list, IG reference) and a
   * `server.ts` shim that calls `@fhir-dsl/mcp`'s `createServer`. The
   * scaffold reads the upstream base URL from the FHIR_BASE_URL env var
   * at runtime so the generated artefacts stay portable.
   */
  mcpOutDir?: string | undefined;
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

  const catalog = buildSpecCatalog(spec, version);
  const mapper = makeTypeMapper(catalog);
  const primitiveRules = buildPrimitiveRules(catalog);

  // Parse StructureDefinitions
  let resourceModels: ResourceModel[] = [];
  const complexTypeModels: ResourceModel[] = [];
  for (const sd of spec.resourceDefinitions) {
    if (!isStructureDefinition(sd)) continue;
    if (sd.abstract) continue;
    if (!sd.snapshot?.element?.length) continue;

    if (sd.kind === "resource") {
      try {
        const model = parseStructureDefinition(sd as Parameters<typeof parseStructureDefinition>[0], catalog);
        resourceModels.push(model);
      } catch (err) {
        console.warn(`Failed to parse ${sd.name}: ${err}`);
      }
    } else if (sd.kind === "complex-type" && options.validator) {
      try {
        const model = parseStructureDefinition(sd as Parameters<typeof parseStructureDefinition>[0], catalog);
        complexTypeModels.push(model);
      } catch (err) {
        console.warn(`Failed to parse complex type ${sd.name}: ${err}`);
      }
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

  // Always regenerate primitives/datatypes from the per-version catalog.
  await writeFile(join(versionDir, "primitives.ts"), emitPrimitives(catalog), "utf-8");
  await writeFile(join(versionDir, "datatypes.ts"), emitDatatypes(catalog), "utf-8");

  // Emit search param types
  await writeFile(join(versionDir, "search-param-types.ts"), emitSearchParamTypes(), "utf-8");

  // --- Terminology resolution ---
  let bindingTypeMap: BindingTypeMap | undefined;
  let allResolvedValueSets: ResolvedValueSet[] = [];

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
    allResolvedValueSets = allResolved;
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
    const content = emitResource(model, mapper, bindingTypeMap);
    await writeFile(join(resourcesDir, fileName), content, "utf-8");
  }

  // Phase 5 — emit FHIR architectural-layer map.
  await writeFile(join(versionDir, "layers.ts"), emitLayers(resourceModels), "utf-8");

  // --- Schema (Standard Schema) generation ---
  if (options.validator) {
    const adapter = getAdapter(options.validator, primitiveRules);
    const schemasDir = join(versionDir, "schemas");
    const schemaResourcesDir = join(schemasDir, "resources");
    await mkdir(schemaResourcesDir, { recursive: true });

    // Optional runtime file (only native adapter emits one)
    const runtime = adapter.runtimeFile?.();
    if (runtime) {
      await writeFile(join(schemasDir, runtime.filename), runtime.source, "utf-8");
    }

    // Terminology schemas (enum consts per resolved ValueSet)
    const hasTerminology = Boolean(bindingTypeMap && bindingTypeMap.size > 0);
    if (bindingTypeMap && allResolvedValueSets.length > 0) {
      const terminologySource = emitTerminologySchemas(allResolvedValueSets, bindingTypeMap, adapter);
      await writeFile(join(schemasDir, "terminology.ts"), terminologySource, "utf-8");
    }

    // Datatype schemas (HumanName, Coding, etc.) — from parsed complex types
    const datatypeSource = emitDatatypeSchemas(complexTypeModels, adapter, {
      mapper,
      bindingTypeMap,
      strictExtensible: options.strictExtensible,
      invariants: options.invariants,
    });
    await writeFile(join(schemasDir, "datatypes.ts"), datatypeSource, "utf-8");
    const datatypeNames = new Set(complexTypeModels.map((m) => m.name));

    // Resource schemas
    for (const model of resourceModels) {
      const fileName = `${toKebabCase(model.name)}.schema.ts`;
      const content = emitResourceSchema(model, adapter, {
        mapper,
        bindingTypeMap,
        importedDatatypes: datatypeNames,
        strictExtensible: options.strictExtensible,
        invariants: options.invariants,
      });
      await writeFile(join(schemaResourcesDir, fileName), content, "utf-8");
    }

    await writeFile(join(schemaResourcesDir, "index.ts"), emitResourceSchemaIndex(resourceModels), "utf-8");

    // SchemaRegistry const (profiles added later if present — rewritten below)
    await writeFile(join(schemasDir, "schema-registry.ts"), emitSchemaRegistry(resourceModels, false), "utf-8");

    // Root schemas index (profiles block appended below if profiles exist)
    await writeFile(join(schemasDir, "index.ts"), emitSchemaRootIndex(hasTerminology, false), "utf-8");

    console.info(`Generated validator schemas (${adapter.name}) for ${resourceModels.length} resources`);
    if (options.invariants !== false) {
      console.info(
        "Validators include FHIRPath invariants — generated project must depend on @fhir-dsl/fhirpath. Pass --no-invariants to skip.",
      );
    }
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
  const resourceBaseTypes = new Map<string, string | undefined>();
  for (const m of resourceModels) resourceBaseTypes.set(m.name, m.baseType);
  await writeFile(
    join(versionDir, "search-params.ts"),
    emitSearchParams(filteredSearchParams, {
      commonSearchParams: catalog.commonSearchParams,
      resourceBaseTypes,
      searchParamBindingMap,
    }),
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

  // --- IG Profile + Extension Generation ---
  const igPackages = options.ig ?? [];
  const allProfiles: ProfileModel[] = [];
  const allExtensions: ExtensionModel[] = [];

  if (igPackages.length > 0) {
    const cache = cacheDir ?? join(outDir, ".cache");

    for (const igRef of igPackages) {
      const ig = await downloadIG(igRef, join(cache, "igs"));

      for (const sd of ig.profiles) {
        if (!isStructureDefinition(sd)) continue;
        try {
          const profile = parseProfile(sd as Parameters<typeof parseProfile>[0], ig.name, catalog);
          allProfiles.push(profile);
        } catch (err) {
          console.warn(`Failed to parse profile ${sd.name}: ${err}`);
        }
      }

      for (const sd of ig.extensions) {
        if (!isExtensionSD(sd)) continue;
        try {
          const ext = parseExtension(sd, ig.name, catalog);
          allExtensions.push(ext);
        } catch (err) {
          console.warn(`Failed to parse extension ${(sd as { name?: string }).name ?? "?"}: ${err}`);
        }
      }
    }

    if (allProfiles.length > 0) {
      const profilesDir = join(versionDir, "profiles");
      await mkdir(profilesDir, { recursive: true });

      // URL → typed extension class name. Lets profile slices that
      // point at a generated extension narrow from `Extension` to e.g.
      // `USCoreRaceExtension`. (#46)
      const extensionTypeMap = new Map(allExtensions.map((e) => [e.url, e.name]));

      for (const profile of allProfiles) {
        const fileName = `${toKebabCase(profile.name)}.ts`;
        await writeFile(join(profilesDir, fileName), emitProfile(profile, mapper, { extensionTypeMap }), "utf-8");
      }

      await writeFile(join(profilesDir, "index.ts"), emitProfileIndex(allProfiles), "utf-8");
      await writeFile(join(profilesDir, "profile-registry.ts"), emitProfileRegistry(allProfiles), "utf-8");

      // Profile schemas
      if (options.validator) {
        const adapter = getAdapter(options.validator, primitiveRules);
        const profileSchemasDir = join(versionDir, "schemas", "profiles");
        await mkdir(profileSchemasDir, { recursive: true });

        const profileDatatypeNames = new Set(complexTypeModels.map((m) => m.name));
        for (const profile of allProfiles) {
          const fileName = `${toKebabCase(profile.name)}.schema.ts`;
          const content = emitProfileSchema(profile, adapter, {
            mapper,
            bindingTypeMap,
            strictExtensible: options.strictExtensible,
            availableDatatypes: profileDatatypeNames,
          });
          await writeFile(join(profileSchemasDir, fileName), content, "utf-8");
        }

        await writeFile(join(profileSchemasDir, "index.ts"), emitProfileSchemaIndex(allProfiles), "utf-8");
        await writeFile(
          join(profileSchemasDir, "profile-schema-registry.ts"),
          emitProfileSchemaRegistry(allProfiles),
          "utf-8",
        );

        // Rewrite root schemas/index.ts + schema-registry.ts to include profiles
        const hasTerminology = Boolean(bindingTypeMap && bindingTypeMap.size > 0);
        await writeFile(join(versionDir, "schemas", "index.ts"), emitSchemaRootIndex(hasTerminology, true), "utf-8");
        await writeFile(
          join(versionDir, "schemas", "schema-registry.ts"),
          emitSchemaRegistry(resourceModels, true),
          "utf-8",
        );

        console.info(`Generated profile schemas for ${allProfiles.length} profiles`);
      }

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

    if (allExtensions.length > 0) {
      const extensionsDir = join(versionDir, "extensions");
      await mkdir(extensionsDir, { recursive: true });

      for (const ext of allExtensions) {
        const fileName = `${toKebabCase(ext.name)}.ts`;
        await writeFile(join(extensionsDir, fileName), emitExtension(ext, mapper), "utf-8");
      }

      await writeFile(join(extensionsDir, "index.ts"), emitExtensionIndex(allExtensions), "utf-8");
      await writeFile(join(extensionsDir, "extension-registry.ts"), emitExtensionRegistry(allExtensions), "utf-8");

      console.info(`Generated ${allExtensions.length} typed extensions`);
    }
  }

  // --- Phase 8.8: MCP server scaffold ---
  if (options.mcpOutDir) {
    await emitMcpScaffold({
      outDir: options.mcpOutDir,
      version,
      igRefs: igPackages,
      resourceTypes: resourceModels.map((r) => r.name),
    });
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

  // Emit typed client helper — wire schemas in when --validator was used
  await writeFile(join(versionDir, "client.ts"), emitClient(hasProfilesDir, Boolean(options.validator)), "utf-8");

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

interface McpScaffoldOptions {
  outDir: string;
  version: string;
  igRefs: readonly string[];
  resourceTypes: readonly string[];
}

async function emitMcpScaffold(opts: McpScaffoldOptions): Promise<void> {
  await mkdir(opts.outDir, { recursive: true });

  const config = {
    version: opts.version,
    igRefs: [...opts.igRefs],
    resourceTypes: [...opts.resourceTypes].sort(),
    writes: [] as string[],
    confirmWrites: true,
    dryRun: false,
    defaultSearchCount: 20,
    maxResponseBytes: 65536,
  };
  await writeFile(join(opts.outDir, "mcp.config.json"), `${JSON.stringify(config, null, 2)}\n`, "utf-8");

  const serverContents = `import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createServer, JsonLogAuditSink, stdioTransport } from "@fhir-dsl/mcp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(resolve(__dirname, "mcp.config.json"), "utf-8"));

const baseUrl = process.env.FHIR_BASE_URL;
if (!baseUrl) {
  console.error("Set FHIR_BASE_URL to the upstream FHIR endpoint before launching the MCP server.");
  process.exit(1);
}

const token = process.env.FHIR_TOKEN;

const server = createServer({
  name: "${opts.igRefs[0]?.replace(/[@/]/g, "-") ?? `fhir-${opts.version}`}-mcp",
  version: "0.1.0",
  baseUrl,
  resourceTypes: config.resourceTypes,
  audit: new JsonLogAuditSink(),
  ...(config.writes && config.writes.length > 0 ? { writes: config.writes } : {}),
  ...(config.confirmWrites ? { confirmWrites: true } : {}),
  ...(config.dryRun ? { dryRun: true } : {}),
  ...(config.defaultSearchCount !== undefined ? { defaultSearchCount: config.defaultSearchCount } : {}),
  ...(config.maxResponseBytes !== undefined ? { maxResponseBytes: config.maxResponseBytes } : {}),
  ...(token ? { auth: { kind: "bearer" as const, token } } : {}),
});

console.error(\`[fhir-dsl-mcp] starting stdio server for \${baseUrl} (\${config.resourceTypes.length} resource type(s))\`);
await server.listen(stdioTransport());
`;
  await writeFile(join(opts.outDir, "server.ts"), serverContents, "utf-8");

  const readme = `# Generated FHIR MCP server

This directory was emitted by \`fhir-gen generate --mcp <out>\` and is
ready to launch as an MCP stdio server.

## Run

\`\`\`sh
FHIR_BASE_URL=https://your-fhir-server/baseR${opts.version.replace(/^r/i, "").toUpperCase()} \\
FHIR_TOKEN=optional-bearer-token \\
node --experimental-strip-types server.ts
\`\`\`

(or compile \`server.ts\` to JS first if your runtime doesn't support
type stripping).

## Configuration

\`mcp.config.json\` controls the resource surface, write gating, and
token-economy defaults. Edit it to:

- Add a \`writes\` whitelist (e.g. \`["create", "update"]\`) to expose
  write tools.
- Tighten or relax \`maxResponseBytes\` and \`defaultSearchCount\`.
- Disable \`confirmWrites\` if your agent doesn't need explicit
  confirmation on every write.

## IGs bound

${opts.igRefs.length > 0 ? opts.igRefs.map((r) => `- \`${r}\``).join("\n") : `_(no IGs — base FHIR ${opts.version})_`}
`;
  await writeFile(join(opts.outDir, "README.md"), readme, "utf-8");

  console.info(`Generated MCP scaffold in ${opts.outDir}`);
}

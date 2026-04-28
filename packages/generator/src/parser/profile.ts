import { capitalizeFirst, fhirPathToPropertyName } from "@fhir-dsl/utils";
import type { DiscriminatorRule, DiscriminatorType, ProfileModel, SliceModel } from "../model/profile-model.js";
import type { PropertyModel, TypeRef } from "../model/resource-model.js";
import type { SpecCatalog } from "../spec/catalog.js";

interface FhirTypeRef {
  code: string;
  targetProfile?: string[] | undefined;
  profile?: string[] | undefined;
}

interface FhirSlicingDiscriminator {
  type: DiscriminatorType;
  path: string;
}

interface FhirSlicing {
  discriminator?: FhirSlicingDiscriminator[] | undefined;
  rules?: "open" | "closed" | "openAtEnd" | undefined;
  ordered?: boolean | undefined;
}

interface FhirElementDefinition {
  id?: string | undefined;
  path: string;
  sliceName?: string | undefined;
  slicing?: FhirSlicing | undefined;
  min?: number | undefined;
  max?: string | undefined;
  type?: FhirTypeRef[] | undefined;
  short?: string | undefined;
  definition?: string | undefined;
  mustSupport?: boolean | undefined;
  fixedCode?: string | undefined;
  fixedUri?: string | undefined;
  fixedString?: string | undefined;
  patternCodeableConcept?: unknown | undefined;
  binding?: { strength?: string | undefined; valueSet?: string | undefined } | undefined;
}

interface FhirProfileSD {
  resourceType: "StructureDefinition";
  url: string;
  name: string;
  title?: string | undefined;
  type: string;
  baseDefinition: string;
  derivation: "constraint";
  abstract: boolean;
  kind: string;
  snapshot?: { element: FhirElementDefinition[] } | undefined;
  differential?: { element: FhirElementDefinition[] } | undefined;
}

export function parseProfile(sd: FhirProfileSD, igName: string, catalog: SpecCatalog): ProfileModel {
  const basePropsSet =
    catalog.baseProperties.get("DomainResource") ?? catalog.baseProperties.get("Resource") ?? new Set<string>();
  // Always use sd.type for the base resource type — it's the root FHIR resource (e.g., "Observation")
  // even when baseDefinition points to another profile
  const baseResourceType = sd.type;
  const elements = sd.differential?.element ?? sd.snapshot?.element ?? [];
  const rootPath = sd.type;

  // First pass: build a map of `path → discriminator[]` from slicing parents,
  // so slice instances declared later (or in any order) can pick up their
  // discriminator rules without a second sort. Slicing parents look like:
  //   { path: "Patient.extension", slicing: { discriminator: [...] } }
  const discriminatorByPath = new Map<string, DiscriminatorRule[]>();
  for (const element of elements) {
    if (!element.slicing?.discriminator) continue;
    const rules: DiscriminatorRule[] = element.slicing.discriminator.map((d) => ({
      type: d.type,
      path: d.path,
    }));
    discriminatorByPath.set(element.path, rules);
  }

  // Only look at direct children constraints (not nested backbone elements for now)
  const constrainedProperties: PropertyModel[] = [];
  const slices: SliceModel[] = [];
  const seenNames = new Set<string>();
  const seenSliceKeys = new Set<string>();

  for (const element of elements) {
    // Skip the root element
    if (element.path === rootPath) continue;

    // Only direct children (no dots after the resource type prefix)
    const suffix = element.path.slice(rootPath.length + 1);
    if (suffix.includes(".")) continue;

    // Detect slice instances. The id form is `Resource.prop:sliceName`,
    // but FHIR also allows the slice name to live on `element.sliceName`
    // alone, and a few profiles encode it directly in `path`. Any of the
    // three signals counts.
    const sliceFromId = parseSliceFromId(element.id, rootPath);
    const sliceFromPath = parseSliceFromId(element.path, rootPath);
    const sliceName = element.sliceName ?? sliceFromId?.sliceName ?? sliceFromPath?.sliceName;
    if (sliceName) {
      const basePropPath = sliceFromId?.basePath ?? sliceFromPath?.basePath ?? element.path;
      const basePropName = fhirPathToPropertyName(basePropPath);
      const sanitized = sanitizeSliceName(sliceName);
      const key = `${basePropName}:${sanitized}`;
      if (seenSliceKeys.has(key)) continue;
      seenSliceKeys.add(key);

      const types: TypeRef[] = (element.type ?? []).map((t) => fhirTypeRefToTypeRef(t, catalog));
      const extensionUrl = extensionUrlFromTypes(element.type ?? []);
      const discriminator = discriminatorByPath.get(basePropPath) ?? [];

      slices.push({
        basePropName,
        sliceName,
        sanitizedName: sanitized,
        min: element.min ?? 0,
        max: element.max ?? "1",
        types,
        discriminator,
        extensionUrl,
        description: element.short,
      });
      continue;
    }

    // Pure slicing-parent declarations carry no constrained properties of
    // their own — they exist solely to host `.slicing.discriminator`.
    if (element.slicing && !sliceName) continue;

    const propName = fhirPathToPropertyName(element.path);

    // Skip base inherited properties unless they're being constrained with min > 0
    if (basePropsSet.has(propName) && !(element.min && element.min > 0)) continue;

    // Build types list, filtering out Reference-only types (profile URL narrowing
    // produces Reference<"us-core-patient"> which isn't assignable to Reference<"Patient">)
    const rawTypes: TypeRef[] = (element.type ?? []).map((t) => fhirTypeRefToTypeRef(t, catalog));
    const types = rawTypes.filter((t) => t.code !== "Reference");

    // Skip properties with no usable types — they just inherit from the base interface
    if (types.length === 0) continue;

    // Avoid duplicate property names
    if (seenNames.has(propName)) continue;
    seenNames.add(propName);

    const isChoiceType = element.path.endsWith("[x]");
    if (isChoiceType) {
      // For choice types in profiles, they often narrow to fewer types
      const baseName = propName.replace("[x]", "");
      for (const type of types) {
        const code = catalog.fhirpathSystemTypes.get(type.code) ?? type.code;
        const choiceName = baseName + capitalizeFirst(code);
        if (seenNames.has(choiceName)) continue;
        seenNames.add(choiceName);
        constrainedProperties.push({
          name: choiceName,
          types: [type],
          isRequired: (element.min ?? 0) > 0,
          isArray: element.max === "*",
          isChoiceType: true,
          description: element.short,
        });
      }
      continue;
    }

    // For non-choice properties: only emit if the property has non-Reference types
    // and the profile makes it required (min > 0). Don't re-emit optional properties
    // since we can't guarantee they're compatible with the base type's required status.
    const isRequired = (element.min ?? 0) > 0;
    if (!isRequired) continue;

    constrainedProperties.push({
      name: propName,
      types,
      isRequired: true,
      isArray: element.max === "*" || (element.max !== undefined && Number.parseInt(element.max, 10) > 1),
      isChoiceType: false,
      description: element.short,
    });
  }

  const slug = deriveSlug(sd.name, sd.url, igName);

  return {
    name: sanitizeName(sd.name),
    url: sd.url,
    baseResourceType,
    slug,
    igName,
    constrainedProperties,
    slices,
    description: sd.title ?? sd.name,
  };
}

function parseSliceFromId(id: string | undefined, rootPath: string): { basePath: string; sliceName: string } | null {
  if (!id) return null;
  // Slice ids look like `Patient.extension:race` or
  // `Observation.component:systolic`. Reject ids without a colon, and ids
  // whose colon falls inside a deeper path (we only do top-level slices).
  const prefix = `${rootPath}.`;
  if (!id.startsWith(prefix)) return null;
  const tail = id.slice(prefix.length);
  const colonIdx = tail.indexOf(":");
  if (colonIdx === -1) return null;
  // Reject nested slices: `extension:race.value`
  const after = tail.slice(colonIdx + 1);
  if (after.includes(".")) return null;
  const baseProp = tail.slice(0, colonIdx);
  if (baseProp.includes(".")) return null;
  return { basePath: `${rootPath}.${baseProp}`, sliceName: after };
}

function sanitizeSliceName(name: string): string {
  // Normalise to camelCase so `us-core-race` and `usCoreRace` both emit
  // `extension_usCoreRace`. The leading character is lowercased — slice
  // names are conceptually identifiers, not type names.
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length === 0) return "slice";
  const [head, ...rest] = parts;
  return [head!.toLowerCase(), ...rest.map(capitalizeFirst)].join("");
}

function extensionUrlFromTypes(types: FhirTypeRef[]): string | undefined {
  for (const t of types) {
    if (t.code === "Extension" && t.profile?.length) {
      const url = t.profile[0];
      if (url) return url;
    }
  }
  return undefined;
}

function fhirTypeRefToTypeRef(fhirType: FhirTypeRef, catalog: SpecCatalog): TypeRef {
  const code = catalog.fhirpathSystemTypes.get(fhirType.code) ?? fhirType.code;
  // For Reference targets, extract a clean resource type name
  // Profile URLs like ".../us-core-patient" should resolve to "Patient" (the resource type)
  // but we can't always know that mapping. Use the last segment and let the emitter handle it.
  const targets = fhirType.targetProfile?.map(extractResourceTypeName);
  return {
    code,
    targetProfiles: targets?.length ? targets : undefined,
  };
}

function extractTypeName(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1]!;
}

function extractResourceTypeName(url: string): string {
  const name = extractTypeName(url);
  // If it looks like a base FHIR resource type (PascalCase), use it directly
  if (/^[A-Z][a-zA-Z]+$/.test(name)) return name;
  // For profile URLs (e.g., "us-core-patient"), just use the raw name
  // The emitter will use it as a string literal in Reference<"...">
  return name;
}

function sanitizeName(name: string): string {
  // Remove spaces, hyphens, etc. and ensure PascalCase
  return name.replace(/[^a-zA-Z0-9]/g, "");
}

function deriveSlug(name: string, url: string, _igName: string): string {
  // Try to derive a short, readable slug from the profile name
  // e.g., "USCorePatientProfile" -> "us-core-patient"
  // e.g., "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient" -> "us-core-patient"
  const urlParts = url.split("/");
  const lastSegment = urlParts[urlParts.length - 1]!;

  // If the URL has a good slug (common for HL7 IGs), use it
  if (lastSegment && /^[a-z][a-z0-9-]*$/.test(lastSegment)) {
    return lastSegment;
  }

  // Fall back to converting the name to kebab-case
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

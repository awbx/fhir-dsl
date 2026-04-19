import { capitalizeFirst, fhirPathToPropertyName } from "@fhir-dsl/utils";
import type { ProfileModel } from "../model/profile-model.js";
import type { PropertyModel, TypeRef } from "../model/resource-model.js";
import type { SpecCatalog } from "../spec/catalog.js";

interface FhirTypeRef {
  code: string;
  targetProfile?: string[] | undefined;
  profile?: string[] | undefined;
}

interface FhirElementDefinition {
  id?: string | undefined;
  path: string;
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

  // Only look at direct children constraints (not nested backbone elements for now)
  const constrainedProperties: PropertyModel[] = [];
  const seenNames = new Set<string>();

  for (const element of elements) {
    // Skip the root element
    if (element.path === rootPath) continue;

    // Only direct children (no dots after the resource type prefix)
    const suffix = element.path.slice(rootPath.length + 1);
    if (suffix.includes(".")) continue;

    // Skip sliced elements (e.g., "component:systolic") — they share the same property name
    if (suffix.includes(":")) continue;

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
    description: sd.title ?? sd.name,
  };
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

import { capitalizeFirst } from "@fhir-dsl/utils";
import type { ExtensionModel } from "../model/extension-model.js";
import type { TypeRef } from "../model/resource-model.js";
import type { SpecCatalog } from "../spec/catalog.js";

interface FhirTypeRef {
  code: string;
  targetProfile?: string[] | undefined;
  profile?: string[] | undefined;
}

interface FhirElementDefinition {
  id?: string | undefined;
  path: string;
  sliceName?: string | undefined;
  min?: number | undefined;
  max?: string | undefined;
  type?: FhirTypeRef[] | undefined;
  short?: string | undefined;
  fixedUri?: string | undefined;
}

interface FhirExtensionSD {
  resourceType: "StructureDefinition";
  url: string;
  name: string;
  title?: string | undefined;
  type: "Extension";
  baseDefinition: string;
  derivation: "constraint";
  abstract: boolean;
  kind: "complex-type";
  snapshot?: { element: FhirElementDefinition[] } | undefined;
  differential?: { element: FhirElementDefinition[] } | undefined;
}

export function isExtensionSD(value: unknown): value is FhirExtensionSD {
  if (value == null || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    r.resourceType === "StructureDefinition" &&
    r.type === "Extension" &&
    r.derivation === "constraint" &&
    r.kind === "complex-type"
  );
}

export function parseExtension(sd: FhirExtensionSD, igName: string, catalog: SpecCatalog): ExtensionModel {
  const elements = sd.differential?.element ?? sd.snapshot?.element ?? [];

  // The narrowed value[x] sits on `Extension.value[x]` (or `Extension.valueX`
  // when slicing has already collapsed the choice). Complex extensions
  // instead constrain `Extension.extension:slicename` and never
  // populate value[x] — we detect that case by counting non-empty value
  // type lists.
  let valueTypes: TypeRef[] = [];
  let hasSubExtensions = false;

  for (const element of elements) {
    if (element.path === "Extension.value[x]") {
      valueTypes = (element.type ?? []).map((t) => fhirTypeRefToTypeRef(t, catalog));
      continue;
    }
    if (element.path?.startsWith("Extension.extension") && element.sliceName) {
      hasSubExtensions = true;
    }
  }

  return {
    name: sanitizeExtensionName(sd.name),
    url: sd.url,
    igName,
    description: sd.title ?? sd.name,
    valueTypes,
    isComplex: hasSubExtensions && valueTypes.length === 0,
  };
}

function fhirTypeRefToTypeRef(fhirType: FhirTypeRef, catalog: SpecCatalog): TypeRef {
  const code = catalog.fhirpathSystemTypes.get(fhirType.code) ?? fhirType.code;
  const targets = fhirType.targetProfile?.map(extractTypeName);
  return {
    code,
    targetProfiles: targets?.length ? targets : undefined,
  };
}

function extractTypeName(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1] ?? url;
}

function sanitizeExtensionName(name: string): string {
  // SD names look like `USCoreRace`, `USCoreRaceExtension`, or
  // `us-core-race`. Preserve runs that already mix case (likely PascalCase
  // identifiers from HL7 SDs) and only normalise pure-lowercase tokens
  // separated by punctuation.
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length === 0) return "AnonymousExtension";
  const pascal = parts.map((p) => (/[A-Z]/.test(p) ? p : capitalizeFirst(p.toLowerCase()))).join("");
  return pascal.endsWith("Extension") ? pascal : `${pascal}Extension`;
}

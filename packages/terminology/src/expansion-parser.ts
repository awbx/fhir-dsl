import type { ResolvedCode, ResolvedValueSet } from "./model.js";

interface FhirExpansionContains {
  system?: string;
  code?: string;
  display?: string;
  abstract?: boolean;
  inactive?: boolean;
  contains?: FhirExpansionContains[];
}

interface FhirValueSetExpansion {
  resourceType: "ValueSet";
  url?: string;
  name?: string;
  version?: string;
  expansion?: {
    timestamp?: string;
    contains?: FhirExpansionContains[];
  };
}

function isExpandedValueSet(value: unknown): value is FhirValueSetExpansion {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.resourceType === "ValueSet" && typeof record.expansion === "object" && record.expansion !== null;
}

function flattenContains(contains: FhirExpansionContains[]): ResolvedCode[] {
  const codes: ResolvedCode[] = [];
  for (const entry of contains) {
    if (entry.code && !entry.abstract) {
      codes.push({
        code: entry.code,
        display: entry.display,
        system: entry.system,
      });
    }
    if (entry.contains?.length) {
      codes.push(...flattenContains(entry.contains));
    }
  }
  return codes;
}

export function parseExpansion(resource: unknown): ResolvedValueSet | undefined {
  if (!isExpandedValueSet(resource)) return undefined;
  if (!resource.expansion?.contains?.length) return undefined;

  return {
    url: resource.url ?? "",
    name: resource.name ?? "",
    version: resource.version,
    codes: flattenContains(resource.expansion.contains),
    isComplete: true,
  };
}

export function parseExpansionsBundle(bundle: unknown): Map<string, ResolvedValueSet> {
  const result = new Map<string, ResolvedValueSet>();

  const entries = extractBundleEntries(bundle);
  for (const entry of entries) {
    const resolved = parseExpansion(entry);
    if (resolved?.url && resolved.codes.length > 0) {
      result.set(resolved.url, resolved);
    }
  }

  return result;
}

function extractBundleEntries(bundle: unknown): unknown[] {
  if (typeof bundle !== "object" || bundle === null) return [];
  const record = bundle as Record<string, unknown>;
  if (record.resourceType === "Bundle" && Array.isArray(record.entry)) {
    return (record.entry as unknown[])
      .filter((e) => typeof e === "object" && e !== null && "resource" in (e as Record<string, unknown>))
      .map((e) => (e as Record<string, unknown>).resource);
  }
  return [];
}

import type { CodeSystemModel, ResolvedValueSet } from "./model.js";
import { resolveCompose } from "./valueset-parser.js";

export function resolveValueSet(
  valueSetResource: unknown,
  expansions: Map<string, ResolvedValueSet>,
  codeSystems: Map<string, CodeSystemModel>,
): ResolvedValueSet | undefined {
  // Extract URL from the resource
  const url = extractUrl(valueSetResource);
  if (!url) return undefined;

  // Strategy 1: use pre-expanded version if available
  const expanded = findExpansion(url, expansions);
  if (expanded) return expanded;

  // Strategy 2: resolve compose rules from the ValueSet itself
  return resolveCompose(valueSetResource, codeSystems);
}

function extractUrl(resource: unknown): string | undefined {
  if (typeof resource !== "object" || resource === null) return undefined;
  const record = resource as Record<string, unknown>;
  return typeof record.url === "string" ? record.url : undefined;
}

function findExpansion(url: string, expansions: Map<string, ResolvedValueSet>): ResolvedValueSet | undefined {
  // Try exact match first
  const exact = expansions.get(url);
  if (exact) return exact;

  // Try without version suffix (e.g., "url|4.0.1" → "url")
  const pipeIdx = url.indexOf("|");
  if (pipeIdx > 0) {
    return expansions.get(url.slice(0, pipeIdx));
  }

  return undefined;
}

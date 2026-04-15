import type { Bundle, Resource } from "@fhir-dsl/types";

export interface SearchResult<Primary extends Resource, Included extends Resource = never> {
  data: Primary[];
  included: [Included] extends [never] ? [] : Included[];
  total?: number;
  hasNext: boolean;
  nextUrl?: string;
  raw: Bundle;
}

export function unwrapBundle<Primary extends Resource, Included extends Resource = never>(
  bundle: Bundle,
): SearchResult<Primary, Included> {
  const entries = bundle.entry ?? [];
  const data: Primary[] = [];
  const included: Resource[] = [];

  for (const entry of entries) {
    if (!entry.resource) continue;
    if (entry.search?.mode === "include") {
      included.push(entry.resource);
    } else {
      data.push(entry.resource as Primary);
    }
  }

  const nextLink = bundle.link?.find((l) => l.relation === "next");

  return {
    data,
    included: included as any,
    total: bundle.total,
    hasNext: !!nextLink,
    nextUrl: nextLink?.url,
    raw: bundle,
  };
}

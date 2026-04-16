import type { CodeSystemModel, ResolvedCode } from "./model.js";

interface FhirConcept {
  code?: string;
  display?: string;
  definition?: string;
  concept?: FhirConcept[];
}

interface FhirCodeSystem {
  resourceType: "CodeSystem";
  url?: string;
  name?: string;
  content?: string;
  concept?: FhirConcept[];
}

function isCodeSystem(value: unknown): value is FhirCodeSystem {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.resourceType === "CodeSystem";
}

function flattenConcepts(concepts: FhirConcept[]): ResolvedCode[] {
  const result: ResolvedCode[] = [];
  for (const concept of concepts) {
    if (concept.code) {
      result.push({
        code: concept.code,
        display: concept.display,
      });
    }
    if (concept.concept?.length) {
      result.push(...flattenConcepts(concept.concept));
    }
  }
  return result;
}

export function parseCodeSystem(resource: unknown): CodeSystemModel | undefined {
  if (!isCodeSystem(resource)) return undefined;

  const content = normalizeContent(resource.content);

  return {
    url: resource.url ?? "",
    name: resource.name ?? "",
    content,
    concepts: content === "complete" && resource.concept?.length ? flattenConcepts(resource.concept) : [],
  };
}

function normalizeContent(
  value: string | undefined,
): "complete" | "not-present" | "example" | "fragment" | "supplement" {
  switch (value) {
    case "complete":
    case "not-present":
    case "example":
    case "fragment":
    case "supplement":
      return value;
    default:
      return "not-present";
  }
}

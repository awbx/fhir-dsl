import type { CodeSystemModel, ConceptNode, ResolvedCode } from "./model.js";

interface FhirDesignation {
  language?: string;
  use?: { code?: string };
  value?: string;
}

interface FhirConceptProperty {
  code?: string;
  valueCode?: string;
  valueString?: string;
  valueInteger?: number;
  valueBoolean?: boolean;
}

interface FhirConcept {
  code?: string;
  display?: string;
  definition?: string;
  concept?: FhirConcept[];
  designation?: FhirDesignation[];
  property?: FhirConceptProperty[];
}

interface FhirCodeSystem {
  resourceType: "CodeSystem";
  url?: string;
  name?: string;
  content?: string;
  concept?: FhirConcept[];
  hierarchyMeaning?: string;
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

/**
 * Phase 3.2 — collects ConceptNodes (hierarchy + properties + designations)
 * by walking the nested concept tree. Implicit parents come from the
 * outer `concept.concept` nesting; explicit parents come from
 * `property[code=parent]`. Children are derived after the full pass.
 */
function buildNodes(concepts: FhirConcept[]): ConceptNode[] {
  const nodes: ConceptNode[] = [];
  const childrenOf = new Map<string, string[]>();

  function visit(concept: FhirConcept, implicitParent: string | undefined): void {
    if (!concept.code) {
      for (const child of concept.concept ?? []) visit(child, implicitParent);
      return;
    }
    const parents = new Set<string>();
    if (implicitParent) parents.add(implicitParent);
    for (const p of concept.property ?? []) {
      if (p.code === "parent" && typeof p.valueCode === "string") parents.add(p.valueCode);
    }

    const properties: Record<string, string | number | boolean> = {};
    for (const p of concept.property ?? []) {
      if (!p.code || p.code === "parent") continue;
      const v = p.valueCode ?? p.valueString ?? p.valueInteger ?? p.valueBoolean;
      if (v !== undefined) properties[p.code] = v;
    }

    const designations =
      concept.designation
        ?.filter((d): d is FhirDesignation & { value: string } => typeof d.value === "string")
        .map((d) => ({ language: d.language, use: d.use?.code, value: d.value })) ?? [];

    for (const parent of parents) {
      const list = childrenOf.get(parent) ?? [];
      list.push(concept.code);
      childrenOf.set(parent, list);
    }

    const node: ConceptNode = { code: concept.code };
    if (concept.display !== undefined) node.display = concept.display;
    if (parents.size > 0) node.parents = [...parents];
    if (Object.keys(properties).length > 0) node.properties = properties;
    if (designations.length > 0) node.designations = designations;
    nodes.push(node);

    for (const child of concept.concept ?? []) visit(child, concept.code);
  }

  for (const top of concepts) visit(top, undefined);

  // Backfill children.
  return nodes.map((n) => {
    const kids = childrenOf.get(n.code);
    return kids?.length ? { ...n, children: kids } : n;
  });
}

/**
 * Walks the parents chain to determine subsumption. Returns true when
 * `descendant === ancestor` (reflexive) or when `descendant` has
 * `ancestor` somewhere in its transitive parent set.
 */
function makeIsA(nodes: readonly ConceptNode[]): (ancestor: string, descendant: string) => boolean {
  const byCode = new Map<string, ConceptNode>();
  for (const n of nodes) byCode.set(n.code, n);
  return (ancestor: string, descendant: string): boolean => {
    if (ancestor === descendant) return true;
    const stack = [...(byCode.get(descendant)?.parents ?? [])];
    const seen = new Set<string>();
    while (stack.length) {
      const cur = stack.pop();
      if (cur === undefined || seen.has(cur)) continue;
      seen.add(cur);
      if (cur === ancestor) return true;
      const node = byCode.get(cur);
      if (node?.parents?.length) stack.push(...node.parents);
    }
    return false;
  };
}

export function parseCodeSystem(resource: unknown): CodeSystemModel | undefined {
  if (!isCodeSystem(resource)) return undefined;

  const content = normalizeContent(resource.content);
  const hasConcepts = content === "complete" && resource.concept?.length;

  const concepts = hasConcepts ? flattenConcepts(resource.concept!) : [];
  const nodes = hasConcepts ? buildNodes(resource.concept!) : [];

  const model: CodeSystemModel = {
    url: resource.url ?? "",
    name: resource.name ?? "",
    content,
    concepts,
  };
  if (nodes.length > 0) {
    model.nodes = nodes;
    model.isA = makeIsA(nodes);
  }
  return model;
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

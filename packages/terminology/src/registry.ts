import { parseCodeSystem } from "./codesystem-parser.js";
import { parseExpansion } from "./expansion-parser.js";
import type { CodeSystemModel, ResolvedValueSet } from "./model.js";
import { resolveValueSet } from "./resolver.js";

export class TerminologyRegistry {
  readonly #codeSystems = new Map<string, CodeSystemModel>();
  readonly #expansions = new Map<string, ResolvedValueSet>();
  readonly #valueSets = new Map<string, unknown>(); // raw ValueSet resources
  readonly #resolved = new Map<string, ResolvedValueSet>(); // URL → resolved

  loadExpansions(entries: unknown[]): void {
    for (const entry of entries) {
      const resolved = parseExpansion(entry);
      if (resolved?.url && resolved.codes.length > 0) {
        this.#expansions.set(resolved.url, resolved);
      }
    }
  }

  loadCodeSystem(resource: unknown): void {
    const cs = parseCodeSystem(resource);
    if (cs?.url) {
      this.#codeSystems.set(cs.url, cs);
    }
  }

  loadValueSet(resource: unknown): void {
    if (typeof resource !== "object" || resource === null) return;
    const record = resource as Record<string, unknown>;
    if (typeof record.url === "string") {
      this.#valueSets.set(record.url, resource);
    }
  }

  resolveAll(): void {
    for (const [url, resource] of this.#valueSets) {
      const resolved = resolveValueSet(resource, this.#expansions, this.#codeSystems);
      if (resolved && resolved.codes.length > 0) {
        this.#resolved.set(url, resolved);
      }
    }

    // Also include expansions that weren't in valueSets (direct from expansions.json)
    for (const [url, expansion] of this.#expansions) {
      if (!this.#resolved.has(url)) {
        this.#resolved.set(url, expansion);
      }
    }
  }

  resolve(url: string): ResolvedValueSet | undefined {
    // Try exact match
    const exact = this.#resolved.get(url);
    if (exact) return exact;

    // Try without version suffix
    const pipeIdx = url.indexOf("|");
    if (pipeIdx > 0) {
      return this.#resolved.get(url.slice(0, pipeIdx));
    }

    return undefined;
  }

  get resolvedCount(): number {
    return this.#resolved.size;
  }

  get codeSystemCount(): number {
    return this.#codeSystems.size;
  }

  allResolved(): IterableIterator<ResolvedValueSet> {
    return this.#resolved.values();
  }
}

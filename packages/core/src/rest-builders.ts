import type { Bundle, Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import { type ExecuteOptions, mergePreferIntoQuery } from "./query-builder.js";
import type { Executor } from "./search-query-builder.js";
import type { FhirSchema } from "./types.js";

// --- vread (REST-VREAD-001) -----------------------------------------------

export interface VreadBuilder<S extends FhirSchema, RT extends string> {
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}

export class VreadBuilderImpl<S extends FhirSchema, RT extends string> implements VreadBuilder<S, RT> {
  readonly #executor: Executor;
  readonly #resourceType: RT;
  readonly #id: string;
  readonly #vid: string;

  constructor(executor: Executor, resourceType: RT, id: string, vid: string) {
    this.#executor = executor;
    this.#resourceType = resourceType;
    this.#id = id;
    this.#vid = vid;
  }

  compile(): CompiledQuery {
    return {
      method: "GET",
      path: `${this.#resourceType}/${this.#id}/_history/${this.#vid}`,
      params: [],
    };
  }

  async execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource> {
    const query = mergePreferIntoQuery(this.compile(), options?.prefer);
    return (await this.#executor(query, options?.signal)) as S["resources"][RT] & Resource;
  }
}

// --- history (REST-HIST-001) ----------------------------------------------

// REST.14: _history is a server-level history interaction at three scopes:
//   - instance: /<Type>/<id>/_history
//   - type:     /<Type>/_history
//   - system:   /_history
// Params are filter/paging knobs (_since, _at, _count, _list, _sort).
export interface HistoryParams {
  _since?: string;
  _at?: string;
  _count?: number;
  _list?: string;
  _sort?: string;
}

export interface HistoryBuilder {
  since(value: string | Date): HistoryBuilder;
  at(value: string): HistoryBuilder;
  count(n: number): HistoryBuilder;
  list(id: string): HistoryBuilder;
  sort(value: string): HistoryBuilder;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<Bundle>;
}

export type HistoryScope =
  | { kind: "system" }
  | { kind: "type"; resourceType: string }
  | { kind: "instance"; resourceType: string; id: string };

export class HistoryBuilderImpl implements HistoryBuilder {
  readonly #executor: Executor;
  readonly #scope: HistoryScope;
  readonly #params: HistoryParams;

  constructor(executor: Executor, scope: HistoryScope, params: HistoryParams = {}) {
    this.#executor = executor;
    this.#scope = scope;
    this.#params = params;
  }

  #with(params: HistoryParams): HistoryBuilder {
    return new HistoryBuilderImpl(this.#executor, this.#scope, { ...this.#params, ...params });
  }

  since(value: string | Date): HistoryBuilder {
    return this.#with({ _since: typeof value === "string" ? value : value.toISOString() });
  }

  at(value: string): HistoryBuilder {
    return this.#with({ _at: value });
  }

  count(n: number): HistoryBuilder {
    return this.#with({ _count: n });
  }

  list(id: string): HistoryBuilder {
    return this.#with({ _list: id });
  }

  sort(value: string): HistoryBuilder {
    return this.#with({ _sort: value });
  }

  compile(): CompiledQuery {
    const path = historyPath(this.#scope);
    const params: CompiledQuery["params"] = [];
    for (const [name, value] of Object.entries(this.#params)) {
      if (value === undefined) continue;
      params.push({ name, value: String(value) });
    }
    return { method: "GET", path, params };
  }

  async execute(options?: ExecuteOptions): Promise<Bundle> {
    const query = mergePreferIntoQuery(this.compile(), options?.prefer);
    return (await this.#executor(query, options?.signal)) as Bundle;
  }
}

function historyPath(scope: HistoryScope): string {
  if (scope.kind === "system") return "_history";
  if (scope.kind === "type") return `${scope.resourceType}/_history`;
  return `${scope.resourceType}/${scope.id}/_history`;
}

// --- capabilities (REST-CAP-001) ------------------------------------------

export interface CapabilitiesBuilder {
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<Resource>;
}

export class CapabilitiesBuilderImpl implements CapabilitiesBuilder {
  readonly #executor: Executor;

  constructor(executor: Executor) {
    this.#executor = executor;
  }

  compile(): CompiledQuery {
    return { method: "GET", path: "metadata", params: [] };
  }

  async execute(options?: ExecuteOptions): Promise<Resource> {
    const query = mergePreferIntoQuery(this.compile(), options?.prefer);
    return (await this.#executor(query, options?.signal)) as Resource;
  }
}

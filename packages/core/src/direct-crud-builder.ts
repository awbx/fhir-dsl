import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import type { ExecuteOptions } from "./query-builder.js";
import type { Executor } from "./search-query-builder.js";
import type { FhirSchema } from "./types.js";

function compileSearchString(
  search: string | Record<string, string | number | ReadonlyArray<string | number>>,
): string {
  if (typeof search === "string") return search;
  const pairs: string[] = [];
  for (const [name, value] of Object.entries(search)) {
    if (Array.isArray(value)) {
      pairs.push(`${encodeURIComponent(name)}=${value.map((v) => encodeURIComponent(String(v))).join(",")}`);
    } else {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  }
  return pairs.join("&");
}

// --- Create ---

export interface CreateBuilder<S extends FhirSchema, RT extends string> {
  /**
   * FHIR R5 §3.1.0.4: `If-None-Exist: <search>` — conditional create. Server
   * rejects with 412 when more than one match; returns the existing resource
   * with 200 when exactly one match.
   */
  ifNoneExist(search: string | Record<string, string | number | ReadonlyArray<string | number>>): CreateBuilder<S, RT>;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}

export class CreateBuilderImpl<S extends FhirSchema, RT extends string> implements CreateBuilder<S, RT> {
  readonly #executor: Executor;
  readonly #resource: Resource;
  readonly #ifNoneExist: string | undefined;

  constructor(executor: Executor, resource: Resource, ifNoneExist?: string) {
    this.#executor = executor;
    this.#resource = resource;
    this.#ifNoneExist = ifNoneExist;
  }

  ifNoneExist(search: string | Record<string, string | number | ReadonlyArray<string | number>>): CreateBuilder<S, RT> {
    return new CreateBuilderImpl<S, RT>(this.#executor, this.#resource, compileSearchString(search));
  }

  compile(): CompiledQuery {
    const headers: Record<string, string> = {};
    if (this.#ifNoneExist !== undefined) headers["If-None-Exist"] = this.#ifNoneExist;
    return {
      method: "POST",
      path: this.#resource.resourceType,
      params: [],
      body: this.#resource,
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    };
  }

  async execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource> {
    return (await this.#executor(this.compile(), options?.signal)) as S["resources"][RT] & Resource;
  }
}

// --- Update ---

export interface UpdateBuilder<S extends FhirSchema, RT extends string> {
  /** FHIR R5 §3.1.0.5: `If-Match: W/"<etag>"` — version-aware update. */
  ifMatch(etag: string): UpdateBuilder<S, RT>;
  /** FHIR R5 §3.1.0.5: `If-None-Match: *` — create-if-absent semantics on update. */
  ifNoneMatch(etag: string): UpdateBuilder<S, RT>;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}

export class UpdateBuilderImpl<S extends FhirSchema, RT extends string> implements UpdateBuilder<S, RT> {
  readonly #executor: Executor;
  readonly #resource: Resource & { id: string };
  readonly #ifMatch: string | undefined;
  readonly #ifNoneMatch: string | undefined;

  constructor(executor: Executor, resource: Resource & { id: string }, ifMatch?: string, ifNoneMatch?: string) {
    this.#executor = executor;
    this.#resource = resource;
    this.#ifMatch = ifMatch;
    this.#ifNoneMatch = ifNoneMatch;
  }

  ifMatch(etag: string): UpdateBuilder<S, RT> {
    return new UpdateBuilderImpl<S, RT>(this.#executor, this.#resource, etag, this.#ifNoneMatch);
  }

  ifNoneMatch(etag: string): UpdateBuilder<S, RT> {
    return new UpdateBuilderImpl<S, RT>(this.#executor, this.#resource, this.#ifMatch, etag);
  }

  compile(): CompiledQuery {
    const headers: Record<string, string> = {};
    if (this.#ifMatch !== undefined) headers["If-Match"] = this.#ifMatch;
    if (this.#ifNoneMatch !== undefined) headers["If-None-Match"] = this.#ifNoneMatch;
    return {
      method: "PUT",
      path: `${this.#resource.resourceType}/${this.#resource.id}`,
      params: [],
      body: this.#resource,
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    };
  }

  async execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource> {
    return (await this.#executor(this.compile(), options?.signal)) as S["resources"][RT] & Resource;
  }
}

// --- Delete ---

export interface DeleteBuilder {
  /** FHIR R5 §3.1.0.7: `If-Match` — version-aware delete. */
  ifMatch(etag: string): DeleteBuilder;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<void>;
}

export class DeleteBuilderImpl implements DeleteBuilder {
  readonly #executor: Executor;
  readonly #resourceType: string;
  readonly #id: string;
  readonly #ifMatch: string | undefined;

  constructor(executor: Executor, resourceType: string, id: string, ifMatch?: string) {
    this.#executor = executor;
    this.#resourceType = resourceType;
    this.#id = id;
    this.#ifMatch = ifMatch;
  }

  ifMatch(etag: string): DeleteBuilder {
    return new DeleteBuilderImpl(this.#executor, this.#resourceType, this.#id, etag);
  }

  compile(): CompiledQuery {
    const headers: Record<string, string> = {};
    if (this.#ifMatch !== undefined) headers["If-Match"] = this.#ifMatch;
    return {
      method: "DELETE",
      path: `${this.#resourceType}/${this.#id}`,
      params: [],
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    };
  }

  async execute(options?: ExecuteOptions): Promise<void> {
    await this.#executor(this.compile(), options?.signal);
  }
}

// --- Patch ---

export type PatchFormat = "json-patch" | "xml-patch" | "fhirpath-patch";

const PATCH_CONTENT_TYPES: Record<PatchFormat, string> = {
  "json-patch": "application/json-patch+json",
  "xml-patch": "application/xml-patch+xml",
  "fhirpath-patch": "application/fhir+json",
};

export interface PatchBuilder<S extends FhirSchema, RT extends string> {
  /** FHIR R5 §3.1.0.6: `If-Match` required by PATCH for version-aware updates. */
  ifMatch(etag: string): PatchBuilder<S, RT>;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}

export class PatchBuilderImpl<S extends FhirSchema, RT extends string> implements PatchBuilder<S, RT> {
  readonly #executor: Executor;
  readonly #resourceType: string;
  readonly #id: string;
  readonly #body: unknown;
  readonly #format: PatchFormat;
  readonly #ifMatch: string | undefined;

  constructor(
    executor: Executor,
    resourceType: string,
    id: string,
    body: unknown,
    format: PatchFormat,
    ifMatch?: string,
  ) {
    this.#executor = executor;
    this.#resourceType = resourceType;
    this.#id = id;
    this.#body = body;
    this.#format = format;
    this.#ifMatch = ifMatch;
  }

  ifMatch(etag: string): PatchBuilder<S, RT> {
    return new PatchBuilderImpl<S, RT>(this.#executor, this.#resourceType, this.#id, this.#body, this.#format, etag);
  }

  compile(): CompiledQuery {
    const headers: Record<string, string> = {
      "Content-Type": PATCH_CONTENT_TYPES[this.#format],
    };
    if (this.#ifMatch !== undefined) headers["If-Match"] = this.#ifMatch;
    const body = this.#format === "xml-patch" ? String(this.#body) : this.#body;
    return {
      method: "PATCH",
      path: `${this.#resourceType}/${this.#id}`,
      params: [],
      body,
      headers,
    };
  }

  async execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource> {
    return (await this.#executor(this.compile(), options?.signal)) as S["resources"][RT] & Resource;
  }
}

// --- Patch body types ---

export interface JsonPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: unknown;
  from?: string;
}

export type JsonPatchBody = ReadonlyArray<JsonPatchOperation>;

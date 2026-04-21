import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import { type ExecuteOptions, mergePreferIntoQuery, type ReadQueryBuilder } from "./query-builder.js";
import type { Executor } from "./search-query-builder.js";
import { type CompiledPath, makeT, type ReadTransformedQuery, type T } from "./transform.js";
import type { FhirSchema } from "./types.js";
import { resolveSchema, type SchemaRegistry, ValidationUnavailableError, validateOne } from "./validation.js";

export class ReadQueryBuilderImpl<S extends FhirSchema, RT extends string> implements ReadQueryBuilder<S, RT> {
  readonly #resourceType: string;
  readonly #id: string;
  readonly #executor: Executor;
  readonly #schemas: SchemaRegistry | undefined;
  readonly #validate: boolean;
  readonly #ifNoneMatch: string | undefined;
  readonly #ifModifiedSince: string | undefined;

  constructor(
    resourceType: string,
    id: string,
    executor: Executor,
    schemas?: SchemaRegistry,
    validate: boolean = false,
    ifNoneMatch?: string,
    ifModifiedSince?: string,
  ) {
    this.#resourceType = resourceType;
    this.#id = id;
    this.#executor = executor;
    this.#schemas = schemas;
    this.#validate = validate;
    this.#ifNoneMatch = ifNoneMatch;
    this.#ifModifiedSince = ifModifiedSince;
  }

  validate(): ReadQueryBuilder<S, RT> {
    if (!this.#schemas) throw new ValidationUnavailableError();
    return new ReadQueryBuilderImpl<S, RT>(
      this.#resourceType,
      this.#id,
      this.#executor,
      this.#schemas,
      true,
      this.#ifNoneMatch,
      this.#ifModifiedSince,
    );
  }

  ifNoneMatch(etag: string): ReadQueryBuilder<S, RT> {
    return new ReadQueryBuilderImpl<S, RT>(
      this.#resourceType,
      this.#id,
      this.#executor,
      this.#schemas,
      this.#validate,
      etag,
      this.#ifModifiedSince,
    );
  }

  ifModifiedSince(value: Date | string): ReadQueryBuilder<S, RT> {
    const formatted = typeof value === "string" ? value : value.toUTCString();
    return new ReadQueryBuilderImpl<S, RT>(
      this.#resourceType,
      this.#id,
      this.#executor,
      this.#schemas,
      this.#validate,
      this.#ifNoneMatch,
      formatted,
    );
  }

  $if(condition: boolean, callback: (qb: this) => this): this {
    return condition ? callback(this) : this;
  }

  $call<R>(callback: (qb: this) => R): R {
    return callback(this);
  }

  compile(): CompiledQuery {
    const headers: Record<string, string> = {};
    if (this.#ifNoneMatch !== undefined) headers["If-None-Match"] = this.#ifNoneMatch;
    if (this.#ifModifiedSince !== undefined) headers["If-Modified-Since"] = this.#ifModifiedSince;
    return {
      method: "GET",
      path: `${this.#resourceType}/${this.#id}`,
      params: [],
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    };
  }

  async execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource> {
    const query = mergePreferIntoQuery(this.compile(), options?.prefer);
    const resource = (await this.#executor(query, options?.signal)) as S["resources"][RT] & Resource;
    if (this.#validate) {
      if (!this.#schemas) throw new ValidationUnavailableError();
      const schema = resolveSchema(this.#schemas, this.#resourceType);
      await validateOne(schema, this.#resourceType, resource);
    }
    return resource;
  }

  transform<Out>(fn: (t: T<S["resources"][RT] & Resource>) => Out): ReadTransformedQuery<Out> {
    const executor = this.#executor;
    const schemas = this.#schemas;
    const validateFlag = this.#validate;
    const resourceType = this.#resourceType;
    const compile = this.compile.bind(this);

    return {
      async execute(options?: ExecuteOptions): Promise<Out> {
        const query = mergePreferIntoQuery(compile(), options?.prefer);
        const resource = (await executor(query, options?.signal)) as S["resources"][RT] & Resource;
        if (validateFlag) {
          if (!schemas) throw new ValidationUnavailableError();
          const schema = resolveSchema(schemas, resourceType);
          await validateOne(schema, resourceType, resource);
        }
        const pathCache = new Map<string, CompiledPath>();
        const t = makeT<S["resources"][RT] & Resource>(resource, new Set(), new Map(), pathCache);
        return fn(t);
      },
    };
  }
}

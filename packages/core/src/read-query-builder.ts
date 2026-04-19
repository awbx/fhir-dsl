import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import type { ExecuteOptions, ReadQueryBuilder } from "./query-builder.js";
import type { Executor } from "./search-query-builder.js";
import type { FhirSchema } from "./types.js";
import { resolveSchema, type SchemaRegistry, ValidationUnavailableError, validateOne } from "./validation.js";

export class ReadQueryBuilderImpl<S extends FhirSchema, RT extends string> implements ReadQueryBuilder<S, RT> {
  readonly #resourceType: string;
  readonly #id: string;
  readonly #executor: Executor;
  readonly #schemas: SchemaRegistry | undefined;
  readonly #validate: boolean;

  constructor(
    resourceType: string,
    id: string,
    executor: Executor,
    schemas?: SchemaRegistry,
    validate: boolean = false,
  ) {
    this.#resourceType = resourceType;
    this.#id = id;
    this.#executor = executor;
    this.#schemas = schemas;
    this.#validate = validate;
  }

  validate(): ReadQueryBuilder<S, RT> {
    if (!this.#schemas) throw new ValidationUnavailableError();
    return new ReadQueryBuilderImpl<S, RT>(this.#resourceType, this.#id, this.#executor, this.#schemas, true);
  }

  $if(condition: boolean, callback: (qb: this) => this): this {
    return condition ? callback(this) : this;
  }

  $call<R>(callback: (qb: this) => R): R {
    return callback(this);
  }

  compile(): CompiledQuery {
    return {
      method: "GET",
      path: `${this.#resourceType}/${this.#id}`,
      params: [],
    };
  }

  async execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource> {
    const query = this.compile();
    const resource = (await this.#executor(query, options?.signal)) as S["resources"][RT] & Resource;
    if (this.#validate) {
      if (!this.#schemas) throw new ValidationUnavailableError();
      const schema = resolveSchema(this.#schemas, this.#resourceType);
      await validateOne(schema, this.#resourceType, resource);
    }
    return resource;
  }
}

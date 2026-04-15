import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import type { ReadQueryBuilder } from "./query-builder.js";
import type { Executor } from "./search-query-builder.js";
import type { FhirSchema } from "./types.js";

export class ReadQueryBuilderImpl<S extends FhirSchema, RT extends string> implements ReadQueryBuilder<S, RT> {
  readonly #resourceType: string;
  readonly #id: string;
  readonly #executor: Executor;

  constructor(resourceType: string, id: string, executor: Executor) {
    this.#resourceType = resourceType;
    this.#id = id;
    this.#executor = executor;
  }

  compile(): CompiledQuery {
    return {
      method: "GET",
      path: `${this.#resourceType}/${this.#id}`,
      params: [],
    };
  }

  async execute(): Promise<S["resources"][RT] & Resource> {
    const query = this.compile();
    return (await this.#executor(query)) as S["resources"][RT] & Resource;
  }
}

import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import type { ReadQueryBuilder } from "./query-builder.js";
import type { Executor } from "./search-query-builder.js";

export class ReadQueryBuilderImpl<RM extends Record<string, any>, RT extends string>
  implements ReadQueryBuilder<RM, RT>
{
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

  async execute(): Promise<RM[RT] & Resource> {
    const query = this.compile();
    return (await this.#executor(query)) as RM[RT] & Resource;
  }
}

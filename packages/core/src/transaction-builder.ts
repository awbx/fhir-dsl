import type { Bundle, BundleEntry, Resource } from "@fhir-dsl/types";
import type { Executor } from "./search-query-builder.js";
import type { FhirSchema } from "./types.js";

// --- Transaction Entry Builder ---

interface TransactionEntry {
  resource?: Resource;
  request: {
    method: string;
    url: string;
  };
}

// --- Transaction Builder ---

export interface TransactionBuilder<S extends FhirSchema> {
  create<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S>;

  update<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S>;

  delete<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): TransactionBuilder<S>;

  compile(): Bundle;

  execute(): Promise<Bundle>;
}

// --- Transaction Builder Implementation ---

export class TransactionBuilderImpl<S extends FhirSchema> implements TransactionBuilder<S> {
  readonly #entries: TransactionEntry[];
  readonly #executor: Executor;

  constructor(executor: Executor, entries?: TransactionEntry[]) {
    this.#executor = executor;
    this.#entries = entries ?? [];
  }

  create<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S> {
    return new TransactionBuilderImpl<S>(this.#executor, [
      ...this.#entries,
      {
        resource,
        request: {
          method: "POST",
          url: resource.resourceType,
        },
      },
    ]);
  }

  update<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S> {
    const id = resource.id;
    if (!id) {
      throw new Error("Resource must have an id for update operations");
    }
    return new TransactionBuilderImpl<S>(this.#executor, [
      ...this.#entries,
      {
        resource,
        request: {
          method: "PUT",
          url: `${resource.resourceType}/${id}`,
        },
      },
    ]);
  }

  delete<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): TransactionBuilder<S> {
    return new TransactionBuilderImpl<S>(this.#executor, [
      ...this.#entries,
      {
        request: {
          method: "DELETE",
          url: `${resourceType}/${id}`,
        },
      },
    ]);
  }

  compile(): Bundle {
    return {
      resourceType: "Bundle",
      type: "transaction",
      entry: this.#entries.map((e) => ({
        resource: e.resource,
        request: {
          method: e.request.method,
          url: e.request.url,
        },
      })) as BundleEntry[],
    };
  }

  async execute(): Promise<Bundle> {
    const bundle = this.compile();
    return (await this.#executor({
      method: "POST",
      path: "",
      params: [],
      body: bundle,
    })) as Bundle;
  }
}

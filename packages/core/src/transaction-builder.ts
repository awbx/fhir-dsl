import type { Bundle, BundleEntry, Resource } from "@fhir-dsl/types";
import type { Executor } from "./search-query-builder.js";

// --- Transaction Entry Builder ---

interface TransactionEntry {
  resource?: Resource;
  request: {
    method: string;
    url: string;
  };
}

// --- Transaction Builder ---

export interface TransactionBuilder<RM extends Record<string, any>> {
  create<RT extends string & keyof RM>(resource: RM[RT] & Resource): TransactionBuilder<RM>;

  update<RT extends string & keyof RM>(resource: RM[RT] & Resource): TransactionBuilder<RM>;

  delete<RT extends string & keyof RM>(resourceType: RT, id: string): TransactionBuilder<RM>;

  compile(): Bundle;

  execute(): Promise<Bundle>;
}

// --- Transaction Builder Implementation ---

export class TransactionBuilderImpl<RM extends Record<string, any>> implements TransactionBuilder<RM> {
  readonly #entries: TransactionEntry[];
  readonly #executor: Executor;

  constructor(executor: Executor, entries?: TransactionEntry[]) {
    this.#executor = executor;
    this.#entries = entries ?? [];
  }

  create<RT extends string & keyof RM>(resource: RM[RT] & Resource): TransactionBuilder<RM> {
    return new TransactionBuilderImpl<RM>(this.#executor, [
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

  update<RT extends string & keyof RM>(resource: RM[RT] & Resource): TransactionBuilder<RM> {
    const id = resource.id;
    if (!id) {
      throw new Error("Resource must have an id for update operations");
    }
    return new TransactionBuilderImpl<RM>(this.#executor, [
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

  delete<RT extends string & keyof RM>(resourceType: RT, id: string): TransactionBuilder<RM> {
    return new TransactionBuilderImpl<RM>(this.#executor, [
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
          method: e.request.method as any,
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

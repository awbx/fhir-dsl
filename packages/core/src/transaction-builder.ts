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

type MutationBundleType = "transaction" | "batch";

// --- Transaction Builder ---

export interface TransactionBuilder<S extends FhirSchema> {
  create<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S>;

  update<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S>;

  delete<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): TransactionBuilder<S>;

  /** See {@link SearchQueryBuilder.$if}. */
  $if(condition: boolean, callback: (qb: this) => this): this;

  /** See {@link SearchQueryBuilder.$call}. */
  $call<R>(callback: (qb: this) => R): R;

  compile(): Bundle;

  execute(): Promise<Bundle>;
}

export interface BatchBuilder<S extends FhirSchema> {
  create<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): BatchBuilder<S>;

  update<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): BatchBuilder<S>;

  delete<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): BatchBuilder<S>;

  /** See {@link SearchQueryBuilder.$if}. */
  $if(condition: boolean, callback: (qb: this) => this): this;

  /** See {@link SearchQueryBuilder.$call}. */
  $call<R>(callback: (qb: this) => R): R;

  compile(): Bundle;

  execute(): Promise<Bundle>;
}

abstract class MutationBundleBuilderBase<S extends FhirSchema, TBuilder> {
  readonly #entries: TransactionEntry[];
  readonly #executor: Executor;
  readonly #bundleType: MutationBundleType;

  constructor(executor: Executor, bundleType: MutationBundleType, entries?: TransactionEntry[]) {
    this.#executor = executor;
    this.#bundleType = bundleType;
    this.#entries = entries ?? [];
  }

  protected abstract clone(entries: TransactionEntry[]): TBuilder;

  protected createEntry<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TBuilder {
    return this.clone([
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

  protected updateEntry<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TBuilder {
    const id = resource.id;
    if (!id) {
      throw new Error("Resource must have an id for update operations");
    }

    return this.clone([
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

  protected deleteEntry<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): TBuilder {
    return this.clone([
      ...this.#entries,
      {
        request: {
          method: "DELETE",
          url: `${resourceType}/${id}`,
        },
      },
    ]);
  }

  $if(condition: boolean, callback: (qb: this) => this): this {
    return condition ? callback(this) : this;
  }

  $call<R>(callback: (qb: this) => R): R {
    return callback(this);
  }

  compile(): Bundle {
    return {
      resourceType: "Bundle",
      type: this.#bundleType,
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

// --- Transaction Builder Implementation ---

export class TransactionBuilderImpl<S extends FhirSchema>
  extends MutationBundleBuilderBase<S, TransactionBuilder<S>>
  implements TransactionBuilder<S>
{
  readonly #executor: Executor;

  constructor(executor: Executor, entries?: TransactionEntry[]) {
    super(executor, "transaction", entries);
    this.#executor = executor;
  }

  protected clone(entries: TransactionEntry[]): TransactionBuilder<S> {
    return new TransactionBuilderImpl<S>(this.#executor, entries);
  }

  create<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S> {
    return this.createEntry(resource);
  }

  update<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): TransactionBuilder<S> {
    return this.updateEntry(resource);
  }

  delete<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): TransactionBuilder<S> {
    return this.deleteEntry(resourceType, id);
  }
}

export class BatchBuilderImpl<S extends FhirSchema>
  extends MutationBundleBuilderBase<S, BatchBuilder<S>>
  implements BatchBuilder<S>
{
  readonly #executor: Executor;

  constructor(executor: Executor, entries?: TransactionEntry[]) {
    super(executor, "batch", entries);
    this.#executor = executor;
  }

  protected clone(entries: TransactionEntry[]): BatchBuilder<S> {
    return new BatchBuilderImpl<S>(this.#executor, entries);
  }

  create<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): BatchBuilder<S> {
    return this.createEntry(resource);
  }

  update<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): BatchBuilder<S> {
    return this.updateEntry(resource);
  }

  delete<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): BatchBuilder<S> {
    return this.deleteEntry(resourceType, id);
  }
}

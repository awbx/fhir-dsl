import type { CompiledQuery, ExecuteOptions } from "@fhir-dsl/core";
import type { FhirDslError } from "@fhir-dsl/utils";
import { isFhirDslError } from "@fhir-dsl/utils";
import {
  mutationOptions as tsqMutationOptions,
  queryOptions as tsqQueryOptions,
  type UndefinedInitialDataOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

/**
 * Anything fhir-dsl exposes as a terminal builder shares this minimal shape:
 * a `compile()` that returns the wire-stable description and an `execute()`
 * that hits the network. The result `T` is preserved through both helpers
 * below, so consumers never lose type fidelity to `useQuery`/`useMutation`.
 */
export interface FhirQueryBuilder<T> {
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<T>;
}

/** Stable, JSON-comparable queryKey shape. Prefix lets consumers scope `invalidateQueries({ queryKey: ["fhir"] })`. */
export type FhirQueryKey = readonly [
  "fhir",
  string,
  string,
  ReadonlyArray<readonly [string, string | number, string | undefined, string | undefined]>,
];

/**
 * Build the QueryOptions object for a fhir-dsl terminal builder. Pass it
 * straight into `useQuery`, `useSuspenseQuery`, `prefetchQuery`, or
 * `queryClient.fetchQuery`.
 *
 * The error channel is typed as `FhirDslError` so `query.error` narrows
 * automatically — consumers can `switch (query.error?.kind)` without casts.
 *
 * @example
 *   const result = useQuery(queryOptions(fhir.read("Patient", id)));
 *   // result.data: Patient | undefined
 *   // result.error: FhirDslError | null
 */
export function queryOptions<T>(
  builder: FhirQueryBuilder<T>,
  overrides?: Omit<UndefinedInitialDataOptions<T, FhirDslError, T, FhirQueryKey>, "queryKey" | "queryFn">,
) {
  const compiled = builder.compile();
  return tsqQueryOptions<T, FhirDslError, T, FhirQueryKey>({
    queryKey: deriveQueryKey(compiled),
    queryFn: ({ signal }) => builder.execute(signal ? { signal } : undefined),
    ...overrides,
  });
}

/**
 * Build the MutationOptions object for a write-shaped builder. The factory is
 * called with the input each time the mutation runs.
 *
 * @example
 *   const m = useMutation(mutationOptions((p: Patient) => fhir.update(p)));
 *   m.mutate(patient);
 */
export function mutationOptions<TInput, TOutput>(
  factory: (input: TInput) => FhirQueryBuilder<TOutput>,
  overrides?: Omit<UseMutationOptions<TOutput, FhirDslError, TInput>, "mutationFn">,
) {
  return tsqMutationOptions<TOutput, FhirDslError, TInput>({
    mutationFn: (input: TInput) => factory(input).execute(),
    ...overrides,
  });
}

/**
 * Mutation factory for builders that don't need a per-call input
 * (e.g. `fhir.delete("Patient", id)` — the id is bound at builder-construction
 * time). Returns a no-arg mutation.
 */
export function mutationOptionsBound<TOutput>(
  builder: FhirQueryBuilder<TOutput>,
  overrides?: Omit<UseMutationOptions<TOutput, FhirDslError, void>, "mutationFn">,
) {
  return tsqMutationOptions<TOutput, FhirDslError, void>({
    mutationFn: () => builder.execute(),
    ...overrides,
  });
}

/** Re-exported so consumers don't need a second import for the standard catch pattern. */
export { isFhirDslError };

// --- Internals ---------------------------------------------------------------

function deriveQueryKey(compiled: CompiledQuery): FhirQueryKey {
  const params = (compiled.params ?? [])
    .map((p) => [p.name, p.value, p.prefix, p.modifier] as const)
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return ["fhir", compiled.method, compiled.path, params] as const;
}

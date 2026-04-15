import type { Bundle, Resource } from "@fhir-dsl/types";
import type { FhirExecutor } from "./executor.js";

export async function* paginate<T extends Resource>(
  executor: FhirExecutor,
  firstBundle: Bundle,
): AsyncGenerator<T[], void, undefined> {
  let bundle: Bundle | undefined = firstBundle;

  while (bundle) {
    const entries = bundle.entry ?? [];
    const resources = entries.filter((e) => e.resource !== undefined).map((e) => e.resource as T);

    if (resources.length > 0) {
      yield resources;
    }

    const nextLink = bundle.link?.find((l) => l.relation === "next");
    if (nextLink?.url) {
      bundle = (await executor.executeUrl(nextLink.url)) as Bundle;
    } else {
      bundle = undefined;
    }
  }
}

export async function fetchAllPages<T extends Resource>(executor: FhirExecutor, firstBundle: Bundle): Promise<T[]> {
  const all: T[] = [];
  for await (const page of paginate<T>(executor, firstBundle)) {
    all.push(...page);
  }
  return all;
}

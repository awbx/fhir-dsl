import type { Bundle, Resource } from "@fhir-dsl/types";
import type { FhirExecutor } from "./executor.js";

export async function* paginate<T extends Resource>(
  executor: FhirExecutor,
  firstBundle: Bundle,
): AsyncGenerator<T[], void, undefined> {
  let bundle: Bundle | undefined = firstBundle;
  // §3.2.1.3.3: a misconfigured server can produce a `next` link that points
  // back at itself (or at any URL we've already fetched), which turns a
  // paginate() loop into an unbounded request storm. Track visited URLs and
  // stop at the first cycle.
  const seen = new Set<string>();

  while (bundle) {
    const entries = bundle.entry ?? [];
    const resources = entries.filter((e) => e.resource !== undefined).map((e) => e.resource as T);

    if (resources.length > 0) {
      yield resources;
    }

    const nextUrl = bundle.link?.find((l) => l.relation === "next")?.url;
    if (!nextUrl || seen.has(nextUrl)) {
      bundle = undefined;
      continue;
    }
    seen.add(nextUrl);
    bundle = (await executor.executeUrl(nextUrl)) as Bundle;
    // Peek at the fetched bundle's own `next`: if it points back at a URL we
    // already walked, the server is looping. Dropping the bundle here stops
    // us from yielding duplicate content that'd only retrigger the cycle
    // check one iteration later.
    const peekNext = bundle?.link?.find((l) => l.relation === "next")?.url;
    if (peekNext && seen.has(peekNext)) bundle = undefined;
  }
}

export async function fetchAllPages<T extends Resource>(executor: FhirExecutor, firstBundle: Bundle): Promise<T[]> {
  const all: T[] = [];
  for await (const page of paginate<T>(executor, firstBundle)) {
    all.push(...page);
  }
  return all;
}

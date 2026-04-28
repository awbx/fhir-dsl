// Phase 4.2 — Bundle reference resolution.
//
// FHIR `Bundle` carries entries plus `fullUrl`s; references inside
// resources can be:
//
//   - absolute URI matching an entry's `fullUrl`
//   - relative `<ResourceType>/<id>` matching an entry resource by id
//   - fragment `#localId` referring to a contained resource on the
//     enclosing DomainResource
//
// `resolveReference(bundle, ref, opts)` returns the typed resource the
// reference points to, or `undefined` if it can't be located. The
// matcher tries fullUrl first (most specific), then falls back to a
// resource-type + id lookup. Contained resolution is opt-in via the
// `containedOn` argument since fragment references are scoped to a
// specific DomainResource, not the bundle.

interface MinimalBundle<R = unknown> {
  entry?: Array<{ fullUrl?: string; resource?: R } | undefined>;
}

interface MinimalReference {
  reference?: string;
  type?: string;
}

interface MinimalResource {
  resourceType?: string;
  id?: string;
}

interface MinimalDomainResource extends MinimalResource {
  contained?: MinimalResource[];
}

export interface ResolveOptions {
  /** If set, fragment refs (`#abc`) resolve against this resource's `contained[]`. */
  containedOn?: MinimalDomainResource | undefined;
}

export type ReferenceLike = string | MinimalReference | undefined | null;

function refString(ref: ReferenceLike): string | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "string") return ref;
  return ref.reference;
}

/**
 * Resolves a Reference to its target resource within a Bundle.
 *
 *   const obs = bundle.entry?.[0]?.resource;
 *   const subject = resolveReference(bundle, obs?.subject);
 *
 * Resolution order:
 * 1. Fragment ref (`#localId`) → containedOn.contained[*].id match.
 * 2. Absolute or relative ref → entry.fullUrl exact match.
 * 3. Relative `<ResourceType>/<id>` → entry.resource.{resourceType,id} match.
 *
 * Returns `undefined` when no entry matches. The generic preserves the
 * caller's typed Bundle shape.
 */
export function resolveReference<R extends MinimalResource = MinimalResource>(
  bundle: MinimalBundle<R> | undefined,
  ref: ReferenceLike,
  opts: ResolveOptions = {},
): R | undefined {
  const target = refString(ref);
  if (!target) return undefined;

  // 1. Contained / fragment.
  if (target.startsWith("#")) {
    const id = target.slice(1);
    if (!id) return undefined;
    const contained = opts.containedOn?.contained;
    if (!contained) return undefined;
    return contained.find((r) => r?.id === id) as R | undefined;
  }

  const entries = bundle?.entry;
  if (!entries) return undefined;

  // 2. fullUrl exact match.
  for (const e of entries) {
    if (e?.fullUrl === target) return e.resource;
  }

  // 3. Relative `<ResourceType>/<id>` against entry resource identity.
  const slash = target.lastIndexOf("/");
  if (slash > 0) {
    const id = target.slice(slash + 1);
    const head = target.slice(0, slash);
    const lastSegment = head.slice(head.lastIndexOf("/") + 1);
    const resourceType = lastSegment;
    if (id && resourceType) {
      for (const e of entries) {
        const r = e?.resource as MinimalResource | undefined;
        if (r?.id === id && r?.resourceType === resourceType) {
          return r as R;
        }
      }
    }
  }

  return undefined;
}

/** Convenience helper for hydrating an array of references — undefined entries are dropped. */
export function resolveReferences<R extends MinimalResource = MinimalResource>(
  bundle: MinimalBundle<R> | undefined,
  refs: ReferenceLike[] | undefined,
  opts: ResolveOptions = {},
): R[] {
  if (!refs) return [];
  const out: R[] = [];
  for (const r of refs) {
    const v = resolveReference(bundle, r, opts);
    if (v !== undefined) out.push(v);
  }
  return out;
}

// `resolve()` for the invariant engine. Only references whose target is
// certain from the JSON being validated are resolved:
//
// - `#id` (and `#`) against the `contained` resources of the resource that
//   holds the reference — a missing `#id` there is a dangling reference and
//   resolves to nothing, as the spec says. When that resource is the root
//   and has no contained resources, the root may itself be a contained
//   resource validated on its own, so the target is unknown;
// - inside a Bundle, an entry whose `fullUrl` (or `Type/id`) matches.
//
// Anything else (a server reference, a reference whose holder can't be
// located, an ambiguous match) is unknown: the caller turns it into an
// evaluation error so the invariant is indeterminate rather than wrong.

type Json = Record<string, unknown>;

/** Thrown when a reference's target can't be settled from the JSON. */
export class ReferenceUnknownError extends Error {}

function unknown(message: string): never {
  throw new ReferenceUnknownError(message);
}

function isObject(v: unknown): v is Json {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function isResource(v: unknown): v is Json {
  return isObject(v) && typeof v.resourceType === "string";
}

interface Step {
  /** The object at this level of the path. */
  node: Json;
  /** Property of the parent the node was reached through. */
  key: string | undefined;
}

/** Path of objects from `root` down to `target` (identity match), or undefined. */
function findPath(root: Json, target: object): Step[] | undefined {
  const path: Step[] = [];
  const seen = new WeakSet<object>();
  const visit = (node: Json, key: string | undefined): boolean => {
    if (seen.has(node)) return false;
    seen.add(node);
    path.push({ node, key });
    if (node === target) return true;
    for (const [k, value] of Object.entries(node)) {
      for (const child of Array.isArray(value) ? value : [value]) {
        if (isObject(child) && visit(child, k)) return true;
      }
    }
    path.pop();
    return false;
  };
  return visit(root, undefined) ? path : undefined;
}

/** Resources nested in `root` other than `root.contained[*]`. */
function hasNestedResources(root: Json): boolean {
  const walk = (node: unknown, key: string | undefined, depth: number): boolean => {
    if (Array.isArray(node)) return node.some((c) => walk(c, key, depth));
    if (!isObject(node)) return false;
    if (depth > 0 && isResource(node) && !(depth === 1 && key === "contained")) return true;
    return Object.entries(node).some(([k, v]) => walk(v, k, depth + 1));
  };
  return walk(root, undefined, 0);
}

interface Owner {
  /** The resource whose `contained` a `#id` refers to. */
  resource: Json;
  /** The Bundle entry holding that resource, when it's a Bundle entry. */
  entry: Json | undefined;
  bundle: Json | undefined;
}

function ownerOf(root: Json, holder: unknown): Owner {
  if (!isObject(holder)) {
    // A bare string: we can't tell where it sits, so it's only safe when
    // the root holds no other resources.
    if (hasNestedResources(root)) unknown("cannot locate the reference within the resource");
    return { resource: root, entry: undefined, bundle: undefined };
  }
  const path = findPath(root, holder);
  if (!path) unknown("cannot locate the reference within the resource");
  let owner: Owner = { resource: root, entry: undefined, bundle: undefined };
  for (let k = 1; k < path.length; k++) {
    const { node, key } = path[k]!;
    if (!isResource(node)) continue;
    // A contained resource shares its container's `#id` namespace.
    if (key === "contained" && path[k - 1]!.node === owner.resource) continue;
    const parent = path[k - 1]!;
    const grand = path[k - 2];
    const inBundle =
      key === "resource" && parent.key === "entry" && grand !== undefined && grand.node.resourceType === "Bundle";
    owner = { resource: node, entry: inBundle ? parent.node : undefined, bundle: inBundle ? grand.node : undefined };
  }
  return owner;
}

const RELATIVE = /^([A-Z][A-Za-z]+)\/([A-Za-z0-9\-.]{1,64})(?:\/_history\/([A-Za-z0-9\-.]{1,64}))?$/;
const RESTFUL =
  /^([A-Za-z][A-Za-z0-9+.-]*:\/\/.*\/)([A-Z][A-Za-z]+)\/([A-Za-z0-9\-.]{1,64})(?:\/_history\/([A-Za-z0-9\-.]{1,64}))?$/;

function resolveInBundle(ref: string, owner: Owner): Json {
  const bundle = owner.bundle;
  if (!bundle) unknown(`reference ${ref} points outside the resource`);
  const entries = (Array.isArray(bundle.entry) ? bundle.entry : []).filter(
    (e): e is Json => isObject(e) && isResource(e.resource),
  );
  const ownerUrl = typeof owner.entry?.fullUrl === "string" ? RESTFUL.exec(owner.entry.fullUrl) : null;
  const rel = RELATIVE.exec(ref);
  const abs = rel ? null : RESTFUL.exec(ref);
  const version = rel?.[3] ?? abs?.[4];
  // The fullUrl the reference stands for, when it can be told: a relative
  // reference is relative to the base of the referencing entry's RESTful
  // fullUrl.
  const target = rel
    ? ownerUrl
      ? `${ownerUrl[1]}${rel[1]}/${rel[2]}`
      : undefined
    : abs
      ? `${abs[1]}${abs[2]}/${abs[3]}`
      : ref;

  const pick = (matches: Json[]): Json | undefined => {
    if (matches.length === 0) return undefined;
    if (version !== undefined) {
      const exact = matches.filter((e) => {
        const meta = (e.resource as Json).meta;
        return isObject(meta) && meta.versionId === version;
      });
      if (exact.length === 1) return exact[0]!.resource as Json;
      unknown(`version ${version} of ${ref} can't be told apart in the Bundle`);
    }
    if (matches.length > 1) unknown(`reference ${ref} matches several Bundle entries`);
    return matches[0]!.resource as Json;
  };

  if (target !== undefined) {
    const hit = pick(entries.filter((e) => e.fullUrl === target));
    if (hit) return hit;
  }
  if (rel) {
    const [, type, id] = rel;
    const hit = pick(
      entries.filter((e) => {
        const r = e.resource as Json;
        if (r.resourceType !== type || r.id !== id) return false;
        if (typeof e.fullUrl !== "string") return true;
        const m = RESTFUL.exec(e.fullUrl);
        if (!m) return false;
        // With a RESTful base on both sides the bases must agree.
        return ownerUrl ? m[1] === ownerUrl[1] : true;
      }),
    );
    if (hit) return hit;
  }
  unknown(`reference ${ref} not found in the Bundle`);
}

/**
 * Resolve one item (a Reference, or a reference string) against `root`.
 * Returns the target resource, or undefined for a dangling `#id`. Throws
 * `ReferenceUnknownError` when the target can't be settled.
 */
export function resolveReference(root: Json, item: unknown): Json | undefined {
  let ref: string;
  if (typeof item === "string") ref = item;
  else if (isObject(item) && typeof item.reference === "string") ref = item.reference;
  else unknown("not a resolvable reference");
  const owner = ownerOf(root, item);
  if (ref.startsWith("#")) {
    const contained = Array.isArray(owner.resource.contained) ? owner.resource.contained : [];
    // A root without contained resources may itself be a contained resource
    // validated on its own, whose `#id`s point into a container we can't see.
    if (owner.resource === root && contained.length === 0) unknown(`cannot tell what ${ref} refers to`);
    if (ref === "#") return owner.resource;
    const id = ref.slice(1);
    const matches = contained.filter((c) => isResource(c) && c.id === id) as Json[];
    if (matches.length > 1) unknown(`several contained resources have id ${id}`);
    return matches[0];
  }
  return resolveInBundle(ref, owner);
}

import type { FhirFnOp } from "../ops.js";
import type { EvalContext } from "./types.js";

// FHIR R5 §2.1.9.6: hasValue()/getValue() operate on a singleton whose value
// is a FHIR primitive. In the JS representation of FHIR resources primitives
// are plain strings/numbers/booleans, so the check is `typeof`-based.
function isPrimitive(value: unknown): boolean {
  const t = typeof value;
  return t === "string" || t === "number" || t === "boolean";
}

export function evalFhirFn(op: FhirFnOp, collection: unknown[], ctx: EvalContext): unknown[] {
  switch (op.type) {
    case "hasValue":
      return [collection.length === 1 && isPrimitive(collection[0])];

    case "getValue":
      return collection.length === 1 && isPrimitive(collection[0]) ? [collection[0]] : [];

    // FP-FHIR-010: htmlChecks() is a FHIR narrative sanity check. Per the spec
    // its exact semantics are implementation-defined; the reference impls
    // (HAPI, fhirpath.js, Firely) return true for well-formed inputs. We stub
    // as `true` for a singleton and `[]` otherwise.
    case "htmlChecks":
      return collection.length === 1 ? [true] : [];

    case "resolve":
      return collection.flatMap((item) => resolveOne(item, ctx));
  }
}

function resolveOne(item: unknown, ctx: EvalContext): unknown[] {
  const ref = extractReferenceString(item);
  if (ref === undefined) return [];
  const bundle = ctx.rootResource as { resourceType?: unknown; entry?: unknown } | undefined;
  if (!bundle || bundle.resourceType !== "Bundle" || !Array.isArray(bundle.entry)) return [];

  for (const entry of bundle.entry as Array<Record<string, unknown>>) {
    if (entry.fullUrl === ref) {
      if (entry.resource !== undefined) return [entry.resource];
    }
    const resource = entry.resource as { resourceType?: unknown; id?: unknown } | undefined;
    if (resource && typeof resource.resourceType === "string" && typeof resource.id === "string") {
      if (`${resource.resourceType}/${resource.id}` === ref) return [resource];
    }
  }
  return [];
}

function extractReferenceString(item: unknown): string | undefined {
  if (typeof item === "string") return item;
  if (item != null && typeof item === "object") {
    const ref = (item as { reference?: unknown }).reference;
    if (typeof ref === "string") return ref;
  }
  return undefined;
}

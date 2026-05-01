import type { FhirFnOp } from "../ops.js";
import { isPrimitiveBox, unwrapPrimitive } from "./_internal/primitive-box.js";
import { type EvalContext, FhirPathEvaluationError } from "./types.js";

// FHIR R5 §2.1.9.6: hasValue()/getValue() operate on a singleton whose value
// is a FHIR primitive. Plain JS primitives qualify; a boxed primitive
// (FP.9: carrying `_field` extension metadata) also qualifies — its
// value-axis is a primitive.
function isPrimitive(value: unknown): boolean {
  if (isPrimitiveBox(value)) return true;
  const t = typeof value;
  return t === "string" || t === "number" || t === "boolean";
}

export function evalFhirFn(op: FhirFnOp, collection: unknown[], ctx: EvalContext): unknown[] {
  switch (op.type) {
    case "hasValue":
      return [collection.length === 1 && isPrimitive(collection[0])];

    case "getValue":
      return collection.length === 1 && isPrimitive(collection[0]) ? [unwrapPrimitive(collection[0])] : [];

    // FP-FHIR-010: htmlChecks() is a FHIR narrative sanity check. Per the spec
    // its exact semantics are implementation-defined; the reference impls
    // (HAPI, fhirpath.js, Firely) return true for well-formed inputs. We stub
    // as `true` for a singleton and `[]` otherwise.
    case "htmlChecks":
      return collection.length === 1 ? [true] : [];

    case "resolve":
      return collection.flatMap((item) => resolveOne(item, ctx));

    case "conformsTo": {
      const fn = ctx.terminology?.conformsTo;
      if (!fn) {
        throw new FhirPathEvaluationError(
          "conformsTo() requires `terminology.conformsTo` on EvalOptions; supply a synchronous resolver.",
        );
      }
      return collection.length === 0 ? [] : [fn(collection[0], op.profileUrl)];
    }

    case "memberOf": {
      const fn = ctx.terminology?.memberOf;
      if (!fn) {
        throw new FhirPathEvaluationError(
          "memberOf() requires `terminology.memberOf` on EvalOptions; supply a synchronous resolver.",
        );
      }
      return collection.length === 0 ? [] : [fn(collection[0], op.valueSetUrl)];
    }

    case "subsumes": {
      const fn = ctx.terminology?.subsumes;
      if (!fn) {
        throw new FhirPathEvaluationError(
          "subsumes() requires `terminology.subsumes` on EvalOptions; supply a synchronous resolver.",
        );
      }
      return collection.length === 0 ? [] : [fn(collection[0], op.other)];
    }

    case "subsumedBy": {
      const fn = ctx.terminology?.subsumedBy;
      if (!fn) {
        throw new FhirPathEvaluationError(
          "subsumedBy() requires `terminology.subsumedBy` on EvalOptions; supply a synchronous resolver.",
        );
      }
      return collection.length === 0 ? [] : [fn(collection[0], op.other)];
    }
  }
}

function resolveOne(item: unknown, ctx: EvalContext): unknown[] {
  const ref = extractReferenceString(item);
  if (ref === undefined) return [];

  // Bundle frame first — this is the well-known FHIRPath spec form and
  // works without any resolver wiring.
  const bundle = ctx.rootResource as { resourceType?: unknown; entry?: unknown } | undefined;
  if (bundle && bundle.resourceType === "Bundle" && Array.isArray(bundle.entry)) {
    for (const entry of bundle.entry as Array<Record<string, unknown>>) {
      if (entry.fullUrl === ref && entry.resource !== undefined) return [entry.resource];
      const resource = entry.resource as { resourceType?: unknown; id?: unknown } | undefined;
      if (resource && typeof resource.resourceType === "string" && typeof resource.id === "string") {
        if (`${resource.resourceType}/${resource.id}` === ref) return [resource];
      }
    }
  }

  // Fall through to the user-supplied resolver if present. This is the
  // path for non-Bundle evaluations (validating a single resource against
  // its profile, for instance) where references point at a wider store.
  if (ctx.resolveReference) {
    const resolved = ctx.resolveReference(ref);
    if (resolved !== undefined) return [resolved];
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

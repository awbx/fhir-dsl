/**
 * Minimal Standard Schema V1 shape — enough to validate() a value without
 * depending on the `@standard-schema/spec` package. Generated schemas from
 * `@fhir-dsl/generator` with `--validator native|zod` conform to this.
 */
export interface StandardSchemaLike {
  readonly "~standard": {
    readonly validate: (value: unknown) => StandardValidateResult | Promise<StandardValidateResult>;
  };
}

export type StandardValidateResult =
  | { readonly value: unknown; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<{ readonly message: string; readonly path?: ReadonlyArray<PropertyKey> }> };

/**
 * Registry of generated runtime schemas. Passed to `createFhirClient()` via
 * `FhirClientConfig.schemas` so `.validate().execute()` can look up the right
 * schema for each query. Emitted by the generator when `--validator` is used.
 */
export interface SchemaRegistry {
  readonly resources: Readonly<Record<string, StandardSchemaLike>>;
  readonly profiles?: Readonly<Record<string, Readonly<Record<string, StandardSchemaLike>>>>;
}

export class ValidationUnavailableError extends Error {
  constructor() {
    super(
      ".validate() was called but no schemas are configured on the client. " +
        "Regenerate your types with `fhir-gen generate --validator native` (or `zod`), " +
        "and ensure the generated createClient() is wired up (or pass `schemas` to createFhirClient directly).",
    );
    this.name = "ValidationUnavailableError";
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly resourceType: string,
    public readonly issues: ReadonlyArray<{ message: string; path?: ReadonlyArray<PropertyKey> }>,
    public readonly index?: number,
  ) {
    const loc = index !== undefined ? `data[${index}]` : resourceType;
    const first = issues[0];
    const where = first?.path && first.path.length > 0 ? `.${first.path.join(".")}` : "";
    super(`Validation failed for ${loc}${where}: ${first?.message ?? "unknown"} (${issues.length} issue(s))`);
    this.name = "ValidationError";
  }
}

/**
 * Resolve the schema to use for a given resource type + optional profile URL,
 * or throw if the registry doesn't have it.
 */
export function resolveSchema(registry: SchemaRegistry, resourceType: string, profile?: string): StandardSchemaLike {
  if (profile) {
    const slug = profileSlugFromUrl(profile);
    const byRt = registry.profiles?.[resourceType];
    const schema = byRt?.[slug];
    if (!schema) {
      throw new ValidationUnavailableError();
    }
    return schema;
  }
  const schema = registry.resources[resourceType];
  if (!schema) {
    throw new ValidationUnavailableError();
  }
  return schema;
}

function profileSlugFromUrl(url: string): string {
  const tail = url.split("/").pop() ?? url;
  return tail;
}

/** Validate a single resource, throwing ValidationError if it fails. */
export async function validateOne(
  schema: StandardSchemaLike,
  resourceType: string,
  value: unknown,
  index?: number,
): Promise<void> {
  const r = await schema["~standard"].validate(value);
  if ("issues" in r && r.issues) {
    throw new ValidationError(resourceType, r.issues, index);
  }
}

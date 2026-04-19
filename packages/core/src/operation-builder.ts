import type { Parameters, Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import { type ExecuteOptions, mergePreferIntoQuery } from "./query-builder.js";
import type { Executor } from "./search-query-builder.js";

export type OperationScope =
  | { kind: "system" }
  | { kind: "type"; resourceType: string }
  | { kind: "instance"; resourceType: string; id: string };

export interface OperationOptions {
  scope?: OperationScope;
  /**
   * Parameters. Either a FHIR `Parameters` resource, a plain record of
   * `name → value` (wrapped automatically), or `undefined` for none.
   */
  parameters?: Parameters | Record<string, unknown>;
  /** Force HTTP method. Defaults to POST. */
  method?: "GET" | "POST";
}

export interface OperationBuilder {
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<Resource | Parameters>;
}

export class OperationBuilderImpl implements OperationBuilder {
  readonly #executor: Executor;
  readonly #name: string;
  readonly #options: OperationOptions;

  constructor(executor: Executor, name: string, options: OperationOptions = {}) {
    this.#executor = executor;
    this.#name = normalizeOperationName(name);
    this.#options = options;
  }

  compile(): CompiledQuery {
    const path = buildOperationPath(this.#options.scope, this.#name);
    const method = this.#options.method ?? "POST";
    if (method === "GET") {
      return {
        method: "GET",
        path,
        params: toSearchParams(this.#options.parameters),
      };
    }
    const body = wrapParameters(this.#options.parameters);
    return {
      method: "POST",
      path,
      params: [],
      ...(body !== undefined ? { body } : {}),
    };
  }

  async execute(options?: ExecuteOptions): Promise<Resource | Parameters> {
    const query = mergePreferIntoQuery(this.compile(), options?.prefer);
    return (await this.#executor(query, options?.signal)) as Resource | Parameters;
  }
}

function normalizeOperationName(name: string): string {
  return name.startsWith("$") ? name : `$${name}`;
}

function buildOperationPath(scope: OperationScope | undefined, name: string): string {
  if (!scope || scope.kind === "system") return name;
  if (scope.kind === "type") return `${scope.resourceType}/${name}`;
  return `${scope.resourceType}/${scope.id}/${name}`;
}

// OP-PARM-001: POST operations carry a FHIR `Parameters` resource. A bare
// record is wrapped automatically so callers don't have to know the wire
// format.
function wrapParameters(parameters: OperationOptions["parameters"]): Parameters | undefined {
  if (parameters === undefined) return undefined;
  if (isParametersResource(parameters)) return parameters;
  const entries = Object.entries(parameters);
  if (entries.length === 0) return undefined;
  return {
    resourceType: "Parameters",
    parameter: entries.map(([name, value]) => buildParameterEntry(name, value)),
  };
}

function isParametersResource(value: unknown): value is Parameters {
  return (
    value != null && typeof value === "object" && (value as { resourceType?: unknown }).resourceType === "Parameters"
  );
}

function buildParameterEntry(name: string, value: unknown): Parameters["parameter"][number] {
  if (value != null && typeof value === "object" && "resourceType" in value) {
    return { name, resource: value as Resource };
  }
  if (typeof value === "string") return { name, valueString: value };
  if (typeof value === "boolean") return { name, valueBoolean: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { name, valueInteger: value } : { name, valueDecimal: value };
  }
  // Fallback: serialize as JSON string. Loses type info but keeps the value.
  return { name, valueString: JSON.stringify(value) };
}

// OP-INV-003: GET accepted when every parameter is a primitive. Complex values
// (Resources, nested objects) always require POST with a Parameters body.
function toSearchParams(parameters: OperationOptions["parameters"]): CompiledQuery["params"] {
  if (!parameters) return [];
  if (isParametersResource(parameters)) {
    return parameters.parameter.flatMap((p) => {
      const value = extractPrimitiveValue(p);
      return value === undefined ? [] : [{ name: p.name, value }];
    });
  }
  return Object.entries(parameters).flatMap(([name, value]) => {
    if (value == null || typeof value === "object") return [];
    return [{ name, value: String(value) }];
  });
}

function extractPrimitiveValue(p: Parameters["parameter"][number]): string | undefined {
  if ("valueString" in p) return p.valueString;
  if ("valueBoolean" in p) return String(p.valueBoolean);
  if ("valueInteger" in p) return String(p.valueInteger);
  if ("valueDecimal" in p) return String(p.valueDecimal);
  if ("valueUri" in p) return p.valueUri as string | undefined;
  if ("valueCode" in p) return p.valueCode as string | undefined;
  return undefined;
}

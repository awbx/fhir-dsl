import { searchParamTypeToTs } from "@fhir-dsl/utils";
import type { ResourceSearchParams } from "../model/resource-model.js";
import type { CommonSearchParamEntry } from "../spec/catalog.js";

/**
 * Map from "ResourceType.propertyName" → terminology type name.
 * Built from ResourceModel properties with bindings.
 */
export type SearchParamBindingMap = Map<string, { typeName: string; strength: string }>;

export interface EmitSearchParamsOptions {
  commonSearchParams?: CommonSearchParamEntry[] | undefined;
  /** ResourceType → baseType (e.g. "DomainResource"). Controls which parent interface each resource extends. */
  resourceBaseTypes?: Map<string, string | undefined> | undefined;
  searchParamBindingMap?: SearchParamBindingMap | undefined;
}

const FALLBACK_COMMON_PARAMS: CommonSearchParamEntry[] = [
  { code: "_id", type: "token", scope: "Resource" },
  { code: "_lastUpdated", type: "date", scope: "Resource" },
  { code: "_tag", type: "token", scope: "Resource" },
  { code: "_security", type: "token", scope: "Resource" },
  { code: "_source", type: "uri", scope: "Resource" },
  { code: "_profile", type: "uri", scope: "Resource" },
  { code: "_filter", type: "string", scope: "Resource" },
  { code: "_content", type: "string", scope: "Resource" },
  { code: "_list", type: "string", scope: "Resource" },
  { code: "_text", type: "string", scope: "DomainResource" },
];

export function emitSearchParams(
  allParams: Map<string, ResourceSearchParams>,
  options: EmitSearchParamsOptions = {},
): string {
  const commonParams = options.commonSearchParams ?? FALLBACK_COMMON_PARAMS;
  const resourceBaseTypes = options.resourceBaseTypes ?? new Map();
  const searchParamBindingMap = options.searchParamBindingMap;

  const lines: string[] = [];

  lines.push(
    'import type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam } from "./search-param-types.js";',
  );
  lines.push(
    "export type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam };",
  );

  const terminologyImports = new Set<string>();
  const sortedResources = [...allParams.keys()].sort();
  const paramLines: string[] = [];

  const resourceCommon = commonParams.filter((p) => p.scope === "Resource");
  const domainResourceCommon = commonParams.filter((p) => p.scope === "DomainResource");

  paramLines.push("/** Search params common to every FHIR resource. */");
  paramLines.push("export interface CommonSearchParams {");
  for (const p of resourceCommon) {
    paramLines.push(`  "${p.code}": ${searchParamTypeToTs(p.type)};`);
  }
  paramLines.push("}");
  paramLines.push("");

  paramLines.push("/** Search params common to every DomainResource (adds to CommonSearchParams). */");
  paramLines.push("export interface DomainResourceSearchParams extends CommonSearchParams {");
  for (const p of domainResourceCommon) {
    paramLines.push(`  "${p.code}": ${searchParamTypeToTs(p.type)};`);
  }
  paramLines.push("}");
  paramLines.push("");

  for (const resourceType of sortedResources) {
    const params = allParams.get(resourceType)!;
    const baseType = resourceBaseTypes.get(resourceType);
    const parent = baseType === "DomainResource" ? "DomainResourceSearchParams" : "CommonSearchParams";
    paramLines.push(`export interface ${resourceType}SearchParams extends ${parent} {`);

    const sortedParams = [...params.params].sort((a, b) => a.code.localeCompare(b.code));
    for (const param of sortedParams) {
      if (param.type === "composite" && param.components?.length) {
        const componentEntries = param.components.map((c) => `"${c.code}": ${searchParamTypeToTs(c.type)}`).join("; ");
        paramLines.push(`  "${param.code}": CompositeParam<{ ${componentEntries} }>;`);
      } else {
        const boundType = resolveSearchParamBinding(param, resourceType, searchParamBindingMap);
        if (boundType) {
          terminologyImports.add(boundType);
          paramLines.push(`  "${param.code}": TokenParam<${boundType}>;`);
        } else {
          const tsType = searchParamTypeToTs(param.type);
          paramLines.push(`  "${param.code}": ${tsType};`);
        }
      }
    }

    paramLines.push("}");
    paramLines.push("");
  }

  if (terminologyImports.size > 0) {
    const sorted = [...terminologyImports].sort();
    lines.push(`import type { ${sorted.join(", ")} } from "./terminology/valuesets.js";`);
  }

  lines.push("");
  lines.push(...paramLines);

  return `${lines.join("\n")}\n`;
}

function resolveSearchParamBinding(
  param: { type: string; expression?: string | undefined },
  resourceType: string,
  bindingMap?: SearchParamBindingMap,
): string | undefined {
  if (!bindingMap || param.type !== "token") return undefined;
  if (!param.expression) return undefined;

  const expr = param.expression.trim();
  const parts = expr.split("|").map((p) => p.trim());
  for (const part of parts) {
    if (!part.startsWith(`${resourceType}.`)) continue;
    const binding = bindingMap.get(part);
    if (binding && binding.strength === "required") return binding.typeName;
  }

  return undefined;
}

export function emitSearchParamTypes(): string {
  return `export interface StringParam {
  type: "string";
  value: string;
}

export interface TokenParam<T extends string = string> {
  type: "token";
  value: T;
}

export interface DateParam {
  type: "date";
  value: string;
}

export interface ReferenceParam {
  type: "reference";
  value: string;
}

export interface QuantityParam {
  type: "quantity";
  value: string;
}

export interface NumberParam {
  type: "number";
  value: number | string;
}

export interface UriParam {
  type: "uri";
  value: string;
}

export interface CompositeParam<C extends Record<string, { type: string; value: string | number }> = Record<string, { type: string; value: string | number }>> {
  type: "composite";
  value: string;
  components: C;
}

export interface SpecialParam {
  type: "special";
  value: string;
}

export type SearchParam =
  | StringParam
  | TokenParam
  | DateParam
  | ReferenceParam
  | QuantityParam
  | NumberParam
  | UriParam
  | CompositeParam
  | SpecialParam;
`;
}

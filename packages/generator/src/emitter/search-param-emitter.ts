import { searchParamTypeToTs } from "@fhir-dsl/utils";
import type { ResourceSearchParams } from "../model/resource-model.js";

/**
 * Map from "ResourceType.propertyName" → terminology type name.
 * Built from ResourceModel properties with bindings.
 */
export type SearchParamBindingMap = Map<string, { typeName: string; strength: string }>;

export function emitSearchParams(
  allParams: Map<string, ResourceSearchParams>,
  searchParamBindingMap?: SearchParamBindingMap,
): string {
  const lines: string[] = [];

  lines.push(
    'import type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam } from "./search-param-types.js";',
  );
  lines.push(
    "export type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam };",
  );

  // Collect terminology imports needed for search params
  const terminologyImports = new Set<string>();

  const sortedResources = [...allParams.keys()].sort();
  const paramLines: string[] = [];

  // Common params shared by every FHIR resource type (FHIR R4 §3.1.1 / R5 §3.1.1).
  paramLines.push("/** Search params common to every FHIR resource. */");
  paramLines.push("export interface CommonSearchParams {");
  paramLines.push('  "_id": TokenParam;');
  paramLines.push('  "_lastUpdated": DateParam;');
  paramLines.push('  "_tag": TokenParam;');
  paramLines.push('  "_security": TokenParam;');
  paramLines.push('  "_source": UriParam;');
  paramLines.push('  "_profile": UriParam;');
  paramLines.push('  "_filter": StringParam;');
  paramLines.push('  "_text": StringParam;');
  paramLines.push('  "_content": StringParam;');
  paramLines.push('  "_list": StringParam;');
  paramLines.push("}");
  paramLines.push("");

  for (const resourceType of sortedResources) {
    const params = allParams.get(resourceType)!;
    paramLines.push(`export interface ${resourceType}SearchParams extends CommonSearchParams {`);

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

  // Expression is like "Patient.gender" or "Patient.communication.language"
  // Try exact match first, then just "ResourceType.leafProperty"
  const expr = param.expression.trim();

  // Handle multi-resource expressions like "Patient.gender | Person.gender"
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

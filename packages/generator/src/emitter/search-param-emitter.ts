import { searchParamTypeToTs } from "@fhir-dsl/utils";
import type { ResourceSearchParams } from "../model/resource-model.js";

export function emitSearchParams(allParams: Map<string, ResourceSearchParams>): string {
  const lines: string[] = [];

  lines.push(
    'import type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam } from "./search-param-types.js";',
  );
  lines.push(
    "export type { StringParam, TokenParam, DateParam, ReferenceParam, QuantityParam, NumberParam, UriParam, CompositeParam, SpecialParam };",
  );
  lines.push("");

  const sortedResources = [...allParams.keys()].sort();

  for (const resourceType of sortedResources) {
    const params = allParams.get(resourceType)!;
    lines.push(`export interface ${resourceType}SearchParams {`);

    const sortedParams = [...params.params].sort((a, b) => a.code.localeCompare(b.code));
    for (const param of sortedParams) {
      if (param.type === "composite" && param.components?.length) {
        const componentEntries = param.components.map((c) => `"${c.code}": ${searchParamTypeToTs(c.type)}`).join("; ");
        lines.push(`  "${param.code}": CompositeParam<{ ${componentEntries} }>;`);
      } else {
        const tsType = searchParamTypeToTs(param.type);
        lines.push(`  "${param.code}": ${tsType};`);
      }
    }

    lines.push("}");
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function emitSearchParamTypes(): string {
  return `export interface StringParam {
  type: "string";
  value: string;
}

export interface TokenParam {
  type: "token";
  value: string;
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

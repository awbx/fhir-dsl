export function toPascalCase(str: string): string {
  return str
    .replace(/[-_.\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (_, c: string) => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function fhirTypeToFileName(typeName: string): string {
  return `${toKebabCase(typeName)}.ts`;
}

export function fhirPathToPropertyName(path: string): string {
  const parts = path.split(".");
  return parts[parts.length - 1]!;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

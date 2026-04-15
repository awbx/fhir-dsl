export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface CompiledSearchParam {
  name: string;
  prefix?: string | undefined;
  value: string | number;
}

export interface CompiledQuery {
  method: HttpMethod;
  path: string;
  params: CompiledSearchParam[];
  headers?: Record<string, string> | undefined;
  body?: unknown | undefined;
}

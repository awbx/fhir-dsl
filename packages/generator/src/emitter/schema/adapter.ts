/**
 * Validator adapter strategy: converts a library-agnostic schema AST
 * into source code for a specific validation library (Zod or native).
 *
 * Every adapter's output must satisfy Standard Schema V1 at the type level —
 * i.e. exported consts have a `~standard` property so downstream code can
 * validate without depending on a specific library.
 */

export type SchemaNode =
  | { kind: "primitive"; fhirType: string }
  | { kind: "literal"; value: string }
  | { kind: "enum"; values: string[]; extensible: boolean }
  | { kind: "object"; fields: ObjectField[] }
  | { kind: "array"; inner: SchemaNode; minItems?: number }
  | { kind: "union"; options: SchemaNode[] }
  | { kind: "ref"; name: string }
  | { kind: "lazy"; ref: string }
  | { kind: "unknown" };

export interface ObjectField {
  name: string;
  schema: SchemaNode;
  optional: boolean;
}

export interface ExtraRuntimeFile {
  filename: string;
  source: string;
}

export interface LibImportOptions {
  /** Relative path from the generated file to the runtime helper (native adapter only). Default: "./__runtime.js". */
  runtimePath?: string;
}

export interface ValidatorAdapter {
  readonly name: "zod" | "native";
  /** `import { z } from "zod";` etc. For native, uses opts.runtimePath. */
  libImport(opts?: LibImportOptions): string;
  /** Inline expression for a schema node. */
  render(node: SchemaNode): string;
  /** `export const <Name> = <expr>;` — picks the best representation for the adapter. */
  declareConst(exportName: string, node: SchemaNode): string;
  /** `export const <Name> = <baseName>.<extend op>({...});` — used for profiles. */
  declareExtend(exportName: string, baseName: string, fields: ObjectField[]): string;
  /** Extra runtime file to emit once per output dir (e.g. native runtime helpers). */
  runtimeFile?(): ExtraRuntimeFile | null;
  /**
   * Optional type annotation applied to every datatype const to break
   * mutual-recursion inference cycles (TS7022). When set, datatype consts
   * are emitted as `export const X: <annotation> = ...`, and `importStatement`
   * is added to the datatypes.ts header.
   */
  datatypeAnnotation?(runtimePath: string): { annotation: string; importStatement: string } | null;
}

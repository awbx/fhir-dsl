/**
 * Tiny Standard Schema V1 runtime. Zero dependencies.
 * Emitted by @fhir-dsl/generator when --validator native is used.
 *
 * NOTE: this file is both a real runtime (imported by the generator's tests)
 * and a template — its source is inlined into generated projects as `__runtime.ts`.
 */

export type Issue = { readonly message: string; readonly path?: ReadonlyArray<PropertyKey> };
export type Result<T> = { readonly value: T; readonly issues?: undefined } | { readonly issues: readonly Issue[] };

export interface StandardSchema<Output> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: "fhir-dsl";
    readonly types?: { input: unknown; output: Output };
    readonly validate: (value: unknown) => Result<Output>;
  };
  /** Object shape, present on object/extend schemas. Internal. */
  readonly _shape?: Record<string, { readonly schema: StandardSchema<unknown>; readonly optional: boolean }>;
}

function ok<T>(value: T): Result<T> {
  return { value };
}

function fail(message: string, path?: ReadonlyArray<PropertyKey>): Result<never> {
  return { issues: path ? [{ message, path }] : [{ message }] };
}

function make<T>(validate: (value: unknown) => Result<T>, extra?: Partial<StandardSchema<T>>): StandardSchema<T> {
  return {
    "~standard": { version: 1, vendor: "fhir-dsl", validate },
    ...(extra ?? {}),
  } as StandardSchema<T>;
}

export function unknown(): StandardSchema<unknown> {
  return make<unknown>((value) => ok(value));
}

export function string(opts?: { regex?: RegExp; maxLength?: number }): StandardSchema<string> {
  return make<string>((value) => {
    if (typeof value !== "string") return fail("expected string");
    if (opts?.regex && !opts.regex.test(value)) return fail("string does not match pattern");
    if (opts?.maxLength !== undefined && value.length > opts.maxLength) return fail("string too long");
    return ok(value);
  });
}

export function number(opts?: { int?: boolean; min?: number }): StandardSchema<number> {
  return make<number>((value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return fail("expected number");
    if (opts?.int && !Number.isInteger(value)) return fail("expected integer");
    if (opts?.min !== undefined && value < opts.min) return fail(`expected >= ${opts.min}`);
    return ok(value);
  });
}

export function boolean(): StandardSchema<boolean> {
  return make<boolean>((value) => (typeof value === "boolean" ? ok(value) : fail("expected boolean")));
}

export function literal<const T extends string | number | boolean>(expected: T): StandardSchema<T> {
  return make<T>((value) => (value === expected ? ok(value as T) : fail(`expected ${JSON.stringify(expected)}`)));
}

function enumFn<const T extends readonly string[]>(
  values: T,
  extensible?: boolean,
): StandardSchema<T[number] | (string & {})> {
  const set = new Set<string>(values);
  return make<T[number] | (string & {})>((value) => {
    if (typeof value !== "string") return fail("expected string");
    if (!set.has(value)) {
      if (extensible) return ok(value);
      return fail(`expected one of: ${values.join(", ")}`);
    }
    return ok(value as T[number]);
  });
}

export { enumFn as enum };

export function array<T>(inner: StandardSchema<T>, minItems?: number): StandardSchema<T[]> {
  return make<T[]>((value) => {
    if (!Array.isArray(value)) return fail("expected array");
    if (minItems !== undefined && value.length < minItems) return fail(`expected at least ${minItems} items`);
    const out: T[] = [];
    const issues: Issue[] = [];
    for (let i = 0; i < value.length; i++) {
      const r = inner["~standard"].validate(value[i]);
      if ("issues" in r && r.issues) {
        for (const is of r.issues) issues.push({ message: is.message, path: [i, ...(is.path ?? [])] });
      } else {
        out.push(r.value);
      }
    }
    return issues.length > 0 ? { issues } : ok(out);
  });
}

export type ShapeFields = Record<string, { schema: StandardSchema<unknown>; optional: boolean }>;

type InferObject<F extends ShapeFields> = {
  [K in keyof F as F[K]["optional"] extends true ? never : K]: F[K]["schema"] extends StandardSchema<infer T>
    ? T
    : never;
} & {
  [K in keyof F as F[K]["optional"] extends true ? K : never]?: F[K]["schema"] extends StandardSchema<infer T>
    ? T
    : never;
};

export function object<F extends ShapeFields>(fields: F): StandardSchema<InferObject<F>> & { _shape: F } {
  const validate = (value: unknown): Result<InferObject<F>> => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return fail("expected object");
    }
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const issues: Issue[] = [];
    for (const key in fields) {
      const spec = fields[key]!;
      const has = key in obj;
      if (!has) {
        if (!spec.optional) issues.push({ message: "missing required field", path: [key] });
        continue;
      }
      const r = spec.schema["~standard"].validate(obj[key]);
      if ("issues" in r && r.issues) {
        for (const is of r.issues) issues.push({ message: is.message, path: [key, ...(is.path ?? [])] });
      } else {
        out[key] = r.value;
      }
    }
    for (const key in obj) if (!(key in fields)) out[key] = obj[key];
    return issues.length > 0 ? { issues } : ok(out as InferObject<F>);
  };
  return { ...make<InferObject<F>>(validate), _shape: fields } as StandardSchema<InferObject<F>> & { _shape: F };
}

export function union<T extends readonly StandardSchema<unknown>[]>(
  options: T,
): StandardSchema<T[number] extends StandardSchema<infer U> ? U : never> {
  return make((value) => {
    for (const opt of options) {
      const r = opt["~standard"].validate(value);
      if (!("issues" in r) || !r.issues) return r as Result<T[number] extends StandardSchema<infer U> ? U : never>;
    }
    return { issues: [{ message: "no union variant matched" }] };
  });
}

export function lazy<T = unknown>(thunk: () => StandardSchema<T>): StandardSchema<T> {
  let cached: StandardSchema<T> | undefined;
  return make<T>((value) => {
    if (!cached) cached = thunk();
    return cached["~standard"].validate(value);
  });
}

export function extend<B, F extends ShapeFields>(
  base: StandardSchema<B>,
  additional: F,
): StandardSchema<B & InferObject<F>> {
  const baseShape = (base as StandardSchema<B> & { _shape?: ShapeFields })._shape ?? {};
  const merged: ShapeFields = { ...baseShape, ...additional };
  return object(merged) as unknown as StandardSchema<B & InferObject<F>>;
}

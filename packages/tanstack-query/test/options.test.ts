import { describe, expect, it } from "vitest";
import { mutationOptions, mutationOptionsBound, queryOptions } from "../src/index.js";

interface FakeResource {
  id: string;
  resourceType: "Patient";
}

const fakeRead = (id: string) => ({
  compile: () => ({ method: "GET" as const, path: `Patient/${id}`, params: [] }),
  execute: async () => ({ id, resourceType: "Patient" }) as FakeResource,
});

const fakeSearch = (q: string) => ({
  compile: () => ({
    method: "GET" as const,
    path: "Patient",
    params: [
      { name: "name", value: q },
      { name: "_count", value: 20 },
    ],
  }),
  execute: async () => ({ data: [{ id: "1", resourceType: "Patient" } as FakeResource], total: 1 }),
});

const fakeUpdate = (resource: FakeResource) => ({
  compile: () => ({ method: "PUT" as const, path: `Patient/${resource.id}`, params: [] }),
  execute: async () => resource,
});

describe("queryOptions", () => {
  it("derives a stable, sorted queryKey from compile()", () => {
    const opts = queryOptions(fakeSearch("Smith"));
    expect(opts.queryKey).toEqual([
      "fhir",
      "GET",
      "Patient",
      [
        ["_count", 20, undefined, undefined],
        ["name", "Smith", undefined, undefined],
      ],
    ]);
  });

  it("infers the result type from execute()", async () => {
    const opts = queryOptions(fakeRead("123"));
    const result = await opts.queryFn!({} as never);
    expect(result.id).toBe("123");
    expect(result.resourceType).toBe("Patient");
  });

  it("forwards AbortSignal to execute()", async () => {
    const controller = new AbortController();
    let receivedSignal: AbortSignal | undefined;
    const builder = {
      compile: () => ({ method: "GET" as const, path: "Patient/1", params: [] }),
      execute: async (options?: { signal?: AbortSignal }) => {
        receivedSignal = options?.signal;
        return { id: "1", resourceType: "Patient" } as FakeResource;
      },
    };
    const opts = queryOptions(builder);
    await opts.queryFn!({ signal: controller.signal } as never);
    expect(receivedSignal).toBe(controller.signal);
  });
});

describe("mutationOptions", () => {
  it("calls the factory with each invocation's input", async () => {
    let calls = 0;
    const opts = mutationOptions((input: FakeResource) => {
      calls++;
      return fakeUpdate(input);
    });
    await opts.mutationFn!({ id: "a", resourceType: "Patient" });
    await opts.mutationFn!({ id: "b", resourceType: "Patient" });
    expect(calls).toBe(2);
  });

  it("forwards builder errors as the mutation error channel", async () => {
    const opts = mutationOptions<void, never>(() => ({
      compile: () => ({ method: "DELETE" as const, path: "Patient/x", params: [] }),
      execute: async () => {
        throw new Error("boom");
      },
    }));
    await expect(opts.mutationFn!()).rejects.toThrow("boom");
  });
});

describe("mutationOptionsBound", () => {
  it("runs the builder with no input", async () => {
    const builder = {
      compile: () => ({ method: "DELETE" as const, path: "Patient/x", params: [] }),
      execute: async () => "deleted" as const,
    };
    const opts = mutationOptionsBound(builder);
    const result = await opts.mutationFn!();
    expect(result).toBe("deleted");
  });
});

import { describe, expect, it, vi } from "vitest";
import { ReadQueryBuilderImpl } from "./read-query-builder.js";

interface HumanName {
  family?: string;
  given?: string[];
}
type TestSchema = {
  resources: {
    Patient: {
      resourceType: "Patient";
      id?: string;
      name?: HumanName[];
      gender?: "male" | "female" | "other";
    };
    Observation: { resourceType: "Observation"; id?: string };
  };
  searchParams: Record<string, never>;
  includes: Record<string, never>;
  profiles: Record<string, never>;
};

describe("ReadQueryBuilder", () => {
  describe("compile", () => {
    it("compiles a read query with resource type and id", () => {
      const executor = vi.fn();
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);

      const query = builder.compile();

      expect(query.method).toBe("GET");
      expect(query.path).toBe("Patient/123");
      expect(query.params).toEqual([]);
    });

    it("handles different resource types", () => {
      const executor = vi.fn();
      const query = new ReadQueryBuilderImpl<TestSchema, "Observation">("Observation", "abc-456", executor).compile();

      expect(query.path).toBe("Observation/abc-456");
    });
  });

  describe("execute", () => {
    it("calls executor and returns the resource", async () => {
      const patient = { resourceType: "Patient", id: "123", name: [{ family: "Smith" }] };
      const executor = vi.fn(async () => patient);

      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);
      const result = await builder.execute();

      expect(executor).toHaveBeenCalledOnce();
      expect(executor).toHaveBeenCalledWith(
        {
          method: "GET",
          path: "Patient/123",
          params: [],
        },
        undefined,
      );
      expect(result).toEqual(patient);
    });
  });

  describe("composition ($if / $call)", () => {
    it("$if returns the same builder unchanged when condition is false", () => {
      const executor = vi.fn();
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);
      const cb = vi.fn((b: typeof builder) => b);

      const out = builder.$if(false, cb);

      expect(cb).not.toHaveBeenCalled();
      expect(out).toBe(builder);
    });

    it("$if invokes the callback when condition is true", () => {
      const executor = vi.fn();
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);
      const cb = vi.fn((b: typeof builder) => b);

      builder.$if(true, cb);

      expect(cb).toHaveBeenCalledOnce();
      expect(cb).toHaveBeenCalledWith(builder);
    });

    it("$call always invokes the transformer and returns its result", () => {
      const executor = vi.fn();
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);

      const compiled = builder.$call((b) => b.compile());

      expect(compiled.path).toBe("Patient/123");
    });
  });

  describe("transform", () => {
    it("projects the read resource into a typed row", async () => {
      const patient = {
        resourceType: "Patient",
        id: "123",
        name: [{ family: "Smith", given: ["Alice"] }],
        gender: "female",
      };
      const executor = vi.fn(async () => patient);
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);

      const row = await builder
        .transform((t) => ({
          id: t("id", ""),
          family: t("name.0.family", null),
          given: t("name.0.given.0", null),
          gender: t("gender", null),
        }))
        .execute();

      expect(row).toEqual({ id: "123", family: "Smith", given: "Alice", gender: "female" });
    });

    it("falls back to the supplied default when a path is missing", async () => {
      const patient = { resourceType: "Patient", id: "123" }; // no name
      const executor = vi.fn(async () => patient);
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);

      const row = await builder
        .transform((t) => ({
          family: t("name.0.family", null),
          given: t("name.0.given.0", "unknown"),
        }))
        .execute();

      expect(row).toEqual({ family: null, given: "unknown" });
    });

    it("passes signal + prefer through to the executor", async () => {
      const patient = { resourceType: "Patient", id: "123" };
      const executor = vi.fn(async () => patient);
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);
      const ac = new AbortController();

      await builder
        .transform((t) => ({ id: t("id", "") }))
        .execute({ signal: ac.signal, prefer: { return: "representation" } });

      expect(executor).toHaveBeenCalledOnce();
      const call = executor.mock.calls[0] as unknown as [{ headers?: Record<string, string> }, AbortSignal | undefined];
      expect(call[1]).toBe(ac.signal);
      expect(call[0].headers).toMatchObject({ Prefer: "return=representation" });
    });

    it("applies the map callback when the value is present", async () => {
      const patient = { resourceType: "Patient", id: "123", name: [{ family: "smith" }] };
      const executor = vi.fn(async () => patient);
      const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "123", executor);

      const row = await builder
        .transform((t) => ({
          family: t("name.0.family", null, (v) => v.toUpperCase()),
        }))
        .execute();

      expect(row).toEqual({ family: "SMITH" });
    });
  });
});

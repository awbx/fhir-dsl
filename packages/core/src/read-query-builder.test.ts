import { describe, expect, it, vi } from "vitest";
import { ReadQueryBuilderImpl } from "./read-query-builder.js";

type TestSchema = {
  resources: { Patient: { resourceType: "Patient"; id?: string } };
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
      expect(executor).toHaveBeenCalledWith({
        method: "GET",
        path: "Patient/123",
        params: [],
      });
      expect(result).toEqual(patient);
    });
  });
});

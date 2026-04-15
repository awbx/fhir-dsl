import { describe, expect, it, vi } from "vitest";
import { TransactionBuilderImpl } from "./transaction-builder.js";
import type { FhirSchema } from "./types.js";

type TestSchema = FhirSchema;

describe("TransactionBuilder", () => {
  describe("compile", () => {
    it("compiles an empty transaction", () => {
      const executor = vi.fn();
      const bundle = new TransactionBuilderImpl<TestSchema>(executor).compile();

      expect(bundle.resourceType).toBe("Bundle");
      expect(bundle.type).toBe("transaction");
      expect(bundle.entry).toEqual([]);
    });

    it("compiles a create entry", () => {
      const executor = vi.fn();
      const patient = { resourceType: "Patient" as const, name: [{ family: "Smith" }] };

      const bundle = new TransactionBuilderImpl<TestSchema>(executor).create(patient as any).compile();

      expect(bundle.entry).toHaveLength(1);
      expect(bundle.entry![0]!.resource).toEqual(patient);
      expect(bundle.entry![0]!.request).toEqual({
        method: "POST",
        url: "Patient",
      });
    });

    it("compiles an update entry", () => {
      const executor = vi.fn();
      const patient = { resourceType: "Patient" as const, id: "123", name: [{ family: "Doe" }] };

      const bundle = new TransactionBuilderImpl<TestSchema>(executor).update(patient as any).compile();

      expect(bundle.entry).toHaveLength(1);
      expect(bundle.entry![0]!.request).toEqual({
        method: "PUT",
        url: "Patient/123",
      });
    });

    it("compiles a delete entry", () => {
      const executor = vi.fn();

      const bundle = new TransactionBuilderImpl<TestSchema>(executor).delete("Observation", "456").compile();

      expect(bundle.entry).toHaveLength(1);
      expect(bundle.entry![0]!.resource).toBeUndefined();
      expect(bundle.entry![0]!.request).toEqual({
        method: "DELETE",
        url: "Observation/456",
      });
    });

    it("compiles multiple entries in order", () => {
      const executor = vi.fn();
      const patient = { resourceType: "Patient" as const, name: [{ family: "Smith" }] };
      const obs = { resourceType: "Observation" as const, id: "o1", status: "final", code: { text: "BP" } };

      const bundle = new TransactionBuilderImpl<TestSchema>(executor)
        .create(patient as any)
        .update(obs as any)
        .delete("Condition", "c1")
        .compile();

      expect(bundle.entry).toHaveLength(3);
      expect(bundle.entry![0]!.request!.method).toBe("POST");
      expect(bundle.entry![1]!.request!.method).toBe("PUT");
      expect(bundle.entry![2]!.request!.method).toBe("DELETE");
    });
  });

  describe("immutability", () => {
    it("returns a new builder on each method call", () => {
      const executor = vi.fn();
      const builder1 = new TransactionBuilderImpl<TestSchema>(executor);
      const builder2 = builder1.create({ resourceType: "Patient" as const } as any);
      const builder3 = builder2.delete("Patient", "1");

      expect(builder1.compile().entry).toHaveLength(0);
      expect(builder2.compile().entry).toHaveLength(1);
      expect(builder3.compile().entry).toHaveLength(2);
    });
  });

  describe("validation", () => {
    it("throws if update resource has no id", () => {
      const executor = vi.fn();
      const patient = { resourceType: "Patient" as const, name: [{ family: "Smith" }] };

      expect(() => {
        new TransactionBuilderImpl<TestSchema>(executor).update(patient as any);
      }).toThrow("Resource must have an id for update operations");
    });
  });

  describe("execute", () => {
    it("sends the transaction bundle via POST to root", async () => {
      const responseBundle = { resourceType: "Bundle", type: "transaction-response", entry: [] };
      const executor = vi.fn(async () => responseBundle);

      const result = await new TransactionBuilderImpl<TestSchema>(executor)
        .create({ resourceType: "Patient" as const } as any)
        .execute();

      expect(executor).toHaveBeenCalledOnce();
      const call = executor.mock.calls[0]![0]!;
      expect(call.method).toBe("POST");
      expect(call.path).toBe("");
      expect(call.body).toBeDefined();
      expect(call.body.resourceType).toBe("Bundle");
      expect(call.body.type).toBe("transaction");
      expect(result).toEqual(responseBundle);
    });
  });
});

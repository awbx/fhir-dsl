import { describe, expect, it, vi } from "vitest";
import type { CompiledQuery } from "./compiled-query.js";
import { BatchBuilderImpl, TransactionBuilderImpl } from "./transaction-builder.js";

type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id?: string; name?: string[] };
    Observation: { resourceType: "Observation"; id?: string };
    Condition: { resourceType: "Condition"; id?: string };
  };
  searchParams: Record<string, never>;
  includes: Record<string, never>;
  profiles: Record<string, never>;
};

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
      const args = executor.mock.calls[0] as unknown as [CompiledQuery];
      const call = args[0];
      expect(call.method).toBe("POST");
      expect(call.path).toBe("");
      expect(call.body).toBeDefined();
      const body = call.body as Record<string, unknown>;
      expect(body.resourceType).toBe("Bundle");
      expect(body.type).toBe("transaction");
      expect(result).toEqual(responseBundle);
    });
  });
});

describe("BatchBuilder", () => {
  describe("compile", () => {
    it("compiles an empty batch", () => {
      const executor = vi.fn();
      const bundle = new BatchBuilderImpl<TestSchema>(executor).compile();

      expect(bundle.resourceType).toBe("Bundle");
      expect(bundle.type).toBe("batch");
      expect(bundle.entry).toEqual([]);
    });

    it("compiles batch entries with the same fluent API", () => {
      const executor = vi.fn();
      const patient = { resourceType: "Patient" as const, name: [{ family: "Smith" }] };

      const bundle = new BatchBuilderImpl<TestSchema>(executor)
        .create(patient as any)
        .delete("Observation", "456")
        .compile();

      expect(bundle.entry).toHaveLength(2);
      expect(bundle.entry![0]!.request).toEqual({
        method: "POST",
        url: "Patient",
      });
      expect(bundle.entry![1]!.request).toEqual({
        method: "DELETE",
        url: "Observation/456",
      });
    });
  });

  describe("execute", () => {
    it("sends the batch bundle via POST to root", async () => {
      const responseBundle = { resourceType: "Bundle", type: "batch-response", entry: [] };
      const executor = vi.fn(async () => responseBundle);

      const result = await new BatchBuilderImpl<TestSchema>(executor)
        .create({ resourceType: "Patient" as const } as any)
        .execute();

      expect(executor).toHaveBeenCalledOnce();
      const args = executor.mock.calls[0] as unknown as [CompiledQuery];
      const call = args[0];
      expect(call.method).toBe("POST");
      expect(call.path).toBe("");
      expect(call.body).toBeDefined();
      const body = call.body as Record<string, unknown>;
      expect(body.resourceType).toBe("Bundle");
      expect(body.type).toBe("batch");
      expect(result).toEqual(responseBundle);
    });
  });

  describe("composition ($if / $call) — shared by Transaction + Batch", () => {
    it("$if applies the callback when condition is true (transaction)", () => {
      const executor = vi.fn();
      const bundle = new TransactionBuilderImpl<TestSchema>(executor)
        .$if(true, (b) => b.create({ resourceType: "Patient" as const } as any))
        .compile();

      expect(bundle.entry).toHaveLength(1);
      expect(bundle.entry![0]!.request.method).toBe("POST");
    });

    it("$if skips the callback when condition is false (transaction)", () => {
      const executor = vi.fn();
      const cb = vi.fn((b: TransactionBuilderImpl<TestSchema>) =>
        b.create({ resourceType: "Patient" as const } as any),
      );

      const bundle = new TransactionBuilderImpl<TestSchema>(executor).$if(false, cb as any).compile();

      expect(cb).not.toHaveBeenCalled();
      expect(bundle.entry).toEqual([]);
    });

    it("$call composes a reusable bundle fragment across both Transaction and Batch", () => {
      const executor = vi.fn();
      const seedPatient = <T extends { create: (r: any) => T }>(b: T) =>
        b.create({ resourceType: "Patient" as const } as any);

      const tx = new TransactionBuilderImpl<TestSchema>(executor).$call(seedPatient).compile();
      const bx = new BatchBuilderImpl<TestSchema>(executor).$call(seedPatient).compile();

      expect(tx.type).toBe("transaction");
      expect(bx.type).toBe("batch");
      expect(tx.entry).toHaveLength(1);
      expect(bx.entry).toHaveLength(1);
    });

    it("$call can return a non-builder value (e.g. the compiled bundle)", () => {
      const executor = vi.fn();

      const compiled = new TransactionBuilderImpl<TestSchema>(executor)
        .create({ resourceType: "Patient" as const } as any)
        .$call((b) => b.compile());

      expect(compiled.resourceType).toBe("Bundle");
      expect(compiled.entry).toHaveLength(1);
    });
  });
});

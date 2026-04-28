import { describe, expect, it, vi } from "vitest";
import { TerminologyClient } from "../src/terminology-operations.js";

function captureExecutor() {
  const calls: Array<{ method: string; path: string; params: unknown; body: unknown }> = [];
  const executor = vi.fn(async (q: { method: string; path: string; params: unknown; body?: unknown }) => {
    calls.push({ method: q.method, path: q.path, params: q.params, body: q.body });
    return { resourceType: "Parameters", parameter: [] };
  });
  return {
    executor: executor as unknown as Parameters<typeof TerminologyClient.prototype.expand>[0] extends never
      ? never
      : any,
    calls,
  } as { executor: any; calls: typeof calls };
}

describe("TerminologyClient", () => {
  describe("$expand", () => {
    it("posts to ValueSet/$expand with the typed params", async () => {
      const { executor, calls } = captureExecutor();
      const t = new TerminologyClient(executor);
      await t.expand({ url: "http://example/vs/foo", count: 50, filter: "diabetes" }).execute();
      expect(calls).toHaveLength(1);
      expect(calls[0]?.path).toBe("ValueSet/$expand");
      expect(calls[0]?.method).toBe("POST");
      const body = calls[0]?.body as { resourceType: string; parameter: unknown[] };
      expect(body.resourceType).toBe("Parameters");
      expect(body.parameter).toContainEqual({ name: "url", valueString: "http://example/vs/foo" });
      expect(body.parameter).toContainEqual({ name: "count", valueInteger: 50 });
      expect(body.parameter).toContainEqual({ name: "filter", valueString: "diabetes" });
    });

    it("inlines a ValueSet resource when provided", async () => {
      const { executor, calls } = captureExecutor();
      const t = new TerminologyClient(executor);
      await t.expand({ valueSet: { resourceType: "ValueSet", url: "x" } as any }).execute();
      const body = calls[0]?.body as { parameter: unknown[] };
      expect(body.parameter).toContainEqual({ name: "valueSet", resource: { resourceType: "ValueSet", url: "x" } });
    });
  });

  describe("$validate-code", () => {
    it("posts to ValueSet/$validate-code by default", async () => {
      const { executor, calls } = captureExecutor();
      const t = new TerminologyClient(executor);
      await t.validateCode({ url: "http://vs", code: "abc", system: "http://snomed" }).execute();
      expect(calls[0]?.path).toBe("ValueSet/$validate-code");
    });

    it("scopes to CodeSystem when _on is set", async () => {
      const { executor, calls } = captureExecutor();
      const t = new TerminologyClient(executor);
      await t.validateCode({ code: "abc", _on: "CodeSystem" }).execute();
      expect(calls[0]?.path).toBe("CodeSystem/$validate-code");
    });
  });

  describe("$lookup", () => {
    it("emits one parameter entry per requested property", async () => {
      const { executor, calls } = captureExecutor();
      const t = new TerminologyClient(executor);
      await t.lookup({ system: "http://snomed", code: "73211009", property: ["display", "designation"] }).execute();
      expect(calls[0]?.path).toBe("CodeSystem/$lookup");
      const body = calls[0]?.body as { parameter: Array<{ name: string; valueString?: string }> };
      expect(body.parameter.filter((p) => p.name === "property")).toHaveLength(2);
    });
  });

  describe("$translate / $subsumes", () => {
    it("$translate hits ConceptMap/$translate", async () => {
      const { executor, calls } = captureExecutor();
      const t = new TerminologyClient(executor);
      await t.translate({ code: "x", system: "http://snomed", target: "http://icd" }).execute();
      expect(calls[0]?.path).toBe("ConceptMap/$translate");
    });

    it("$subsumes hits CodeSystem/$subsumes", async () => {
      const { executor, calls } = captureExecutor();
      const t = new TerminologyClient(executor);
      await t.subsumes({ system: "http://snomed", codeA: "a", codeB: "b" }).execute();
      expect(calls[0]?.path).toBe("CodeSystem/$subsumes");
    });
  });
});

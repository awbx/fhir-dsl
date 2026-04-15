import { describe, expect, it, vi } from "vitest";
import { FhirExecutor } from "./executor.js";
import { fetchAllPages, paginate } from "./pagination.js";

function createMockExecutor(pages: object[]) {
  let callIndex = 0;
  const fetchFn = vi.fn(async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => pages[callIndex++],
  })) as unknown as typeof globalThis.fetch;

  return new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch: fetchFn });
}

describe("paginate", () => {
  it("yields resources from a single page", async () => {
    const bundle = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [
        { resource: { resourceType: "Patient", id: "1" } },
        { resource: { resourceType: "Patient", id: "2" } },
      ],
    };

    const executor = createMockExecutor([]);
    const pages: any[][] = [];

    for await (const page of paginate(executor, bundle as any)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
    expect(pages[0]).toHaveLength(2);
  });

  it("follows next links across pages", async () => {
    const page1 = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "1" } }],
      link: [{ relation: "next", url: "https://fhir.example.com/Patient?_page=2" }],
    };

    const page2 = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "2" } }],
    };

    const executor = createMockExecutor([page2]);
    const pages: any[][] = [];

    for await (const page of paginate(executor, page1 as any)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(2);
    expect(pages[0]![0]!.id).toBe("1");
    expect(pages[1]![0]!.id).toBe("2");
  });

  it("stops when no next link", async () => {
    const bundle = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "1" } }],
      link: [{ relation: "self", url: "https://fhir.example.com/Patient" }],
    };

    const executor = createMockExecutor([]);
    const pages: any[][] = [];

    for await (const page of paginate(executor, bundle as any)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
  });

  it("handles empty bundle", async () => {
    const bundle = { resourceType: "Bundle", type: "searchset" };
    const executor = createMockExecutor([]);
    const pages: any[][] = [];

    for await (const page of paginate(executor, bundle as any)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(0);
  });
});

describe("fetchAllPages", () => {
  it("collects all resources across pages", async () => {
    const page1 = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "1" } }],
      link: [{ relation: "next", url: "https://fhir.example.com/Patient?_page=2" }],
    };

    const page2 = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [
        { resource: { resourceType: "Patient", id: "2" } },
        { resource: { resourceType: "Patient", id: "3" } },
      ],
    };

    const executor = createMockExecutor([page2]);
    const all = await fetchAllPages(executor, page1 as any);

    expect(all).toHaveLength(3);
    expect(all.map((r: any) => r.id)).toEqual(["1", "2", "3"]);
  });
});

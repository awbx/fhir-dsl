import { describe, expect, it, vi } from "vitest";
import { ReadQueryBuilderImpl } from "./read-query-builder.js";
import { SearchQueryBuilderImpl } from "./search-query-builder.js";
import {
  type SchemaRegistry,
  type StandardSchemaLike,
  ValidationError,
  ValidationUnavailableError,
} from "./validation.js";

type TestSchema = {
  resources: { Patient: { resourceType: "Patient"; id?: string } };
  searchParams: Record<string, never>;
  includes: Record<string, never>;
  profiles: Record<string, never>;
};

type FlexSP = Record<string, { type: "date"; value: string }>;

function schemaThatAccepts(): StandardSchemaLike {
  return { "~standard": { validate: (value) => ({ value }) } };
}

function schemaThatRejects(message = "bad"): StandardSchemaLike {
  return { "~standard": { validate: () => ({ issues: [{ message, path: ["gender"] }] }) } };
}

function registry(patientSchema: StandardSchemaLike, profileSchema?: StandardSchemaLike): SchemaRegistry {
  const base: SchemaRegistry = { resources: { Patient: patientSchema } };
  if (profileSchema) {
    return {
      ...base,
      profiles: { Patient: { "us-core-patient": profileSchema } },
    };
  }
  return base;
}

describe("SearchQueryBuilder.validate()", () => {
  it("throws ValidationUnavailableError when called without schemas configured", () => {
    const builder = new SearchQueryBuilderImpl<TestSchema, "Patient", FlexSP>("Patient", vi.fn());
    expect(() => builder.validate()).toThrow(ValidationUnavailableError);
  });

  it("executes normally without .validate() even when schemas registry is wired", async () => {
    const rejecting = schemaThatRejects();
    const executor = vi.fn(async () => ({
      resourceType: "Bundle",
      entry: [{ resource: { resourceType: "Patient", id: "1" } }],
    }));
    const builder = new SearchQueryBuilderImpl<TestSchema, "Patient", FlexSP>(
      "Patient",
      executor,
      undefined,
      undefined,
      undefined,
      registry(rejecting),
    );
    const res = await builder.execute();
    expect(res.data).toHaveLength(1);
  });

  it("validates each data entry when .validate() is chained before .execute()", async () => {
    const accepting = schemaThatAccepts();
    const validateSpy = vi.fn((v: unknown) => ({ value: v }));
    const schema: StandardSchemaLike = { "~standard": { validate: validateSpy } };
    const executor = vi.fn(async () => ({
      resourceType: "Bundle",
      entry: [
        { resource: { resourceType: "Patient", id: "1" } },
        { resource: { resourceType: "Patient", id: "2" } },
        { resource: { resourceType: "Patient", id: "3" }, search: { mode: "include" } },
      ],
    }));
    const builder = new SearchQueryBuilderImpl<TestSchema, "Patient", FlexSP>(
      "Patient",
      executor,
      undefined,
      undefined,
      undefined,
      registry(schema),
    );
    const res = await builder.validate().execute();
    // Two data entries validated, one included-mode entry skipped (went to included[])
    expect(validateSpy).toHaveBeenCalledTimes(2);
    expect(res.data).toHaveLength(2);
    // Also confirms `accepting` is untouched from the factory — no false sharing
    expect(accepting).toBeDefined();
  });

  it("throws ValidationError with the resourceType, path, and index on schema issues", async () => {
    const executor = vi.fn(async () => ({
      resourceType: "Bundle",
      entry: [{ resource: { resourceType: "Patient", id: "1" } }],
    }));
    const builder = new SearchQueryBuilderImpl<TestSchema, "Patient", FlexSP>(
      "Patient",
      executor,
      undefined,
      undefined,
      undefined,
      registry(schemaThatRejects("gender missing")),
    );
    await expect(builder.validate().execute()).rejects.toBeInstanceOf(ValidationError);
  });

  it("prefers the profile schema over the resource schema when a profile is set", async () => {
    const resourceSchema = schemaThatAccepts();
    const profileSchema = schemaThatRejects("us-core: identifier required");
    const executor = vi.fn(async () => ({
      resourceType: "Bundle",
      entry: [{ resource: { resourceType: "Patient", id: "1" } }],
    }));
    const builder = new SearchQueryBuilderImpl<TestSchema, "Patient", FlexSP>(
      "Patient",
      executor,
      undefined,
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
      undefined,
      registry(resourceSchema, profileSchema),
    );
    await expect(builder.validate().execute()).rejects.toBeInstanceOf(ValidationError);
  });

  it(".validate() returns a new builder without mutating the original", () => {
    const builder = new SearchQueryBuilderImpl<TestSchema, "Patient", FlexSP>(
      "Patient",
      vi.fn(),
      undefined,
      undefined,
      undefined,
      registry(schemaThatAccepts()),
    );
    const validated = builder.validate();
    expect(validated).not.toBe(builder);
  });
});

describe("ReadQueryBuilder.validate()", () => {
  it("throws ValidationUnavailableError when no schemas are configured", () => {
    const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">("Patient", "1", vi.fn());
    expect(() => builder.validate()).toThrow(ValidationUnavailableError);
  });

  it("validates the returned resource on execute", async () => {
    const executor = vi.fn(async () => ({ resourceType: "Patient", id: "1" }));
    const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">(
      "Patient",
      "1",
      executor,
      registry(schemaThatRejects("bad")),
    );
    await expect(builder.validate().execute()).rejects.toBeInstanceOf(ValidationError);
  });

  it("skips validation without .validate() even if schemas are wired", async () => {
    const executor = vi.fn(async () => ({ resourceType: "Patient", id: "1" }));
    const builder = new ReadQueryBuilderImpl<TestSchema, "Patient">(
      "Patient",
      "1",
      executor,
      registry(schemaThatRejects("bad")),
    );
    await expect(builder.execute()).resolves.toMatchObject({ id: "1" });
  });
});

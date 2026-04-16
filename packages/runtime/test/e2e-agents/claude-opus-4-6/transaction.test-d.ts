import { createFhirClient } from "@fhir-dsl/core";
import { describe, it } from "vitest";
import type { TestSchema } from "./schema.js";

const client = createFhirClient<TestSchema>({ baseUrl: "https://example.test/fhir" });

describe("claude-opus-4-6 type-level / transaction builder", () => {
  it("create(resource) accepts any valid TestSchema resource and rejects unknown ones", () => {
    client.transaction().create({ resourceType: "Patient", name: [{ family: "X" }] });
    client.transaction().create({
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "1234-5" }] },
    });

    // @ts-expect-error — `Foo` is not in TestSchema.resources
    client.transaction().create({ resourceType: "Foo" });

    // @ts-expect-error — Observation must have a `status` field
    client.transaction().create({ resourceType: "Observation", code: { coding: [] } });
  });

  it("update(resource) accepts valid typed resources", () => {
    client.transaction().update({
      resourceType: "Patient",
      id: "pat-1",
      name: [{ family: "X" }],
    });
    // @ts-expect-error — `Foo` is not a valid resource type
    client.transaction().update({ resourceType: "Foo", id: "1" });
  });

  it("delete(resourceType, id) constrains resourceType to schema keys", () => {
    client.transaction().delete("Patient", "pat-1");
    client.transaction().delete("Observation", "obs-1");

    // @ts-expect-error — `Foo` is not a valid resource type
    client.transaction().delete("Foo", "1");
    // @ts-expect-error — id must be a string
    client.transaction().delete("Patient", 123);
  });
});

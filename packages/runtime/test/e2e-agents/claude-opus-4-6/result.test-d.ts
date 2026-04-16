import { createFhirClient } from "@fhir-dsl/core";
import { describe, expectTypeOf, it } from "vitest";
import type {
  TestCondition,
  TestObservation,
  TestOrganization,
  TestPatient,
  TestPractitioner,
  TestSchema,
  TestVipPatient,
} from "./schema.js";

const client = createFhirClient<TestSchema>({ baseUrl: "https://example.test/fhir" });

describe("claude-opus-4-6 type-level / SearchResult narrowing", () => {
  it("data[] is typed by the resource type", async () => {
    const result = await client.search("Patient").execute();
    expectTypeOf(result.data).toExtend<TestPatient[]>();
  });

  it("no includes → `included` is the empty tuple type `[]`", async () => {
    const result = await client.search("Patient").execute();
    expectTypeOf(result.included).toEqualTypeOf<[]>();
  });

  it("single include narrows `included` to that resource's array type", async () => {
    const result = await client.search("Patient").include("organization").execute();
    expectTypeOf(result.included).toExtend<TestOrganization[]>();
  });

  it("multiple includes union the included element type", async () => {
    const result = await client.search("Patient").include("organization").include("general-practitioner").execute();

    type Elt = (typeof result)["included"][number];
    expectTypeOf<Elt>().toExtend<TestOrganization | TestPractitioner>();
  });

  it("revinclude adds the source resource to the included union", async () => {
    const result = await client
      .search("Patient")
      .include("organization")
      .revinclude("Observation", "subject")
      .execute();

    type Elt = (typeof result)["included"][number];
    expectTypeOf<Elt>().toExtend<TestOrganization | TestObservation>();
  });

  it("revinclude of Condition narrows to Condition when it's the only revinclude", async () => {
    const result = await client.search("Patient").revinclude("Condition", "subject").execute();
    type Elt = (typeof result)["included"][number];
    expectTypeOf<Elt>().toExtend<TestCondition>();
  });

  it("profile-scoped search narrows `data[]` to the profile type", async () => {
    const result = await client.search("Patient", "vip").execute();
    expectTypeOf(result.data).toExtend<TestVipPatient[]>();
  });

  it("stream() yields the typed primary resource element type", () => {
    const stream = client.search("Patient").stream();
    type YieldType =
      Awaited<ReturnType<ReturnType<(typeof stream)[typeof Symbol.asyncIterator]>["next"]>> extends {
        value: infer V;
      }
        ? V
        : never;
    // The stream yields resources (or undefined on done) — assert it extends TestPatient
    expectTypeOf<YieldType>().toExtend<TestPatient | undefined>();
  });

  it("read() returns the typed resource", async () => {
    const pat = await client.read("Patient", "pat-1").execute();
    expectTypeOf(pat).toExtend<TestPatient>();
  });
});

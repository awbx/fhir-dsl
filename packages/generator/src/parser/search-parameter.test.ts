import { describe, expect, it } from "vitest";
import { parseSearchParameters } from "./search-parameter.js";

describe("parseSearchParameters", () => {
  it("groups search params by resource type", () => {
    const params = [
      {
        resourceType: "SearchParameter" as const,
        url: "http://hl7.org/fhir/SearchParameter/Patient-name",
        name: "name",
        code: "name",
        base: ["Patient"],
        type: "string",
        description: "A patient's name",
      },
      {
        resourceType: "SearchParameter" as const,
        url: "http://hl7.org/fhir/SearchParameter/Patient-birthdate",
        name: "birthdate",
        code: "birthdate",
        base: ["Patient"],
        type: "date",
      },
      {
        resourceType: "SearchParameter" as const,
        url: "http://hl7.org/fhir/SearchParameter/Observation-status",
        name: "status",
        code: "status",
        base: ["Observation"],
        type: "token",
      },
    ];

    const result = parseSearchParameters(params);

    expect(result.size).toBe(2);
    expect(result.get("Patient")!.params).toHaveLength(2);
    expect(result.get("Observation")!.params).toHaveLength(1);
  });

  it("extracts param model fields correctly", () => {
    const params = [
      {
        resourceType: "SearchParameter" as const,
        url: "http://hl7.org/fhir/SearchParameter/Patient-general-practitioner",
        name: "general-practitioner",
        code: "general-practitioner",
        base: ["Patient"],
        type: "reference",
        description: "Patient's nominated general practitioner",
        expression: "Patient.generalPractitioner",
        target: ["Practitioner", "Organization"],
      },
    ];

    const result = parseSearchParameters(params);
    const param = result.get("Patient")!.params[0]!;

    expect(param.name).toBe("general-practitioner");
    expect(param.code).toBe("general-practitioner");
    expect(param.type).toBe("reference");
    expect(param.description).toBe("Patient's nominated general practitioner");
    expect(param.expression).toBe("Patient.generalPractitioner");
    expect(param.targets).toEqual(["Practitioner", "Organization"]);
  });

  it("handles params shared across multiple resources", () => {
    const params = [
      {
        resourceType: "SearchParameter" as const,
        url: "http://hl7.org/fhir/SearchParameter/clinical-date",
        name: "date",
        code: "date",
        base: ["Condition", "Observation", "Encounter"],
        type: "date",
      },
    ];

    const result = parseSearchParameters(params);

    expect(result.size).toBe(3);
    expect(result.get("Condition")!.params).toHaveLength(1);
    expect(result.get("Observation")!.params).toHaveLength(1);
    expect(result.get("Encounter")!.params).toHaveLength(1);
  });

  it("handles empty input", () => {
    const result = parseSearchParameters([]);
    expect(result.size).toBe(0);
  });

  it("accumulates multiple params for the same resource", () => {
    const params = [
      {
        resourceType: "SearchParameter" as const,
        url: "http://example.com/sp1",
        name: "a",
        code: "a",
        base: ["Patient"],
        type: "string",
      },
      {
        resourceType: "SearchParameter" as const,
        url: "http://example.com/sp2",
        name: "b",
        code: "b",
        base: ["Patient"],
        type: "token",
      },
      {
        resourceType: "SearchParameter" as const,
        url: "http://example.com/sp3",
        name: "c",
        code: "c",
        base: ["Patient"],
        type: "date",
      },
    ];

    const result = parseSearchParameters(params);
    expect(result.get("Patient")!.params).toHaveLength(3);
    expect(result.get("Patient")!.params.map((p) => p.code)).toEqual(["a", "b", "c"]);
  });
});

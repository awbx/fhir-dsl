import { describe, expect, it } from "vitest";
import { emitIncludeExpressions, normalizeIncludeExpression } from "./include-expressions-emitter.js";

describe("normalizeIncludeExpression", () => {
  it("strips the resource prefix", () => {
    expect(normalizeIncludeExpression("Encounter.subject", "Encounter")).toEqual({ paths: ["subject"] });
  });

  it("preserves multi-hop paths", () => {
    expect(normalizeIncludeExpression("Encounter.participant.actor", "Encounter")).toEqual({
      paths: ["participant.actor"],
    });
  });

  it("splits `|`-unions and dedupes paths", () => {
    expect(normalizeIncludeExpression("Encounter.subject | Encounter.patient", "Encounter")).toEqual({
      paths: ["subject", "patient"],
    });
    expect(normalizeIncludeExpression("Encounter.subject | Encounter.subject", "Encounter")).toEqual({
      paths: ["subject"],
    });
  });

  it("strips trailing `.where(...)`", () => {
    expect(normalizeIncludeExpression("Encounter.subject.where(resolve() is Patient)", "Encounter")).toEqual({
      paths: ["subject"],
    });
  });

  it("strips `.as(X)` and `.ofType(X)`", () => {
    expect(normalizeIncludeExpression("(Encounter.subject).as(Reference)", "Encounter")).toEqual({
      paths: ["subject"],
    });
    expect(normalizeIncludeExpression("Encounter.subject.ofType(Patient)", "Encounter")).toEqual({
      paths: ["subject"],
    });
  });

  it("strips `.resolve()`", () => {
    expect(normalizeIncludeExpression("Encounter.subject.resolve()", "Encounter")).toEqual({ paths: ["subject"] });
  });

  it("strips trailing `.reference`", () => {
    expect(normalizeIncludeExpression("Observation.subject.reference", "Observation")).toEqual({ paths: ["subject"] });
  });

  it("strips outer parens", () => {
    expect(normalizeIncludeExpression("(Encounter.subject)", "Encounter")).toEqual({ paths: ["subject"] });
  });

  it("returns null for unparseable expressions", () => {
    expect(normalizeIncludeExpression('Encounter.extension("url").value.as(Reference)', "Encounter")).toBeNull();
    expect(normalizeIncludeExpression("Encounter.subject[0]", "Encounter")).toBeNull();
  });

  it("returns null when the expression doesn't start with the given resource", () => {
    expect(normalizeIncludeExpression("Patient.organization", "Encounter")).toBeNull();
  });
});

function makeResource(name: string) {
  return { name, properties: [], description: "" } as never;
}

function makeSearchParams(
  resourceType: string,
  params: Array<{
    name: string;
    code: string;
    type: string;
    targets?: string[] | undefined;
    expression?: string | undefined;
  }>,
) {
  return [resourceType, { resourceType, params }] as const;
}

describe("emitIncludeExpressions", () => {
  it("emits a type + runtime entry for each param with a normalizable expression", () => {
    const resources = [makeResource("Encounter")];
    const searchParams = new Map<string, never>([
      makeSearchParams("Encounter", [
        {
          name: "patient",
          code: "patient",
          type: "reference",
          targets: ["Patient"],
          expression: "Encounter.subject.where(resolve() is Patient)",
        },
        {
          name: "practitioner",
          code: "practitioner",
          type: "reference",
          targets: ["Practitioner"],
          expression: "Encounter.participant.actor",
        },
      ]) as never,
    ]);

    const { typeDecl, runtimeDecl } = emitIncludeExpressions(resources, searchParams);

    expect(typeDecl).toContain("export interface IncludeExpressions");
    expect(typeDecl).toContain("Encounter: {");
    expect(typeDecl).toContain('"patient": "subject"');
    expect(typeDecl).toContain('"practitioner": "participant.actor"');

    expect(runtimeDecl).toContain("export const includeExpressions");
    expect(runtimeDecl).toContain('"patient": "subject"');
    expect(runtimeDecl).toContain('"practitioner": "participant.actor"');
  });

  it("emits union + array for multi-expression params", () => {
    const resources = [makeResource("Encounter")];
    const searchParams = new Map<string, never>([
      makeSearchParams("Encounter", [
        {
          name: "patient",
          code: "patient",
          type: "reference",
          targets: ["Patient"],
          expression: "Encounter.subject | Encounter.patient",
        },
      ]) as never,
    ]);

    const { typeDecl, runtimeDecl } = emitIncludeExpressions(resources, searchParams);

    expect(typeDecl).toContain('"patient": "subject" | "patient"');
    expect(runtimeDecl).toContain('"patient": ["subject", "patient"]');
  });

  it("skips params whose expression can't be mechanically reduced", () => {
    const resources = [makeResource("Observation")];
    const searchParams = new Map<string, never>([
      makeSearchParams("Observation", [
        {
          name: "weird",
          code: "weird",
          type: "reference",
          targets: ["Patient"],
          expression: 'Observation.extension("http://example").value.as(Reference)',
        },
      ]) as never,
    ]);

    const { typeDecl, runtimeDecl } = emitIncludeExpressions(resources, searchParams);

    expect(typeDecl).not.toContain("weird");
    expect(typeDecl).not.toContain("Observation:");
    expect(runtimeDecl).not.toContain("weird");
  });
});

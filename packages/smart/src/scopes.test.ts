import { describe, expect, it } from "vitest";
import { buildScopes, launchScope, offlineAccess, openid, parseScope, resourceScope } from "./scopes.js";

describe("resourceScope", () => {
  it("serializes an object permission map in canonical CRUDS order", () => {
    expect(resourceScope({ context: "patient", resource: "Observation", perms: { r: true, s: true } })).toBe(
      "patient/Observation.rs",
    );
    expect(resourceScope({ context: "user", resource: "Patient", perms: { s: true, r: true } })).toBe(
      "user/Patient.rs",
    );
  });

  it("accepts an array of permissions and sorts/dedupes them", () => {
    expect(resourceScope({ context: "system", resource: "Observation", perms: ["s", "r", "r"] })).toBe(
      "system/Observation.rs",
    );
  });

  it("expands '*' to full CRUDS", () => {
    expect(resourceScope({ context: "system", resource: "*", perms: "*" })).toBe("system/*.cruds");
  });

  it("serializes search params", () => {
    expect(
      resourceScope({
        context: "patient",
        resource: "Observation",
        perms: ["r", "s"],
        params: { category: "vital-signs" },
      }),
    ).toBe("patient/Observation.rs?category=vital-signs");
  });

  it("encodes special chars in params", () => {
    const scope = resourceScope({
      context: "patient",
      resource: "Observation",
      perms: ["r"],
      params: { code: "http://loinc.org|1234-5" },
    });
    expect(scope).toBe("patient/Observation.r?code=http%3A%2F%2Floinc.org%7C1234-5");
  });

  it("handles array-valued params", () => {
    const scope = resourceScope({
      context: "patient",
      resource: "Observation",
      perms: ["r"],
      params: { category: ["vital-signs", "laboratory"] },
    });
    expect(scope).toBe("patient/Observation.r?category=vital-signs&category=laboratory");
  });

  it("throws when no permissions are given", () => {
    expect(() => resourceScope({ context: "patient", resource: "Observation", perms: {} })).toThrow();
    expect(() => resourceScope({ context: "patient", resource: "Observation", perms: [] })).toThrow();
  });
});

describe("launchScope", () => {
  it("returns bare 'launch' without context", () => {
    expect(launchScope()).toBe("launch");
  });
  it("appends a context suffix", () => {
    expect(launchScope("patient")).toBe("launch/patient");
    expect(launchScope("encounter")).toBe("launch/encounter");
  });
});

describe("buildScopes", () => {
  it("joins non-empty parts with spaces", () => {
    expect(
      buildScopes(
        openid,
        "fhirUser",
        launchScope("patient"),
        offlineAccess,
        resourceScope({ context: "patient", resource: "Observation", perms: ["r", "s"] }),
      ),
    ).toBe("openid fhirUser launch/patient offline_access patient/Observation.rs");
  });

  it("flattens arrays and drops falsy values", () => {
    expect(buildScopes(["a", "b"], false, undefined, null, "c", "")).toBe("a b c");
  });
});

describe("parseScope", () => {
  it("parses a v2 resource scope with params", () => {
    const scope = "patient/Observation.rs?category=vital-signs&category=laboratory";
    const parsed = parseScope(scope);
    expect(parsed).toEqual({
      kind: "resource",
      context: "patient",
      resource: "Observation",
      perms: ["r", "s"],
      params: { category: ["vital-signs", "laboratory"] },
    });
  });

  it("parses launch scopes", () => {
    expect(parseScope("launch")).toEqual({ kind: "launch" });
    expect(parseScope("launch/patient")).toEqual({ kind: "launch", context: "patient" });
    expect(parseScope("launch/encounter")).toEqual({ kind: "launch", context: "encounter" });
  });

  it("falls back to simple for OIDC and refresh scopes", () => {
    expect(parseScope("openid")).toEqual({ kind: "simple", name: "openid" });
    expect(parseScope("offline_access")).toEqual({ kind: "simple", name: "offline_access" });
  });

  it("round-trips with resourceScope", () => {
    const inputs = [
      { context: "patient" as const, resource: "Observation", perms: ["r", "s"] as const },
      { context: "system" as const, resource: "*", perms: ["c", "r", "u", "d", "s"] as const },
      { context: "user" as const, resource: "Patient", perms: ["r"] as const },
    ];
    for (const i of inputs) {
      const s = resourceScope({ context: i.context, resource: i.resource, perms: [...i.perms] });
      const parsed = parseScope(s);
      expect(parsed.kind).toBe("resource");
      if (parsed.kind === "resource") {
        expect(parsed.context).toBe(i.context);
        expect(parsed.resource).toBe(i.resource);
        expect(parsed.perms).toEqual([...i.perms]);
      }
    }
  });
});

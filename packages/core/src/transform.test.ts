import { afterEach, describe, expect, it } from "vitest";
import {
  buildIncludedMap,
  collectActivatedExpressions,
  compilePath,
  makeT,
  registerTHelper,
  unregisterTHelper,
  walkPath,
} from "./transform.js";

function makeIncluded(...resources: unknown[]) {
  return buildIncludedMap(resources);
}

describe("compilePath", () => {
  it("splits on dots", () => {
    expect(compilePath("a.b.c").segments).toEqual(["a", "b", "c"]);
  });

  it("preserves numeric segments", () => {
    expect(compilePath("participant.0.actor").segments).toEqual(["participant", "0", "actor"]);
  });

  it("handles single segment", () => {
    expect(compilePath("status").segments).toEqual(["status"]);
  });
});

describe("walkPath", () => {
  const empty = new Set<string>();
  const emptyMap = new Map<string, unknown>();

  it("reads a top-level field", () => {
    const root = { status: "finished" };
    expect(walkPath(root, compilePath("status"), empty, emptyMap)).toBe("finished");
  });

  it("walks nested paths", () => {
    const root = { subject: { reference: "Patient/123", type: "Patient" } };
    expect(walkPath(root, compilePath("subject.reference"), empty, emptyMap)).toBe("Patient/123");
  });

  it("indexes into arrays with explicit numeric segments", () => {
    const root = { participant: [{ actor: { reference: "Practitioner/p1" } }] };
    expect(walkPath(root, compilePath("participant.0.actor.reference"), empty, emptyMap)).toBe("Practitioner/p1");
  });

  it("returns undefined for out-of-bounds index", () => {
    const root = { name: [] as unknown[] };
    expect(walkPath(root, compilePath("name.0.given.0"), empty, emptyMap)).toBeUndefined();
  });

  it("returns undefined when a segment is missing", () => {
    const root = { status: "finished" };
    expect(walkPath(root, compilePath("subject.reference"), empty, emptyMap)).toBeUndefined();
  });

  it("returns undefined for named access against an array", () => {
    const root = { name: [{ given: ["Ada"] }] };
    expect(walkPath(root, compilePath("name.given"), empty, emptyMap)).toBeUndefined();
  });

  it("dereferences through an activated expression", () => {
    const patient = { resourceType: "Patient", id: "p1", name: [{ given: ["Ada"], family: "Lovelace" }] };
    const included = makeIncluded(patient);
    const activated = new Set(["subject"]);
    const root = { subject: { reference: "Patient/p1" } };
    expect(walkPath(root, compilePath("subject.name.0.given.0"), activated, included)).toBe("Ada");
  });

  it("does NOT dereference when the next segment is a Reference structural field", () => {
    const patient = { resourceType: "Patient", id: "p1", name: [{ family: "Lovelace" }] };
    const included = makeIncluded(patient);
    const activated = new Set(["subject"]);
    const root = { subject: { reference: "Patient/p1", type: "Patient" } };
    expect(walkPath(root, compilePath("subject.reference"), activated, included)).toBe("Patient/p1");
    expect(walkPath(root, compilePath("subject.type"), activated, included)).toBe("Patient");
  });

  it("returns fallback (undefined) when the referenced resource is not in the bundle", () => {
    const activated = new Set(["subject"]);
    const root = { subject: { reference: "Patient/missing" } };
    expect(walkPath(root, compilePath("subject.name.0.given.0"), activated, new Map())).toBeUndefined();
  });

  it("does not dereference when the path is not activated", () => {
    const patient = { resourceType: "Patient", id: "p1", name: [{ family: "Lovelace" }] };
    const included = makeIncluded(patient);
    const root = { subject: { reference: "Patient/p1" } };
    // No activated expressions — subject.name walks the Reference, which
    // doesn't have a `name` field, so we get undefined.
    expect(walkPath(root, compilePath("subject.name.0.family"), new Set(), included)).toBeUndefined();
  });

  it("dereferences through a nested expression like participant.actor", () => {
    const practitioner = { resourceType: "Practitioner", id: "pr1", name: [{ family: "Turing" }] };
    const included = makeIncluded(practitioner);
    const activated = new Set(["participant.actor"]);
    const root = { participant: [{ actor: { reference: "Practitioner/pr1" } }] };
    expect(walkPath(root, compilePath("participant.0.actor.name.0.family"), activated, included)).toBe("Turing");
  });

  it("numeric-segment canonicalization — numeric indices don't contribute to canonical path", () => {
    // This is the central invariant: participant.0.actor matches the canonical
    // expression "participant.actor" even though the runtime path has an index.
    const practitioner = { resourceType: "Practitioner", id: "pr1", name: [{ family: "Turing" }] };
    const included = makeIncluded(practitioner);
    const activated = new Set(["participant.actor"]);
    const root = { participant: [{ actor: { reference: "Practitioner/pr1" } }] };
    expect(walkPath(root, compilePath("participant.0.actor.name.0.family"), activated, included)).toBe("Turing");
  });
});

describe("buildIncludedMap", () => {
  it("keys entries by 'ResourceType/id'", () => {
    const map = buildIncludedMap([
      { resourceType: "Patient", id: "p1" },
      { resourceType: "Observation", id: "o1" },
    ]);
    expect(map.has("Patient/p1")).toBe(true);
    expect(map.has("Observation/o1")).toBe(true);
  });

  it("skips entries without both resourceType and id", () => {
    const map = buildIncludedMap([{ resourceType: "Patient" }, { id: "p1" }, null, undefined, "not an object"]);
    expect(map.size).toBe(0);
  });
});

describe("collectActivatedExpressions", () => {
  it("returns empty set when no expressions are defined", () => {
    expect(collectActivatedExpressions(undefined, ["patient"]).size).toBe(0);
  });

  it("maps active params to their expressions", () => {
    const exprs = { patient: "subject", practitioner: "participant.actor" };
    const set = collectActivatedExpressions(exprs, ["patient", "practitioner"]);
    expect(set.has("subject")).toBe(true);
    expect(set.has("participant.actor")).toBe(true);
  });

  it("ignores inactive params", () => {
    const exprs = { patient: "subject", practitioner: "participant.actor" };
    const set = collectActivatedExpressions(exprs, ["patient"]);
    expect(set.has("subject")).toBe(true);
    expect(set.has("participant.actor")).toBe(false);
  });

  it("splits multi-expression params (array) into each entry", () => {
    const exprs = { patient: ["subject", "patient"] as const };
    const set = collectActivatedExpressions(exprs, ["patient"]);
    expect(set.has("subject")).toBe(true);
    expect(set.has("patient")).toBe(true);
  });
});

describe("makeT — t() callable", () => {
  it("returns the value at the path", () => {
    const t = makeT<{ status: string }>({ status: "finished" }, new Set(), new Map(), new Map());
    expect(t("status", null)).toBe("finished");
  });

  it("returns the fallback when the path is missing", () => {
    const t = makeT<{ status?: string }>({}, new Set(), new Map(), new Map());
    expect(t("status", "unknown")).toBe("unknown");
  });

  it("returns the fallback when the path value is null", () => {
    const t = makeT<{ status: string | null }>({ status: null }, new Set(), new Map(), new Map());
    expect(t("status", "fallback")).toBe("fallback");
  });

  it("applies the map function when the value is present", () => {
    const t = makeT<{ count: number }>({ count: 3 }, new Set(), new Map(), new Map());
    expect(t("count", 0, (n) => n * 10)).toBe(30);
  });

  it("does NOT call map when the path is missing — returns fallback directly", () => {
    let called = false;
    const t = makeT<{ count?: number }>({}, new Set(), new Map(), new Map());
    t("count", 0, (n) => {
      called = true;
      return n * 10;
    });
    expect(called).toBe(false);
  });
});

type RefScope = { subject: { reference: string; type?: string } };

describe("makeT — t.ref", () => {
  it("strips the 'ResourceType/' prefix", () => {
    const t = makeT<RefScope>({ subject: { reference: "Patient/123" } }, new Set(), new Map(), new Map());
    expect(t.ref("subject.reference")).toBe("123");
  });

  it("returns null when the path is missing", () => {
    const t = makeT<RefScope>({}, new Set(), new Map(), new Map());
    expect(t.ref("subject.reference")).toBeNull();
  });

  it("handles a reference string that has no '/'", () => {
    const t = makeT<RefScope>({ subject: { reference: "bareid" } }, new Set(), new Map(), new Map());
    expect(t.ref("subject.reference")).toBe("bareid");
  });

  it("accepts a path that resolves to a Reference object directly", () => {
    const t = makeT<RefScope>({ subject: { reference: "Patient/123" } }, new Set(), new Map(), new Map());
    expect(t.ref("subject")).toBe("123");
  });
});

type CodingScope = { code: { coding?: Array<{ system?: string; code?: string }> } };

describe("makeT — t.coding", () => {
  it("returns the code of the first entry with a matching system", () => {
    const t = makeT<CodingScope>(
      {
        code: {
          coding: [
            { system: "http://loinc.org", code: "1234-5" },
            { system: "http://snomed.info/sct", code: "999" },
          ],
        },
      },
      new Set(),
      new Map(),
      new Map(),
    );
    expect(t.coding("code.coding", "http://snomed.info/sct")).toBe("999");
  });

  it("returns null when no entry matches", () => {
    const t = makeT<CodingScope>(
      { code: { coding: [{ system: "http://loinc.org", code: "1234-5" }] } },
      new Set(),
      new Map(),
      new Map(),
    );
    expect(t.coding("code.coding", "http://snomed.info/sct")).toBeNull();
  });

  it("returns null when the path is missing", () => {
    const t = makeT<CodingScope>({}, new Set(), new Map(), new Map());
    expect(t.coding("code.coding", "http://loinc.org")).toBeNull();
  });

  it("returns null when the value isn't an array", () => {
    // Cast because this is a runtime-malformed fixture, not a typed path
    const t = makeT<CodingScope>({ code: { coding: "not-an-array" } } as never, new Set(), new Map(), new Map());
    expect(t.coding("code.coding", "x")).toBeNull();
  });
});

type TelecomScope = { telecom?: Array<{ system?: string; value?: string }> };

describe("makeT — t.valueOf", () => {
  it("returns the value of the first entry with a matching system", () => {
    const t = makeT<TelecomScope>(
      {
        telecom: [
          { system: "phone", value: "555-1234" },
          { system: "email", value: "a@b.com" },
        ],
      },
      new Set(),
      new Map(),
      new Map(),
    );
    expect(t.valueOf("telecom", "email")).toBe("a@b.com");
  });

  it("returns null when no entry matches", () => {
    const t = makeT<TelecomScope>({ telecom: [{ system: "phone", value: "x" }] }, new Set(), new Map(), new Map());
    expect(t.valueOf("telecom", "email")).toBeNull();
  });
});

type GenderScope = { gender: string };

describe("makeT — t.enum", () => {
  it("returns the mapped value when the key is in the plain object table", () => {
    const t = makeT<GenderScope>({ gender: "male" }, new Set(), new Map(), new Map());
    expect(t.enum("gender", { male: "M", female: "F" }, "U")).toBe("M");
  });

  it("returns the fallback when the key is missing", () => {
    const t = makeT<GenderScope>({ gender: "other" }, new Set(), new Map(), new Map());
    expect(t.enum("gender", { male: "M", female: "F" }, "U")).toBe("U");
  });

  it("accepts a Map as the table", () => {
    const t = makeT<GenderScope>({ gender: "female" }, new Set(), new Map(), new Map());
    const table = new Map([
      ["male", "M"],
      ["female", "F"],
    ]);
    expect(t.enum("gender", table, "U")).toBe("F");
  });

  it("returns fallback when the path doesn't resolve to a string", () => {
    const t = makeT<GenderScope>({ gender: 123 } as never, new Set(), new Map(), new Map());
    expect(t.enum("gender", { "123": "X" }, "U")).toBe("U");
  });
});

describe("TExtensions — registerTHelper / unregisterTHelper", () => {
  afterEach(() => {
    unregisterTHelper("age");
    unregisterTHelper("derefGender");
  });

  it("mounts a registered helper onto every t closure", () => {
    registerTHelper("age", (ctx, ...args) => {
      const path = args[0] as string;
      const v = ctx.walk(path);
      if (typeof v !== "string") return null;
      return 2026 - Number.parseInt(v.slice(0, 4), 10);
    });

    const t = makeT({ birthDate: "1990-01-01" }, new Set(), new Map(), new Map()) as ReturnType<typeof makeT> & {
      age: (path: string) => number | null;
    };
    expect(t.age("birthDate")).toBe(36);
  });

  it("unregister removes the helper from future t closures", () => {
    registerTHelper("age", () => 42);
    unregisterTHelper("age");
    const t = makeT({}, new Set(), new Map(), new Map()) as ReturnType<typeof makeT> & { age?: () => unknown };
    expect(t.age).toBeUndefined();
  });

  it("passes walker ctx to the helper so it can do bundle-aware lookups", () => {
    const patient = { resourceType: "Patient", id: "p1", gender: "male" };
    const included = buildIncludedMap([patient]);
    registerTHelper("derefGender", (ctx) => {
      const v = ctx.walk("subject.gender");
      return typeof v === "string" ? v : null;
    });

    const t = makeT({ subject: { reference: "Patient/p1" } }, new Set(["subject"]), included, new Map()) as ReturnType<
      typeof makeT
    > & { derefGender: () => string | null };
    expect(t.derefGender()).toBe("male");
  });
});

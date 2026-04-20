/**
 * Acceptance test for `.transform(fn)` on `SearchQueryBuilder`.
 *
 * Exercises the full wire: stub fetch → Bundle with match + include entries →
 * builder chain with `.include()` calls → `.transform(t => ({...}))` → row
 * shape assertions. Covers the auto-dereferencing contract end-to-end.
 */

import { describe, expect, it } from "vitest";
import { createFhirClient } from "../src/fhir-client.js";

const BASE = "https://example.org/fhir";

function oneShotFetch(body: unknown): typeof globalThis.fetch {
  const fn = async (_url: string | URL | Request, _init?: RequestInit) =>
    ({
      status: 200,
      statusText: "OK",
      ok: true,
      headers: new Headers(),
      json: async () => body,
      text: async () => JSON.stringify(body),
    }) as unknown as Response;
  return fn as unknown as typeof globalThis.fetch;
}

// --- Minimal test schema mirroring the Encounter acceptance scenario ---

interface HumanName {
  family?: string;
  given?: string[];
}

interface Reference<_T extends string = string> {
  reference?: string;
  type?: string;
  display?: string;
}

interface Patient {
  resourceType: "Patient";
  id?: string;
  name?: HumanName[];
}

interface Practitioner {
  resourceType: "Practitioner";
  id?: string;
  name?: HumanName[];
}

interface Organization {
  resourceType: "Organization";
  id?: string;
  name?: string;
}

interface Encounter {
  resourceType: "Encounter";
  id?: string;
  status?: "planned" | "arrived" | "in-progress" | "finished";
  subject?: Reference<"Patient">;
  participant?: Array<{ actor?: Reference<"Practitioner"> }>;
  serviceProvider?: Reference<"Organization">;
}

type TestSchema = {
  resources: {
    Encounter: Encounter;
    Patient: Patient;
    Practitioner: Practitioner;
    Organization: Organization;
  };
  searchParams: {
    Encounter: {
      status: { type: "token"; value: string };
    };
  };
  includes: {
    Encounter: {
      patient: "Patient";
      practitioner: "Practitioner";
      "service-provider": "Organization";
    };
  };
  revIncludes: Record<string, Record<string, string>>;
  includeExpressions: {
    Encounter: {
      patient: "subject";
      practitioner: "participant.actor";
      "service-provider": "serviceProvider";
    };
  };
  profiles: Record<string, never>;
};

const includeExpressions = {
  Encounter: {
    patient: "subject",
    practitioner: "participant.actor",
    "service-provider": "serviceProvider",
  },
};

function makeBundle(opts: { encounter: Encounter; included?: Array<Patient | Practitioner | Organization> }) {
  const entries: Array<{ resource: unknown; search: { mode: "match" | "include" } }> = [
    { resource: opts.encounter, search: { mode: "match" } },
  ];
  for (const r of opts.included ?? []) {
    entries.push({ resource: r, search: { mode: "include" } });
  }
  return {
    resourceType: "Bundle",
    type: "searchset",
    entry: entries,
  };
}

describe(".transform() — acceptance", () => {
  it("dereferences .include()d resources through dotted paths", async () => {
    const encounter: Encounter = {
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      participant: [{ actor: { reference: "Practitioner/pr-1" } }],
      serviceProvider: { reference: "Organization/org-1" },
    };
    const patient: Patient = {
      resourceType: "Patient",
      id: "pat-1",
      name: [{ given: ["Ada"], family: "Lovelace" }],
    };
    const practitioner: Practitioner = {
      resourceType: "Practitioner",
      id: "pr-1",
      name: [{ given: ["Alan"], family: "Turing" }],
    };
    const organization: Organization = {
      resourceType: "Organization",
      id: "org-1",
      name: "St. Vincent's",
    };

    const fetchFn = oneShotFetch(makeBundle({ encounter, included: [patient, practitioner, organization] }));
    const client = createFhirClient<TestSchema>({ baseUrl: BASE, fetch: fetchFn, includeExpressions });

    const result = await client
      .search("Encounter")
      .include("patient")
      .include("practitioner")
      .include("service-provider")
      .transform((t) => ({
        id: t("id", null),
        status: t("status", "unknown"),
        patientId: t.ref("subject.reference"),
        patient: {
          firstName: t("subject.name.0.given.0", null),
          lastName: t("subject.name.0.family", null),
        },
        practitioner: {
          firstName: t("participant.0.actor.name.0.given.0", null),
          lastName: t("participant.0.actor.name.0.family", null),
        },
        organization: {
          name: t("serviceProvider.name", null),
        },
      }))
      .execute();

    expect(result.data).toEqual([
      {
        id: "enc-1",
        status: "finished",
        patientId: "pat-1",
        patient: { firstName: "Ada", lastName: "Lovelace" },
        practitioner: { firstName: "Alan", lastName: "Turing" },
        organization: { name: "St. Vincent's" },
      },
    ]);
  });

  it("falls back gracefully when a referenced resource isn't in the bundle", async () => {
    const encounter: Encounter = {
      resourceType: "Encounter",
      id: "enc-2",
      status: "planned",
      subject: { reference: "Patient/missing" },
    };
    const fetchFn = oneShotFetch(makeBundle({ encounter, included: [] }));
    const client = createFhirClient<TestSchema>({ baseUrl: BASE, fetch: fetchFn, includeExpressions });

    const result = await client
      .search("Encounter")
      .include("patient")
      .transform((t) => ({
        firstName: t("subject.name.0.given.0", null),
        lastName: t("subject.name.0.family", null),
        patientId: t.ref("subject.reference"),
      }))
      .execute();

    expect(result.data).toEqual([{ firstName: null, lastName: null, patientId: "missing" }]);
  });

  it("does not dereference when .include() is not called — subject stays a Reference", async () => {
    const encounter: Encounter = {
      resourceType: "Encounter",
      id: "enc-3",
      status: "finished",
      subject: { reference: "Patient/pat-1", type: "Patient", display: "Ada Lovelace" },
    };
    const patient: Patient = {
      resourceType: "Patient",
      id: "pat-1",
      name: [{ given: ["Ada"], family: "Lovelace" }],
    };

    const fetchFn = oneShotFetch(makeBundle({ encounter, included: [patient] }));
    const client = createFhirClient<TestSchema>({ baseUrl: BASE, fetch: fetchFn, includeExpressions });

    // No .include("patient") — subject remains Reference-only in Scope. Only
    // the Reference structural fields are readable.
    const result = await client
      .search("Encounter")
      .transform((t) => ({
        refId: t.ref("subject.reference"),
        refType: t("subject.type", null),
        display: t("subject.display", null),
      }))
      .execute();

    expect(result.data).toEqual([{ refId: "pat-1", refType: "Patient", display: "Ada Lovelace" }]);
  });

  it("stream() yields each transformed row", async () => {
    const encounter: Encounter = {
      resourceType: "Encounter",
      id: "enc-4",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
    };
    const patient: Patient = {
      resourceType: "Patient",
      id: "pat-1",
      name: [{ family: "Lovelace" }],
    };
    const fetchFn = oneShotFetch(makeBundle({ encounter, included: [patient] }));
    const client = createFhirClient<TestSchema>({ baseUrl: BASE, fetch: fetchFn, includeExpressions });

    const rows: Array<{ id: string | null; last: string | null }> = [];
    for await (const row of client
      .search("Encounter")
      .include("patient")
      .transform((t) => ({ id: t("id", null), last: t("subject.name.0.family", null) }))
      .stream()) {
      rows.push(row);
    }
    expect(rows).toEqual([{ id: "enc-4", last: "Lovelace" }]);
  });

  it("type proof: omitting .include('patient') makes subject.name paths fail to compile", async () => {
    const encounter: Encounter = {
      resourceType: "Encounter",
      id: "enc-5",
      subject: { reference: "Patient/pat-1" },
    };
    const fetchFn = oneShotFetch(makeBundle({ encounter }));
    const client = createFhirClient<TestSchema>({ baseUrl: BASE, fetch: fetchFn, includeExpressions });

    await client
      .search("Encounter")
      .transform((t) => ({
        // @ts-expect-error — subject.name is only reachable when .include("patient") activates the Patient union
        first: t("subject.name.0.given.0", null),
      }))
      .execute();
  });
});

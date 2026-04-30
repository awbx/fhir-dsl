import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';
import styles from './index.module.css';

const WALKTHROUGH_VIDEO_URL =
  'https://github.com/user-attachments/assets/64947e51-cdd0-41fc-b7e0-01d68009ffc8';

const EXAMPLES = [
  {
    id: 'search',
    label: 'Search',
    code: `const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .include("general-practitioner")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// result.data: Patient[]   — fully typed
// result.included: Practitioner[]`,
  },
  {
    id: 'profile',
    label: 'US Core Profile',
    code: `const vitals = await fhir
  .search(
    "Observation",
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs"
  )
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .sort("date", "desc")
  .execute();

// vitals.data: USCoreVitalSignsProfile[]
// — profile constraints enforced at compile time`,
  },
  {
    id: 'chained',
    label: 'Chained & _has',
    code: `// Patients who have a blood-pressure observation
const patients = await fhir
  .search("Patient")
  .has("Observation", "subject", "code", "eq", "http://loinc.org|85354-9")
  .where("active", "eq", "true")
  .execute();

// Observations whose patient is named "Smith"
const obs = await fhir
  .search("Observation")
  .whereChained("subject", "Patient", "family", "eq", "Smith")
  .where("status", "eq", "final")
  .execute();`,
  },
  {
    id: 'transaction',
    label: 'Transaction',
    code: `const bundle = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
    gender: "female",
    birthDate: "1990-01-15",
  })
  .create({
    resourceType: "Observation",
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: "8302-2" }] },
    valueQuantity: { value: 165, unit: "cm" },
  })
  .execute();`,
  },
  {
    id: 'stream',
    label: 'Stream',
    code: `// Iterate across every page without loading it all into memory
for await (const patient of fhir
  .search("Patient")
  .where("active", "eq", "true")
  .count(100) // page size
  .stream()
) {
  console.log(patient.id, patient.name?.[0]?.family);
}`,
  },
  {
    id: 'fhirpath',
    label: 'FHIRPath',
    code: `import { fhirpath } from "@fhir-dsl/fhirpath";
import type { Patient, Observation } from "./fhir/r4";

// Compile a path — autocomplete at every step.
fhirpath<Patient>("Patient").name.family.compile();
// → "Patient.name.family"

// Predicate expressions with $this, chained functions.
fhirpath<Patient>("Patient")
  .name.where($this => $this.use.eq("official"))
  .family.first()
  .compile();
// → "Patient.name.where($this.use = 'official').family.first()"

// Polymorphic value[x] narrowed via ofType().
fhirpath<Observation>("Observation")
  .value.ofType("Quantity").value
  .compile();
// → "Observation.value.ofType(Quantity).value"

// Evaluate against a live resource.
const families = fhirpath<Patient>("Patient")
  .name.select($this => $this.family)
  .evaluate(patient);
// families: string[]`,
  },
  {
    id: 'terminology',
    label: 'Terminology',
    code: `// After \`fhir-gen --expand-valuesets --resolve-codesystems\`,
// every FHIR-bound code field is typed to its ValueSet.

import type { Patient, Condition } from "./fhir/r4";
import { AdministrativeGender } from "./fhir/r4";

const patient: Patient = {
  resourceType: "Patient",
  gender: AdministrativeGender.Female, // "female"
  //      ^ autocomplete: Male | Female | Other | Unknown
};

// Required binding → closed union, bad codes caught at compile time.
const bad: Patient = {
  resourceType: "Patient",
  gender: "banana",
  //      ~~~~~~~~ Type '"banana"' is not assignable to 'AdministrativeGender'
};

// Extensible binding → known codes autocomplete, custom strings still compile.
const condition: Condition = {
  resourceType: "Condition",
  clinicalStatus: {
    coding: [{ code: "active" }], // ConditionClinical | (string & {})
  },
  subject: { reference: "Patient/123" },
};

// Typed search-param values flow through the query builder too.
await fhir
  .search("Patient")
  .where("gender", "eq", "female") // ✓ — unknown codes rejected
  .execute();`,
  },
  {
    id: 'cli',
    label: 'CLI',
    lang: 'bash',
    code: `# Generate R4 types + US Core profiles + typed ValueSets +
# CodeSystem namespaces + markdown specs (LLM context).
npx @fhir-dsl/cli generate \\
  --version r4 \\
  --ig hl7.fhir.us.core@6.1.0 \\
  --expand-valuesets \\
  --resolve-codesystems \\
  --include-spec \\
  --out ./src/fhir

# Output layout:
#   ./src/fhir/r4/
#     client.ts              createClient({ baseUrl }) — pre-typed
#     resources/*.ts         Patient, Observation, Encounter, …
#     profiles/*.ts          USCorePatientProfile, USCoreVitalSignsProfile, …
#     terminology/           AdministrativeGender, ObservationStatus, …
#     spec/                  markdown per resource + profile

# Wire it into your build:
#   "scripts": {
#     "generate:fhir": "fhir-gen generate --version r4 --out ./src/fhir",
#     "build": "pnpm generate:fhir && tsc"
#   }

# Then in application code:
#   import { createClient } from "./src/fhir/r4";
#   const fhir = createClient({ baseUrl: "https://hapi.fhir.org/baseR4" });`,
  },
  {
    id: 'complete',
    label: 'Complete Workflow',
    code: `// Every DSL feature in one pass — profiles, _has, chaining,
// includes, composites, projection, transactions, streaming.

// 1) Cohort: active US Core patients born before 1970 who have a
//    blood-pressure reading, whose GP is named "Smith" — with care
//    team, conditions, and meds included in a single round-trip.
const cohort = await fhir
  .search(
    "Patient",
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
  )
  .where("active", "eq", "true")
  .where("birthdate", "le", "1970-01-01")
  .has("Observation", "subject", "code", "eq", "http://loinc.org|8480-6")
  .whereChained("general-practitioner", "Practitioner", "family", "eq", "Smith")
  .include("general-practitioner")
  .revinclude("Condition", "subject")
  .revinclude("MedicationRequest", "subject")
  .select(["id", "name", "birthDate", "address"])
  .sort("family", "asc")
  .count(50)
  .execute();

const patientId = cohort.data[0].id!;

// 2) Drill into elevated systolic readings via a composite param.
const elevated = await fhir
  .search("Observation")
  .where("patient", "eq", \`Patient/\${patientId}\`)
  .whereComposite("code-value-quantity", {
    code: "http://loinc.org|8480-6",
    "value-quantity": "gt140",
  })
  .sort("date", "desc")
  .execute();

// 3) Atomic write-back — tag the patient, retire an old task,
//    open a follow-up. All succeed or none do.
await fhir
  .transaction()
  .update({
    resourceType: "Patient",
    id: patientId,
    active: true,
    meta: { tag: [{ code: "htn-follow-up" }] },
  })
  .delete("Task", "old-followup-task")
  .create({
    resourceType: "Task",
    status: "requested",
    intent: "order",
    for: { reference: \`Patient/\${patientId}\` },
    description: "Schedule hypertension follow-up",
  })
  .execute();

// 4) Stream the full active cohort for bulk export — paged, constant memory.
for await (const p of fhir
  .search("Patient")
  .where("active", "eq", "true")
  .count(200)
  .stream()) {
  await exportToWarehouse(p);
}`,
  },
];

const FEATURES = [
  {
    title: 'Type-Safe Queries',
    desc: 'Every resource, search parameter, operator, modifier, include, _has, and chained hop is validated at compile time. No malformed FHIR queries at runtime.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.6 1.97" />
      </svg>
    ),
  },
  {
    title: 'Code Generation',
    desc: 'Generate TypeScript interfaces, profile schemas, ValueSet enums, and FHIRPath builders from any FHIR version (R4 / R4B / R5 / R6) or any published IG.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Profile-Aware',
    desc: 'Query US Core, IPS, or any custom IG with automatic type narrowing. Slicing, typed extensions, and profile cardinality all enforced by the type system.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Standard Schema Validators',
    desc: 'Optional zod or zero-dep native validators conforming to Standard Schema V1, with FHIRPath invariants (pat-1, dom-3, …) wired in automatically.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'FHIRPath Builder',
    desc: 'Type-safe FHIRPath expressions with autocomplete at every step, compilation to FHIRPath strings, and runtime evaluation. 70+ functions across the N1 spec.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3l4 18" />
        <path d="M19 3l-4 18" />
        <path d="M3 8h18" />
        <path d="M3 16h18" />
      </svg>
    ),
  },
  {
    title: 'SMART on FHIR v2',
    desc: 'PKCE-S256, backend-services JWT (RS384 / ES384), patient-launch refresh-token rotation. Lazy-loaded — bearer-only deployments never pay the jose cost.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Terminology Engine',
    desc: 'is-a, descendent-of, and regex ValueSet filters with transitive subsumption. Bundled $expand, $validate-code, $lookup, $translate, $subsumes operations.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="M12 9v3" />
        <path d="M9 16l-2-1" />
        <path d="M15 16l2-1" />
      </svg>
    ),
  },
  {
    title: 'MCP Server (LLM bridge)',
    desc: 'Generated tool surface for any LLM agent, with stdio + streamable HTTP transports, three pluggable auth strategies, write gating, and full audit.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    ),
  },
  {
    title: 'Zero Runtime Overhead',
    desc: 'The core DSL has no runtime dependencies beyond @fhir-dsl/types. Dual ESM/CJS. Type safety compiles away to plain objects.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

const STATS = [
  { value: '4', label: 'FHIR Versions', sub: 'R4 · R4B · R5 · R6' },
  { value: '10', label: 'Workspace Packages', sub: 'core · runtime · cli · …' },
  { value: '70+', label: 'FHIRPath Functions', sub: 'N1 spec coverage' },
  { value: '1.6K+', label: 'Tests Passing', sub: 'lint · typecheck · vitest' },
];

const PACKAGES = [
  {
    name: '@fhir-dsl/core',
    desc: 'Query builder DSL — search, read, batch, transactions, terminology ops, capability guard.',
    accent: 'blue',
  },
  {
    name: '@fhir-dsl/runtime',
    desc: 'HTTP executor with pagination, error handling, bundle resolution, slice helpers.',
    accent: 'blue',
  },
  {
    name: '@fhir-dsl/cli',
    desc: 'fhir-gen — generate, capability, validate, scaffold-ig, diff, mcp.',
    accent: 'cyan',
  },
  {
    name: '@fhir-dsl/types',
    desc: 'Branded FHIR R4/R5 primitives, base datatypes, runtime parsers.',
    accent: 'cyan',
  },
  {
    name: '@fhir-dsl/generator',
    desc: 'Code generation engine — resources, profiles, slices, typed extensions, layers, IG manifests.',
    accent: 'violet',
  },
  {
    name: '@fhir-dsl/fhirpath',
    desc: 'Type-safe FHIRPath expression builder + invariant evaluator.',
    accent: 'violet',
  },
  {
    name: '@fhir-dsl/terminology',
    desc: 'CodeSystem hierarchy + ValueSet filter engine (is-a, descendent-of, regex).',
    accent: 'amber',
  },
  {
    name: '@fhir-dsl/smart',
    desc: 'SMART on FHIR v2 — PKCE-S256, backend services, scope DSL.',
    accent: 'amber',
  },
  {
    name: '@fhir-dsl/mcp',
    desc: 'MCP server — generic FHIR verbs as tools, pluggable auth, audit, stdio + HTTP.',
    accent: 'rose',
  },
  {
    name: '@fhir-dsl/utils',
    desc: 'Shared utilities used across the workspace.',
    accent: 'rose',
  },
];

const USE_CASES = [
  {
    title: 'EHR & FHIR Integrators',
    desc: 'Hit US Core, Epic, Cerner, HAPI, or any custom IG with compile-time-checked queries. Profile-aware, slice-aware, no string guessing.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'Health-Tech Platforms',
    desc: 'Generate types from your tenant\'s IG, validate every payload at the boundary, and ship a single FHIR client across services with no version drift.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'AI & LLM Agents',
    desc: 'Expose a FHIR endpoint as an MCP tool surface in one command. Read-only by default, write gating per resource type, full audit, stdio + HTTP transports.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="1.2" />
        <circle cx="15" cy="9" r="1.2" />
        <path d="M8 15c1.5 1.2 6.5 1.2 8 0" />
      </svg>
    ),
  },
  {
    title: 'Conformance Authors',
    desc: 'Compile FHIRPath invariants, run them against generated Standard Schema validators, and emit OperationOutcome — all from your test suite.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
];

function InstallStrip() {
  const [copied, setCopied] = useState(false);
  const cmd = 'npx @fhir-dsl/cli generate --version r4';

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className={styles.installStrip}>
      <span className={styles.installPrompt}>$</span>
      <span className={styles.installCmd}>{cmd}</span>
      <button
        type="button"
        className={styles.copyBtn}
        data-copied={copied}
        onClick={onCopy}
        aria-label={copied ? 'Copied' : 'Copy command'}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

function Hero({ title, tagline, version }) {
  const majorMinor = version ? version.split('.').slice(0, 2).join('.') : '';
  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid} />
      <div className={styles.heroGlow} />

      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        {majorMinor ? `v${majorMinor} — ` : ''}R4 · R4B · R5 · R6
      </div>

      <h1 className={styles.heroTitle}>
        <span className={styles.gradientText}>{title}</span>
      </h1>
      <p className={styles.heroTagline}>{tagline}</p>

      <div className={styles.heroButtons}>
        <Link className={styles.primaryBtn} to="/docs/getting-started/quick-start">
          Get Started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <Link className={styles.ghostBtn} to="/docs">
          Documentation
        </Link>
        <Link className={styles.ghostBtn} href="https://github.com/awbx/fhir-dsl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.13 0 .3.21.66.79.55C20.22 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
          </svg>
          GitHub
        </Link>
      </div>

      <InstallStrip />
    </section>
  );
}

function Walkthrough() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Walkthrough</span>
        <h2 className={styles.sectionTitle}>See it in action</h2>
        <p className={styles.sectionLead}>
          A short narrated tour of the query builder, generator, and CLI.
        </p>
      </div>

      <div className={styles.videoFrame}>
        <video
          className={styles.video}
          src={WALKTHROUGH_VIDEO_URL}
          controls
          preload="metadata"
          playsInline
        >
          <track kind="captions" />
        </video>
      </div>
    </section>
  );
}

function Playground() {
  const [activeId, setActiveId] = useState(EXAMPLES[0].id);
  const active = EXAMPLES.find((e) => e.id === activeId) ?? EXAMPLES[0];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Examples</span>
        <h2 className={styles.sectionTitle}>Fluent API, real FHIR</h2>
        <p className={styles.sectionLead}>
          Search, filter across references, compose transactions, or stream large
          result sets — every call is fully typed against the FHIR spec.
        </p>
      </div>

      <div className={styles.playground}>
        <div className={styles.tabBar} role="tablist" aria-label="Example category">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              role="tab"
              aria-selected={activeId === ex.id}
              className={`${styles.tab} ${activeId === ex.id ? styles.tabActive : ''}`}
              onClick={() => setActiveId(ex.id)}
            >
              {ex.label}
            </button>
          ))}
        </div>

        <Highlight code={active.code} language={active.lang ?? 'tsx'} theme={themes.oneDark}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className={styles.codeBlock}>
              <code>
                {tokens.map((line, i) => {
                  const { key: lineKey, ...lineProps } = getLineProps({ line });
                  return (
                    <div key={i} {...lineProps}>
                      {line.map((token, j) => {
                        const { key: tokenKey, ...tokenProps } = getTokenProps({ token });
                        return <span key={j} {...tokenProps} />;
                      })}
                    </div>
                  );
                })}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Capabilities</span>
        <h2 className={styles.sectionTitle}>The FHIR toolchain, end to end</h2>
        <p className={styles.sectionLead}>
          From StructureDefinitions on the server to the <code>.where()</code> calls
          in your editor — types, validators, FHIRPath, terminology, SMART, and an
          MCP bridge.
        </p>
      </div>

      <div className={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.feature}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className={styles.statsSection}>
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Workspace</span>
        <h2 className={styles.sectionTitle}>Ten focused packages, one toolchain</h2>
        <p className={styles.sectionLead}>
          Install only what you need. <code>core</code> + <code>runtime</code> get
          you a typed client; everything else is opt-in.
        </p>
      </div>

      <div className={styles.packagesGrid}>
        {PACKAGES.map((p) => (
          <div
            key={p.name}
            className={`${styles.package} ${styles[`accent-${p.accent}`] ?? ''}`}
          >
            <div className={styles.packageName}>{p.name}</div>
            <div className={styles.packageDesc}>{p.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Built for</span>
        <h2 className={styles.sectionTitle}>Wherever FHIR meets TypeScript</h2>
      </div>

      <div className={styles.useCases}>
        {USE_CASES.map((u) => (
          <div key={u.title} className={styles.useCase}>
            <div className={styles.useCaseIcon}>{u.icon}</div>
            <h3 className={styles.useCaseTitle}>{u.title}</h3>
            <p className={styles.useCaseDesc}>{u.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className={styles.cta}>
      <h2 className={styles.ctaTitle}>Ready to query FHIR with confidence?</h2>
      <p className={styles.ctaLead}>
        Generate types, spin up a client, and write your first type-safe query in
        under two minutes.
      </p>
      <div className={styles.heroButtons} style={{ marginBottom: 0 }}>
        <Link className={styles.primaryBtn} to="/docs/getting-started/quick-start">
          Quick Start
        </Link>
        <Link className={styles.ghostBtn} to="/docs/examples/queries">
          Browse Examples
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.page}>
        <Hero
          title={siteConfig.title}
          tagline={siteConfig.tagline}
          version={siteConfig.customFields?.version}
        />
        <Stats />
        <Walkthrough />
        <Features />
        <Playground />
        <Packages />
        <UseCases />
        <CTA />
      </main>
    </Layout>
  );
}

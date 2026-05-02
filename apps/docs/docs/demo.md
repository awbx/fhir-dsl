---
id: demo
title: Live Demo — Caduceus HIS
description: A working hospital information system built with fhir-dsl — typed search, FHIRPath playground, SMART-on-FHIR patient launch, and a Claude chatbot wired through MCP.
sidebar_label: Live Demo
sidebar_position: 100
---

# Live Demo — Caduceus HIS

**Caduceus** is a hospital information system demo that uses **every published `@fhir-dsl/*` package** end-to-end. It's the surface-freeze smoke test for v1.x — and the most concrete way to see what the toolchain looks like in a real React app.

**→ [Live demo](pathname:///demo/)** &nbsp;·&nbsp; **[Source on GitHub](https://github.com/awbx/fhir-dsl/tree/main/apps/his-demo)**

## What's in the demo

| Pillar | What it shows | Packages exercised |
|---|---|---|
| **Patient list / detail** | Typed search with `where` / `include` / `sort`, profile-narrowing toggle (US Core), FHIRPath-driven write-back via JSON Patch, optimistic update + rollback on `FhirRequestError` | `@fhir-dsl/core`, `@fhir-dsl/runtime`, `@fhir-dsl/fhirpath`, `@fhir-dsl/tanstack-query` |
| **SMART-on-FHIR launch** | Full v2 flow through the SMART Health IT sandbox: discovery → PKCE → code exchange → token persistence | `@fhir-dsl/smart` |
| **FHIRPath playground** | Live compile + evaluate against sample resources, UCUM-aware Quantity demo, terminology hooks demo | `@fhir-dsl/fhirpath` |
| **Claude chatbot (full version only)** | LLM tool-use loop wired to an in-process MCP server, with audit timeline | `@fhir-dsl/mcp`, `@anthropic-ai/sdk` |

## Two deployment flavors

The demo is a TanStack Start app with both client and server routes. We ship two builds:

- **GitHub Pages (this site, `/demo/`)** — a **static SPA build**. Patient list/detail, FHIRPath playground, and the SMART login flow all work because they're client-only. **The chatbot is disabled** because it requires server-side calls to the Anthropic SDK and the in-process MCP dispatcher.
- **Full self-host** — build from the source repo and run with `pnpm demo` for the complete experience including the chatbot. Requires `ANTHROPIC_API_KEY` in your environment.

## Run the full version locally

```bash
git clone https://github.com/awbx/fhir-dsl.git
cd fhir-dsl
pnpm install
pnpm demo:gen     # generates R4 FHIR types into apps/his-demo/src/fhir/r4
pnpm demo         # runs the dev server with chatbot + MCP enabled
```

Open `http://localhost:3000` and click **"Login with SMART"** to start the patient-launch dance. Drop your `ANTHROPIC_API_KEY` in `apps/his-demo/.env.local` first if you want the chatbot.

## Architecture

The demo is structured as a **TanStack Start app** with file-based routing and shadcn/ui. The interesting bits to read:

- [`src/routes/patients.$id.tsx`](https://github.com/awbx/fhir-dsl/blob/main/apps/his-demo/src/routes/patients.%24id.tsx) — typed search, US Core profile narrowing toggle, FHIRPath write-back via JSON Patch
- [`src/routes/playground.tsx`](https://github.com/awbx/fhir-dsl/blob/main/apps/his-demo/src/routes/playground.tsx) — Monaco editor wired to live FHIRPath compile/evaluate
- [`src/server/mcp-singleton.ts`](https://github.com/awbx/fhir-dsl/blob/main/apps/his-demo/src/server/mcp-singleton.ts) — `@fhir-dsl/mcp` dispatcher mounted in-process on the TanStack Start server
- [`src/server/claude.ts`](https://github.com/awbx/fhir-dsl/blob/main/apps/his-demo/src/server/claude.ts) — Anthropic SDK tool-use loop bound to the MCP dispatcher (max 8 tool-call steps per turn)
- [`src/lib/use-fhir-client.ts`](https://github.com/awbx/fhir-dsl/blob/main/apps/his-demo/src/lib/use-fhir-client.ts) — `createClient` wired to a `SmartClient` `AuthProvider`

## Related

- [Architecture overview](./architecture/overview.md) — how the eleven packages compose
- [SMART on FHIR guide](./guides/smart.md) — the auth flow the demo exercises
- [MCP guide](./guides/mcp.md) — the chatbot's tool surface
- [`@fhir-dsl/tanstack-query`](./api/tanstack-query.md) — the React Query bindings every page in the demo uses

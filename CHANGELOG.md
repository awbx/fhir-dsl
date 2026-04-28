# Changelog

All notable changes to this project will be documented in this file.

## [0.42.0] - 2026-04-28

### Features

- add Phase 8.2 MCP generic verb runners (`adca3fb`)

## [0.41.0] - 2026-04-28

### Features

- add Phase 8.1 MCP server package skeleton (`2aced32`)

## [0.40.0] - 2026-04-28

### Features

- add Phase 6 FHIRPath invariant evaluator (`4693c69`)

## [0.39.0] - 2026-04-28

### Features

- add Phase 2.2 typed extensions from IGs (`9351be6`)

## [0.38.0] - 2026-04-28

### Features

- add Phase 2.1 StructureDefinition slicing (`cb2c34b`)

## [0.37.0] - 2026-04-28

### Features

- add Phase 7.4 fhir-gen diff command (`ee54d47`)

## [0.36.0] - 2026-04-28

### Features

- add Phase 7.3 fhir-gen scaffold-ig command (`fa6229f`)

## [0.35.0] - 2026-04-28

### Features

- add Phase 7.1 fhir-gen validate command (`fd86f0d`)

## [0.34.0] - 2026-04-28

### Features

- add Phase 2.3 IG manifest parsing (`780c490`)

## [0.33.0] - 2026-04-28

### Features

- add Phase 3.2 terminology hierarchy + filter ops (`cd9f240`)

## [0.32.0] - 2026-04-28

### Features

- add Phase 4.1 capability-driven runtime guard (`6af17a8`)

## [0.31.0] - 2026-04-28

### Features

- add Phase 7.2 fhir-gen capability command (`6bcf943`)

## [0.30.0] - 2026-04-28

### Features

- add Phase 3.1 first-class terminology operations (`580e054`)

## [0.29.0] - 2026-04-28

### Features

- add Phase 4.2 bundle reference resolution (`49ac216`)

## [0.28.0] - 2026-04-28

### Features

- add Phase 5 layered framework metadata (`3b495e0`)

## [0.27.0] - 2026-04-28

### Features

- add Phase 1.2 choice-type accessor (choiceOf) (`c16cdca`)

## [0.26.0] - 2026-04-28

### Features

- add Phase 1.3 primitive _field siblings (`b1ae3d9`)

## [0.25.0] - 2026-04-28

### Features

- add Phase 1.4 full Extension.value[x] union (`c80a729`)

## [0.24.0] - 2026-04-28

### Features

- add Phase 1.1 branded primitives + smart constructors (`1681b99`)

## [0.23.0] - 2026-04-28

### Features

- add Phase 0 hygiene baseline (`236e11c`)

## [0.22.6] - 2026-04-21

### Other

- perf(core): walker-style path validator drops transform typecheck ~8x (`4b488f7`)

## [0.22.5] - 2026-04-21

### Bug Fixes

- fix(core): count Path depth in named-field hops only (`87aac91`)

## [0.22.4] - 2026-04-21

### Other

- feat(core): .transform() on ReadQueryBuilder (`f43d47c`)

## [0.22.3] - 2026-04-21

### Bug Fixes

- fix(core): strip undefined from t(path, fallback) return type (`a092dbb`)

### Other

- test(core): regression tests for array-hop include expressions (`7877940`)

## [0.22.2] - 2026-04-21

### Other

- perf(core): speed up Path filter types + add t.raw escape hatch (`b857e0a`)

## [0.22.1] - 2026-04-21

### Features

- add consumer-facing wildcard builder types + extending guide (`18ba12d`)

### Bug Fixes

- fix(generator): emit alias keys for cross-resource include expression unions (`9096a56`)
- fix(core): Scope no longer collapses to never on interface-shaped IncludeExpressions (`0083171`)

## [0.22.0] - 2026-04-20

### Other

- feat(core): .transform(fn) with auto-dereferencing paths + guide (`abc369c`)

## [0.21.2] - 2026-04-20

### Other

- feat(core): accept FhirPathExpr in .filter() + guide (`fcbf93b`)

## [0.21.1] - 2026-04-19

### Bug Fixes

- fix(docs): escape < in changelog generator to keep MDX build green (`244788c`)
- fix(tests): update callback parameter name in functional where test (`4258f15`)

### Other

- docs: comprehensive rewrite — API reference, recipes, edge cases, LLM guide (`d2a3dc8`)

## [0.21.0] - 2026-04-19

### Features

- Add FHIRPath, search, and REST spec-compliance test suites (`e00169f`)
- Add spec-driven audit pass artifacts (`47c06a8`)
- Add spec-compliance test scaffolding (`023482b`)
- Add AUDIT.md with v0.19.0 spec-compliance snapshot (`14ecc52`)

### Improvements

- Update README and documentation proposal with v0.20.0 audit results and bug reconciliation (`3d436aa`)

### Bug Fixes

- fix: TextEncoder-measured auto-POST threshold + arithmetic dead arm (#49) (`3ee7b7b`)
- fix(types): Reference<T> narrows `type` field to allowed targets (BUG-027) (`190257c`)
- fix: validate modifier-applicability and preserve null-valued properties (BUG-024, BUG-025) (`f6c1d66`)
- fix(runtime): cycle-safe pagination + response metadata + non-JSON error body (BUG-019, BUG-020, BUG-021, BUG-022) (`c946f4e`)
- fix(core): auto-POST threshold measures GET URL bytes and exposes getUrlByteLimit() (BUG-017) (`58fea58`)
- fix(core): whereChain drops :Type on terminal hop (BUG-016) (`2109353`)
- fix(core): :not modifier emits not(param eq v) in _filter, not ne (BUG-015) (`573a0ff`)
- fix(fhirpath): subsetting semantics for skip/take/intersect (BUG-013, BUG-014) (`7d69917`)
- fix(fhirpath): allTrue/allFalse on empty return [true] per §5.1.4/§5.1.6 (BUG-012) (`95f64de`)
- fix(core): auto-generate urn:uuid fullUrl on transaction POST entries (BUG-011) (`d597195`)
- fix(fhirpath): NFC-normalize string ops + code-point length (BUG-010) (`b179794`)
- fix(fhirpath): tighten ofType duck-type matching (BUG-009) (`e6db573`)
- fix(fhirpath): deep structural equality for compound types (BUG-008) (`5ef5d88`)
- fix(fhirpath): iif evaluates criterion/branches on input collection (BUG-007) (`d24e9ee`)
- fix(fhirpath): terminate descendants() on cyclic graphs (BUG-006) (`fd6e6ce`)
- fix(fhirpath): dispatch value[x] at nav-eval time (BUG-002) (`f0c6b66`)

### Other

- feat(core): async pattern polling — Prefer: respond-async + 202 + Content-Location (#42) (`abb84f8`)
- feat(fhirpath): primitive \`_field\` extension siblings (#47) (`6a71f72`)
- docs: disambiguate client-side .validate() vs server-side \$validate (#31) (`1f4fa8a`)
- feat(core): system-level search + POST _format preservation (#44) (`b2a1246`)
- feat(fhirpath): aggregate() + sum/min/max/avg (#48) (`82ff4d1`)
- feat(core): :type modifier on reference params (#43) (`427d852`)
- feat(core): REST capabilities/vread/history builders (#41, #40, #39) (`4d21abc`)
- feat(fhirpath): FHIR-specific functions — extension/hasValue/getValue/htmlChecks/resolve (#37) (`3452133`)
- feat(fhirpath): FHIRPath environment variables + iteration locals (#36) (`b036e42`)
- feat(core): thread Prefer header through all executors (#35) (`8361527`)
- feat(core): direct CRUD + conditional headers (#33, #32, #34) (`111205d`)
- feat(core): FHIR operations framework — client.operation(name, options) (#30) (`a7e4cc2`)
- feat(fhirpath): strict-mode evaluator flag (#29, closes BUG-023) (`a27555b`)
- feat(fhirpath): binary arithmetic operators +, -, *, /, div, mod, & (#28) (`0307107`)
- feat: retry 429/503 with Retry-After + full-jitter backoff (BUG-029, FEAT #27) (`e6bfd6b`)
- feat: thread AbortSignal through fetch pipeline (BUG-028, FEAT #26) (`bb24a94`)
- Document the SpecCatalog generator pipeline (`4f91589`)

## [0.19.0] - 2026-04-19

### Features

- Add SpecCatalog: per-version FHIR spec derivation (`ad721d9`)

### Other

- Thread SpecCatalog + TypeMapper through parsers and emitters (`73dc1a6`)
- Document $if/$call and functional where in queries example (`c913c7b`)

## [0.18.0] - 2026-04-19

### Features

- Add functional where(callback) overload with _filter fallback (`5de2400`)

## [0.17.2] - 2026-04-19

### Removals

- Remove unintentionally committed where-builder.ts (`776a131`)

## [0.17.1] - 2026-04-19

### Bug Fixes

- Fix type errors in builder composition tests (`ecbd16f`)

## [0.17.0] - 2026-04-19

### Features

- Add Kysely-style $if and $call to every fluent builder (`97f8f35`)

### Other

- Document FHIR R5 search additions in DSL reference and query examples (`c78f8a3`)

## [0.16.0] - 2026-04-19

### Features

- Add _filter, _query, _text, _content, _list escape hatches (Phase 7) (`46875d4`)
- Add multi-hop whereChain (Phase 6) (`af0b5c0`)
- Add :iterate option for _include and _revinclude (Phase 5) (`4011b23`)
- Add POST _search with form-urlencoded body (Phase 4) (`a5eb5bc`)
- Add OR-via-comma multi-value search (Phase 3) (`2aebb1a`)
- Add per-package test-prompt folders for multi-model test generation (`72a7029`)

### Other

- Document FHIR R5 search coverage and add round-trip tests (`f5e1cf9`)
- Hoist common FHIR search params into shared CommonSearchParams interface (`e003cec`)
- Split prefix vs modifier in search URLs and add meta params (`c8af9b8`)

## [0.15.0] - 2026-04-18

### Features

- Add .validate() chain on query builders (`a547f8d`)

### Other

- Document runtime validation and .validate() builder chain (`dde31b4`)
- Emit Standard Schema runtime validators from the generator (`5a475b9`)
- Bump every workspace package in lockstep, drop docs string-replace (`81f6e8b`)
- Pull landing-page version badge from package.json (`2ab504e`)
- Refresh architecture overview for nine-package layout (`81239e4`)

## [0.14.0] - 2026-04-16

### Features

- Add SMART on FHIR guide (`d05357e`)
- Add complete-workflow example to docs (`67e0887`)
- Add @fhir-dsl/smart package for SMART on FHIR v2 auth (`8522365`)
- Add FHIRPath, Terminology, CLI examples, and complete workflow to documentation (`f351f80`)
- Add lint:unsafefix script and update header access in tests for consistency (`70bb60b`)

### Other

- Trim roadmap to upcoming work (`6ff4117`)
- Route runtime executor through performRequest (`e270fba`)
- Introduce pluggable AuthProvider and shared HTTP helper in core (`3ef8ea2`)
- Redesign docs landing page with tabbed examples and modern hero (`554d9cd`)
- Split Biome config into per-package files for monorepo (`7879b81`)

## [0.13.0] - 2026-04-16

### Features

- Add spec-emitter for resource/profile markdown output (`6a4cf5f`)

### Other

- Ignore local .claude state directory (`e1b42dd`)
- Document --include-spec flag (`e25ea26`)
- Expose --include-spec flag on CLI generate command (`f951339`)
- Wire includeSpec option into generator pipeline (`f4beb42`)

## [0.12.0] - 2026-04-16

### Features

- Add .select() projection with _elements support (`4e48621`)

### Improvements

- Update roadmap status (`077a689`)

## [0.11.0] - 2026-04-16

### Features

- Add typed batch builder (`9b069d9`)
- Add claude-opus-4-6 client e2e benchmark suite (`77e1bb4`)
- Add codex client and terminology e2e suites (`50e8639`)
- Add codex e2e benchmark submission for terminology engine (`6893ada`)
- Add gemini-2-0-flash-thinking-exp e2e benchmark submission (`c9699d8`)

### Other

- Document fixtures.ts in codex runtime e2e README (`16c1483`)
- chore: update gitignore and biome for agent-specific E2E tests (`e9405d3`)

## [0.10.0] - 2026-04-16

### Features

- Add e2e test suite for terminology engine (`7a88af0`)

## [0.9.2] - 2026-04-16

### Features

- Add terminology-aware search params with typed TokenParam values (`d65da41`)

## [0.9.1] - 2026-04-16

### Bug Fixes

- Fix terminology emitter: sanitize ValueSet names and deduplicate keys (`9cfb483`)

## [0.9.0] - 2026-04-16

### Features

- Add terminology documentation and update docs (`679d4af`)
- Add terminology emitter and parameterize resource emitter for bound types (`e293dfe`)
- Add BindingModel and parse bindings from FHIR StructureDefinitions (`828ae46`)
- Add @fhir-dsl/terminology package for offline ValueSet/CodeSystem resolution (`6f8df42`)

### Other

- Wire terminology engine in generator and add CLI flags (`c8eec8a`)
- Extend downloader to fetch expansions.json and collect VS/CS from IGs (`706f582`)
- Make Coding and CodeableConcept generic with backward-compatible defaults (`55f7d8d`)

## [0.8.0] - 2026-04-16

### Features

- Add composite parameter documentation and update roadmap (`0f5b41f`)
- Add type-safe composite search parameter support (`d85679b`)
- Add README for each package for npm (`0e9414a`)

### Bug Fixes

- Fix biome lint warnings in type tests (`003a3cb`)

## [0.7.0] - 2026-04-16

### Features

- Add streaming documentation and update docs (`304b793`)
- Add tests for search query streaming (`8962ece`)
- Add streaming and lazy loading for search queries (`715b296`)
- Add changelog page to docs site (`017f024`)
- Add changelog generation from git history (`9f95bb9`)

## [0.6.1] - 2026-04-16

### Bug Fixes

- Fix CI typecheck: use proper test types instead of base Resource (`00d1fd3`)

## [0.6.0] - 2026-04-16

### Features

- Add FHIRPath documentation and update package references (`fc011ad`)
- Add comprehensive tests for FHIRPath expression builder (`db34095`)
- Add FHIRPath expression builder with near-complete spec coverage (`2ef12b1`)

### Bug Fixes

- Fix MDX build: escape operator symbols in FHIRPath docs table (`fb22de5`)

### Removals

- Remove unused variable and fix lint warnings (`e21f22c`)

## [0.5.0] - 2026-04-16

### Features

- Add type-safe _revinclude, chained parameters, and _has query methods (`2a5dea8`)

## [0.4.0] - 2026-04-16

### Features

- Add husky pre-commit hook to run lint before commits (`8281583`)
- Add Docusaurus documentation site with GitHub Pages deployment (`87038cc`)

### Improvements

- Expand README with detailed docs, reference links, and API overview (`ea998d3`)
- Replace redirect with landing page on docs site (`df2b0fd`)

### Bug Fixes

- Fix CI lint failures: remove unused import, format browserslist, ignore .docusaurus (`48e0c61`)

### Other

- Make version dynamic in CLI and sync docs versions on bump (`4a3adec`)
- Downgrade TypeScript version to 5.9.3 in package.json and pnpm-lock.yaml (`666ab01`)

## [0.3.0] - 2026-04-15

### Improvements

- Upgrade all dependencies to latest versions (`e451ff0`)

## [0.2.1] - 2026-04-15

### Features

- Add version bump script (`3053250`)

### Improvements

- Update repository URLs in package.json files to reflect new ownership (`1d5cf5e`)

### Other

- Reorder Type check step in CI workflow for improved clarity (`4dd3a9c`)

## [0.2.0] - 2026-04-15

### Features

- Add tests for generator emitters, profile parser, and type-level assertions (`b2c8724`)
- Add comprehensive unit test suite across all packages (`d3df79b`)
- Add CLI generation step to core README setup instructions (`ece9bd4`)
- Add CI and release GitHub Actions workflows (`68698c2`)
- Add README documentation for root, core, and CLI packages (`6465b8d`)
- Add MIT license (`1ea4702`)
- Add example package with end-to-end query builder demos (`0b393dc`)
- Add usage example demonstrating query builder API (`64a06d3`)
- Add CLI package for FHIR type generation (`ad0a43a`)
- Add runtime package with query executor and pagination (`d4f1da3`)
- Add core query builder with Kysely-inspired fluent API (`4bc1b9d`)
- Add generator package for FHIR type codegen (`ebcd5e4`)
- Add R5 resource types, datatypes, and search parameters (`7673d79`)
- Add R4 search parameter types and US Core profiles (`f5700cd`)
- Add R4 resource type definitions (`9819158`)
- Add types package with R4 primitives, datatypes, and registry (`27a6421`)
- Add utils package with naming conventions and type mappings (`998144e`)

### Improvements

- Update devDependencies to latest versions in package.json and pnpm-lock.yaml (`7581360`)
- Update core builders and generator index emission (`8a3feec`)
- Update CLI, utils, and example for new type structure (`8771179`)
- Update core query builders for simplified type imports (`5709c7e`)
- Update generator to target new flat types structure (`e3fa0d8`)

### Removals

- Remove standalone example and refine search query builder (`9bc6bfc`)

### Other

- Automate npm publish on version tags (`40aab3a`)
- Enforce strict type safety across the monorepo (`c2fd1f3`)
- Minor fixes in core types, generator, and datatypes (`0dbbdf1`)
- Configure packages for npm publishing with dual ESM/CJS (`e236672`)
- Regenerate example types with updated generator output (`61e9998`)
- Improve generator index emitter and generation pipeline (`fab9684`)
- Restructure types package to remove R4/R5 duplication (`1f91605`)
- Refine US Core profile types and simplify registry (`232fd51`)
- Initial project setup with pnpm workspace (`b8914e6`)

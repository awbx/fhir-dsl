# Changelog

All notable changes to this project will be documented in this file.

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

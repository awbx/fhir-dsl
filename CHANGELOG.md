# Changelog

All notable changes to this project will be documented in this file.

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

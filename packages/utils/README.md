# @fhir-dsl/utils

Shared utilities for the `fhir-dsl` monorepo — naming conventions, FHIR-to-TypeScript type mapping, and logging.

This is an internal utility package. Install it only if you're building custom tooling on top of `fhir-dsl`.

## Install

```bash
npm install @fhir-dsl/utils
```

## API

### Naming Utilities

```ts
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  fhirTypeToFileName,
  fhirPathToPropertyName,
} from "@fhir-dsl/utils";

toPascalCase("human-name");        // "HumanName"
toCamelCase("human-name");         // "humanName"
toKebabCase("HumanName");          // "human-name"
fhirTypeToFileName("HumanName");   // "human-name"
fhirPathToPropertyName("Patient.name.family"); // "family"
```

### Type Mapping

Maps FHIR primitive and complex type names to their TypeScript equivalents (e.g., `boolean` to `FhirBoolean`, `HumanName` to `HumanName`).

### Logger

```ts
import { Logger } from "@fhir-dsl/utils";

const log = new Logger("my-tool");
log.info("Generating types...");
log.debug("Processing Patient");
log.warn("Skipping unknown type");
log.error("Failed to parse definition");
```

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)

# FHIR R5 RESTful API + Operations — Atomic Rules

**Source specs.** Primary: https://hl7.org/fhir/R5/http.html (REST), https://hl7.org/fhir/R5/operations.html (Operations framework), https://hl7.org/fhir/R5/operationslist.html (standard operation catalogue), https://hl7.org/fhir/R5/async.html (async patterns). Operation definitions: https://hl7.org/fhir/R5/resource-operations.html and per-resource operation pages.

**Convention.** Rule IDs: `REST-<AREA>-<NNN>` for REST, `OP-<AREA>-<NNN>` for operations. Areas: `READ`, `VREAD`, `UPDATE`, `PATCH`, `DELETE`, `CREATE`, `COND` (conditional), `HIST` (history), `CAP` (capabilities), `BUND` (batch/transaction), `HDR` (headers/Prefer), `MIME`, `PAGE`, `HEAD` (HTTP HEAD), `ERR` (errors), `ASYNC`. For operations: `INV` invocation, `PARM` parameters, `VAL` $validate, `EV` $everything, `EXP` $expand, `LOOK` $lookup, `TRAN` $translate, `META`, `DOC` $document.

## OPEN-QUESTION Summary

1. **REST-BUND-ORDER**: The documented transaction processing order is DELETE → POST → PUT/PATCH → GET/HEAD → resolve conditional refs. The spec at §3.2.0.11.2 does NOT require servers to process in that order — the order is a *server-side* optimization hint; atomicity is the normative guarantee. **VERIFY-QUOTE** and flag to test-engineer not to over-assert.
2. **REST-PATCH-PREFER**: Whether a server MUST honor `Prefer: return=representation` on PATCH is not cleanly stated; the same language as UPDATE applies ("servers SHOULD honor"). **VERIFY-QUOTE**.
3. **REST-HEAD-001**: HEAD semantics are mentioned ("A HEAD request can also be used") but full normative behavior (which interactions MUST support HEAD) is underspecified — §3.2.0 only references read/vread/history/search.
4. **REST-ASYNC-001..006**: The R5 async pages delegate to `async-bulk.html` and `async-bundle.html`. WebFetch returned only the top-level patterns page. Rules below reflect the standard RFC 7240 + Content-Location + 202-polling pattern; **VERIFY-QUOTE** against the two linked pages before publishing.
5. **REST-COND-UPDATE-IDS**: Conditional update when the request body contains an `id` that does not match the resolved resource — spec says 409 Conflict; but behavior when id is absent is "create or update based on match count". **VERIFY-QUOTE** §3.2.0.4.3.
6. **OP-PARM-RESOURCE**: Whether `parameter.resource` and `parameter.value[x]` can coexist on the same parameter — spec says mutually exclusive; an invalid Parameters with both SHOULD yield 400. **VERIFY-QUOTE**.

---

## 1. Read (§3.2.0.2)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-READ-001 | `GET [base]/[type]/[id]{?_format=}` returns a single instance. Servers SHOULD return `ETag` (value `W/"<versionId>"`) and `Last-Modified`. | §3.2.0.2 | `GET /Patient/123` → 200 + body. | — |
| REST-READ-002 | 200 on success; 404 if resource unknown; 410 Gone if known-deleted. | §3.2.0.2 | — | 404 MAY also be returned for deleted if server does not track tombstones. |
| REST-READ-003 | HEAD is allowed: "A HEAD request can also be used." HEAD returns the same headers as GET with no body. | §3.2.0.2, §3.2.0 HEAD | `HEAD /Patient/123` → 200, Content-Length=0. | — |
| REST-READ-004 | `_format` is the override for Accept; values `xml`, `application/fhir+xml`, `json`, `application/fhir+json`, `ttl`, `application/fhir+turtle`. | §3.2.0.1.12 | `GET /Patient/1?_format=json` | — |

## 2. VRead (§3.2.0.3)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-VREAD-001 | `GET [base]/[type]/[id]/_history/[vid]` returns the specific historical version. | §3.2.0.3 | `GET /Patient/123/_history/4` → 200. | — |
| REST-VREAD-002 | 200 on success; 404 if version not found or history unsupported; 410 Gone if that version was deleted. | §3.2.0.3 | — | — |
| REST-VREAD-003 | HEAD allowed. | §3.2.0.3 | — | — |

## 3. Update (§3.2.0.4)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-UPDATE-001 | `PUT [base]/[type]/[id]`. Request body SHALL be a resource of the named type with `id` equal to `[id]` in URL. | §3.2.0.4 | `PUT /Patient/123` with `{resourceType:Patient,id:"123",...}`. | `PUT /Patient/123` with `id:"456"` → 400. |
| REST-UPDATE-002 | Server ignores submitted `meta.versionId` and `meta.lastUpdated`; server assigns new values. | §3.2.0.4 | — | Clients MUST NOT rely on a submitted versionId. |
| REST-UPDATE-003 | Response: 200 if updated; 201 if created (when server supports client-assigned IDs). | §3.2.0.4 | `PUT /Patient/new-id` on servers that allow client-IDs → 201. | — |
| REST-UPDATE-004 | Response headers: `Location: [base]/[type]/[id]/_history/[vid]`, `ETag: W/"<vid>"`, `Last-Modified`. | §3.2.0.4 | — | — |
| REST-UPDATE-005 | 400 on id mismatch; 405 on client-id not supported; 409 on version conflict; 412 on `If-Match` fail; 422 on business-rule violation. | §3.2.0.4 | — | — |
| REST-UPDATE-006 | Version-aware update: `If-Match: W/"<vid>"` — "If the version id given in the If-Match header does not match, the server returns a 412 Precondition Failed status code instead of updating the resource." | §3.2.0.5 | `PUT ... If-Match: W/"4"` | Wrong vid → 412. |

## 4. Conditional Update (§3.2.0.4.3)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-COND-UPDATE-001 | `PUT [base]/[type]?[search]` — "the server... performs a search... to resolve a single logical id." | §3.2.0.4.3 | `PUT /Patient?identifier=...` | — |
| REST-COND-UPDATE-002 | No match: resource is created → 201. One match: resource is updated → 200. Multiple matches: 412. | §3.2.0.4.3 | — | Client MUST NOT expect deterministic selection among multiple matches. |
| REST-COND-UPDATE-003 | If body has `id` and one match is found with a different id → 409 Conflict. | §3.2.0.4.3 | — | — |
| REST-COND-UPDATE-004 | Supports `If-None-Match: W/"<vid>"` for version-awareness. | §3.2.0.4.3 | — | — |

## 5. Patch (§3.2.0.6)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-PATCH-001 | `PATCH [base]/[type]/[id]`. Body SHALL be one of: JSON Patch (`application/json-patch+json`), XML Patch (`application/xml-patch+xml`), or FHIRPath Patch as a `Parameters` resource with FHIR MIME type. | §3.2.0.6 | `PATCH /Patient/123` with `[{"op":"replace","path":"/active","value":false}]` | Other content types → 415 Unsupported Media Type. |
| REST-PATCH-002 | Response codes: same as update. 422 for a failing JSON-Patch `test` op. | §3.2.0.6 | — | — |
| REST-PATCH-003 | "Servers that support PATCH SHALL support Resource Contention on the PATCH operation" — i.e. `If-Match` MUST be respected. | §3.2.0.6 | — | — |
| REST-PATCH-004 | Response body honors `Prefer: return` exactly as Update. **VERIFY-QUOTE**. | §3.2.0.6 | — | — |
| REST-COND-PATCH-001 | `PATCH [base]/[type]?[search]` — conditional patch. No match → 404; one match → 200/201; multiple → 412. | §3.2.0.6.1 | — | — |

## 6. Delete (§3.2.0.7)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-DELETE-001 | `DELETE [base]/[type]/[id]`. "A delete interaction means that the resource can no longer [be] found through a search interaction." | §3.2.0.7 | `DELETE /Patient/123` | — |
| REST-DELETE-002 | "Subsequent non-version specific reads of the resource return a 410 Gone HTTP status code when the server wishes to indicate that the resource is deleted." | §3.2.0.7 | Next `GET /Patient/123` → 410. | MAY return 404 instead of 410 if server does not retain tombstones. |
| REST-DELETE-003 | Response: 200 with body, 204 no body, or 202 accepted (async). | §3.2.0.7 | — | — |
| REST-DELETE-004 | 405 if delete unsupported; 409 if referential integrity prevents deletion. | §3.2.0.7 | — | — |
| REST-COND-DELETE-001 | `DELETE [base]/[type]?[search]` — "No matches or One Match: The server performs an ordinary delete on the matching resource. Multiple matches: A server may choose to delete all the matching resources, or it may choose to return a 412 Precondition Failed error." | §3.2.0.7.1 | — | Behavior with multiple matches is server-choice — clients MUST NOT assume. |

## 7. Create (§3.2.0.8)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-CREATE-001 | `POST [base]/[type]`. "The resource does not need to have an id element. If an id is provided, the server SHALL ignore it." | §3.2.0.8 | `POST /Patient` with body lacking `id`. | Client-supplied `id` in create body is dropped. |
| REST-CREATE-002 | Response: 201 Created. `Location: [base]/[type]/[id]/_history/[vid]`, `ETag`, `Last-Modified` required headers. | §3.2.0.8 | — | — |
| REST-CREATE-003 | 400 on parse/validation failure; 404 if type not supported; 422 for business-rule violation. | §3.2.0.8 | — | — |
| REST-COND-CREATE-001 | Conditional create uses header `If-None-Exist: [search params]`. "No matches: The server processes the create... returns a 201 Created... One Match: The server ignores the post and returns 200 OK. Multiple matches: The server returns a 412 Precondition Failed error." | §3.2.0.8.1 | `POST /Patient` + `If-None-Exist: identifier=...`. | Spelling is `If-None-Exist` (singular, no trailing `s`). |

## 8. History (§3.2.0.12)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-HIST-001 | Three URL forms: `GET [base]/[type]/[id]/_history`, `GET [base]/[type]/_history`, `GET [base]/_history`. | §3.2.0.12 | `GET /Patient/_history` | — |
| REST-HIST-002 | "The return content is a Bundle with type set to history containing the specified version history, sorted with oldest versions last, and including deleted resources." | §3.2.0.12 | `Bundle.type=history`. | Sort is `oldest last` — i.e. most recent first. |
| REST-HIST-003 | Parameters: `_count`, `_since` (instant), `_at` (date or period), `_list` (List id), `_sort` ∈ {`-_lastUpdated`, `_lastUpdated`, `none`}. | §3.2.0.12 | `GET /Patient/_history?_since=2024-01-01T00:00:00Z` | — |
| REST-HIST-004 | "Conditional creates, updates and deletes are converted to direct updates and deletes in a history list." | §3.2.0.12 | — | Client sees direct ops in history, not conditional ones. |
| REST-HIST-005 | Deleted resources appear as entries with `Bundle.entry.request.method = DELETE` and no payload. | §3.2.0.12 | — | — |

## 9. Capabilities (§3.2.0.10)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-CAP-001 | `GET [base]/metadata{?mode=[full\|normative\|terminology]}` returns `CapabilityStatement` (or `TerminologyCapabilities` when `mode=terminology`). | §3.2.0.10 | `GET /metadata` → 200 + CapabilityStatement. | — |
| REST-CAP-002 | "Applications SHALL return a resource that describes the functionality of the server end-point." | §3.2.0.10 | — | Non-compliant servers that return 404/500 on /metadata are non-conformant. |
| REST-CAP-003 | ETag SHOULD be returned; "value changes if resource changes" — clients MAY use for caching. | §3.2.0.10 | — | — |
| REST-CAP-004 | OPTIONS `[base]` is an alternative to GET `/metadata`; responses are identical. | §3.2.0.10 | — | — |

## 10. Batch & Transaction (§3.2.0.11)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-BUND-001 | `POST [base]` with body `Bundle` where `Bundle.type ∈ {batch, transaction}`. Each entry carries `Bundle.entry.request` with HTTP method + URL. | §3.2.0.11 | `Bundle.type=transaction`. | — |
| REST-BUND-002 | Batch semantics: "For a `batch`, there SHALL be no interdependencies between the different entries." Entries MAY fail independently; response is `batch-response`. | §3.2.0.11.1 | 3 entries, 1 fails → 200 OK with per-entry statuses. | Client MUST check each `entry.response.status`. |
| REST-BUND-003 | **Transaction atomicity** — "For a `transaction`, servers SHALL either accept all actions... and return an overall `200 OK`... or reject all resources and return an HTTP `400` or `500` type response." | §3.2.0.11.2 | All-or-nothing. | On failure, no partial state mutation. |
| REST-BUND-004 | Transaction MAY contain cross-entry references using `fullUrl` (typically `urn:uuid:<id>`); "Servers SHALL replace all matching links in the bundle... based on either an exact match or a match of the portion of the URL preceding a '#'." | §3.2.0.11.3 | `urn:uuid:abc` in fullUrl, `urn:uuid:abc` in reference → server rewrites to assigned id. | — |
| REST-BUND-005 | Conditional references: reference value MAY be a search URL like `Patient?identifier=12345`. "if there are no matches, or multiple matches, the transaction fails." | §3.2.0.11.4 | `"reference":"Patient?identifier=..."` | 0 matches → transaction failure; >1 matches → failure. |
| REST-BUND-006 | Conditional create inside transaction via `entry.request.ifNoneExist`. | §3.2.0.11 | — | — |
| REST-BUND-007 | Response Bundle entries map 1:1 to request entries in order; each has `entry.response` with HTTP status, optional `Location`, `ETag`, `lastModified`, optional `outcome` (OperationOutcome). | §3.2.0.11.5 | — | — |
| REST-BUND-008 | Response Bundle.type = `batch-response` or `transaction-response`. | §3.2.0.11 | — | — |
| REST-BUND-009 | Transaction suggested processing order (not strictly normative as order; atomicity is normative): DELETE → POST → PUT/PATCH → GET/HEAD → resolve conditional refs. **VERIFY-QUOTE**. | §3.2.0.11.2 | — | — |

## 11. Prefer, handling, headers (§3.2.0.1.6, §3.2.0.1.9)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| REST-HDR-001 | `Prefer: return=minimal` — "asks to return no body." | §3.2.0.1.9 | — | — |
| REST-HDR-002 | `Prefer: return=representation` — "asks to return the full resource." | §3.2.0.1.9 | — | — |
| REST-HDR-003 | `Prefer: return=OperationOutcome` — "asks the server to return an OperationOutcome resource containing hints and warnings about the operation rather than the full resource." | §3.2.0.1.9 | — | Server returns OperationOutcome only if explicitly requested. |
| REST-HDR-004 | "Servers SHOULD honor this header. In the absence of the header, servers may choose whether to return the full resource or not (but not the OperationOutcome; that should only be returned if explicitly requested)." | §3.2.0.1.9 | — | Default behavior is implementation-defined. |
| REST-HDR-005 | `Prefer: handling=strict` — reject unknown params / unsupported features with 400. `Prefer: handling=lenient` — server SHOULD attempt to process, ignoring unknowns. Default is server-defined. | §3.2.0.1.6 / RFC 7240 §4.4 / search.html §3.2.1.1.1 | `handling=lenient` → best-effort. | `handling=strict` + unknown param → 400 OperationOutcome. |
| REST-HDR-006 | `Prefer: respond-async` — requests async execution (see §14). | §3.2.0.1.6 | — | — |
| REST-HDR-007 | `ETag` on responses uses weak form `W/"<versionId>"`. | §3.2.0.4, §3.2.0.5 | `ETag: W/"4"` | Strong ETag form (`"4"`) is non-conformant for FHIR. |
| REST-HDR-008 | `Location` on create/update responses is `[base]/[type]/[id]/_history/[vid]`. | §3.2.0.4, §3.2.0.8 | — | Omitting `_history/[vid]` is non-conformant. |
| REST-HDR-009 | `Last-Modified` MUST match `meta.lastUpdated` when known. | §3.2.0 | — | — |
| REST-HDR-010 | `Content-Location` header is used in async pattern to indicate where the response to the request can be found. | §3.2.0.1.6 | — | — |

## 12. MIME types & _format (§3.2.0.1.10, §3.2.0.1.12)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| REST-MIME-001 | "The formal MIME-type for FHIR resources is `application/fhir+xml` or `application/fhir+json`". RDF: `application/fhir+turtle`. | §3.2.0.1.10 | Legacy `application/xml+fhir`/`application/json+fhir` are deprecated. |
| REST-MIME-002 | `_format` URL param overrides Accept. Values: `xml`, `application/fhir+xml`, `json`, `application/fhir+json`, `ttl`, `application/fhir+turtle`. | §3.2.0.1.12 | Short forms are accepted. |
| REST-MIME-003 | PATCH content types: `application/json-patch+json`, `application/xml-patch+xml`, or FHIR MIME for FHIRPath Patch. | §3.2.0.6 | — |

## 13. HEAD, OPTIONS, Search interaction (§3.2.0.2, §3.2.0.9)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| REST-HEAD-001 | "A HEAD request can also be used" on read/vread/history/search — returns response headers with empty body. **VERIFY-QUOTE** for exhaustive list. | §3.2.0.2, §3.2.0.3, §3.2.0.9, §3.2.0.12 | — |
| REST-SEARCH-001 | "Servers supporting Search via REST SHALL support both GET and POST modes" — POST via `POST [base]/[type]/_search` with `application/x-www-form-urlencoded` body. | §3.2.0.9 | — |
| REST-SEARCH-002 | Search response is `Bundle` of type `searchset`. See `r5-search-rules.md` for full semantics. | §3.2.0.9 | — |

## 14. Async pattern (§3.2.6) **VERIFY-QUOTE**

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| REST-ASYNC-001 | Two flavors: Asynchronous Interaction Request (returns Bundle on completion) and Asynchronous Bulk Data Request (returns a manifest of file links). | §3.2.6.0.2 | — |
| REST-ASYNC-002 | Client sends `Prefer: respond-async` on the request. | §3.2.6 / RFC 7240 §4.1 | — |
| REST-ASYNC-003 | Server responds 202 Accepted with `Content-Location: <status-url>`. | §3.2.6 | — |
| REST-ASYNC-004 | Client polls `GET <status-url>`. Responses: 202 while in progress, 200 on completion (body = final result, which is a Bundle for interaction-async or a manifest for bulk). | §3.2.6 | — |
| REST-ASYNC-005 | Cancellation: `DELETE <status-url>` requests cancellation; server MAY 202 or 404. | §3.2.6 | — |
| REST-ASYNC-006 | Status response MAY include `X-Progress` header with free-text progress; `Retry-After` header hints polling cadence. | §3.2.6 | — |

## 15. Error handling (common)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| REST-ERR-001 | 4xx/5xx responses SHOULD carry an `OperationOutcome` body describing the issue. | §3.2.0 | — |
| REST-ERR-002 | `OperationOutcome.issue.severity` ∈ {fatal, error, warning, information}; `issue.code` from issue-type VS; `issue.details` human-readable. | OperationOutcome resource | — |
| REST-ERR-003 | 415 Unsupported Media Type when content type is not one the server accepts. | §3.2.0 | — |

## 16. Operations framework (§3.3.0.1)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| OP-INV-001 | URL forms — System: `[base]/$[name]`; Type: `[base]/[type]/$[name]`; Instance: `[base]/[type]/[id]/$[name]`. | §3.3.0.1 | `POST /Patient/1/$everything` | — |
| OP-INV-002 | Operation name MUST start with `$`; names are case-sensitive. | §3.3.0.1 | `$validate` ≠ `$Validate`. | — |
| OP-INV-003 | GET is permitted only when: (a) all parameters are primitive datatypes with no extensions AND (b) the operation has `affectsState = false`. | §3.3.0.6.1 | `GET /Patient/$match?...` — if defined as non-state-changing. | — |
| OP-INV-004 | Otherwise POST with a `Parameters` resource in the body. | §3.3.0.1 | `POST /$expand` with Parameters body. | — |
| OP-INV-005 | Operation with no parameters that affects state: POST with empty body. | §3.3.0.1.1 | — | — |

## 17. Parameters resource (§3.3.0.4)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| OP-PARM-001 | Request body uses the `Parameters` resource: `{resourceType:"Parameters", parameter:[ {name, value[x] \| resource \| part[]} ]}`. | §3.3.0.1 | — | — |
| OP-PARM-002 | Each parameter MUST have `name`; then exactly one of `value[x]`, `resource`, or `part[]`. **VERIFY-QUOTE** mutual exclusion. | §3.3.0.4 | — | Providing both `valueString` and `resource` on one entry → 400. |
| OP-PARM-003 | `part[]` allows nested multi-part parameters (same shape as parameter). | §3.3.0.4 | — | — |
| OP-PARM-004 | Response with single out parameter named `return` and typed as a Resource is un-wrapped: "the response is simply the resource itself." | §3.3.0.6.2 | `$everything` returns a Bundle directly. | — |
| OP-PARM-005 | Response with multiple outputs uses `Parameters` resource. | §3.3.0.6.2 | — | — |
| OP-PARM-006 | Error responses: 4xx/5xx with `OperationOutcome` SHOULD be returned. | §3.3.0.6.2 | — | — |
| OP-PARM-007 | Async execution requested via `Prefer: respond-async`. | §3.3.0.7 | — | — |

## 18. Standard operations catalogue (§operations list)

| ID | Operation | Scope | Purpose | Resource(s) |
|----|-----------|-------|---------|-------------|
| OP-VAL-001 | `$validate` | System, Type, Instance | "Validate a resource" against structure, constraints, profiles, terminology. Returns `OperationOutcome`. | Any |
| OP-META-001 | `$meta` | System, Type, Instance | Access profiles, tags, security labels of a resource (or across resources). | Any |
| OP-META-002 | `$meta-add` | Instance | Add profiles, tags, security labels. | Any |
| OP-META-003 | `$meta-delete` | Instance | Delete profiles, tags, security labels. | Any |
| OP-CONV-001 | `$convert` | System | Convert between content formats (e.g. XML↔JSON, v2↔FHIR). | Any |
| OP-GQL-001 | `$graphql` | System, Instance | Execute GraphQL query. | Any |
| OP-GRAPH-001 | `$graph` | Instance | Retrieve a connected graph of related resources. | Any |
| OP-EV-001 | `$everything` | Instance | Retrieve comprehensive data related to a subject. | Patient, Encounter, Group, EpisodeOfCare |
| OP-EXP-001 | `$expand` | System, Type | Expand a ValueSet to its full membership. | ValueSet |
| OP-VC-001 | `$validate-code` | System, Type | Validate whether a code is in a ValueSet/CodeSystem. | ValueSet, CodeSystem |
| OP-LOOK-001 | `$lookup` | System, Type | Lookup a concept's definition and properties. | CodeSystem |
| OP-SUB-001 | `$subsumes` | System, Type | Test subsumption relationship. | CodeSystem |
| OP-FIND-001 | `$find-matches` | System, Type | Discover codes via property criteria. | CodeSystem |
| OP-TRAN-001 | `$translate` | System, Type | Map code via a ConceptMap. | ConceptMap |
| OP-CLOS-001 | `$closure` | System | Maintain a concept closure table. | ConceptMap |
| OP-DOC-001 | `$document` | Instance | "Generate a Document" from a Composition. | Composition |
| OP-APPLY-001 | `$apply` | System, Type, Instance | Apply a definitional artifact to a context. | PlanDefinition, ActivityDefinition, ChargeItemDefinition, SpecimenDefinition |
| OP-TRANS-001 | `$transform` | System, Type | Apply a StructureMap. | StructureMap |
| OP-MATCH-001 | `$match` | Type | Find Patient matches using MPI logic. | Patient |
| OP-MERGE-001 | `$merge` | Type | Merge duplicate Patient records. | Patient |
| OP-SUBMIT-001 | `$submit` | System, Type | Submit claim/eligibility for processing. | Claim, CoverageEligibilityRequest |

## 19. $validate details (https://hl7.org/fhir/R5/resource-operation-validate.html)

| ID | Rule | Source | Notes |
|----|------|--------|-------|
| OP-VAL-002 | URL: `POST [base]/[Type]/$validate` or `POST [base]/[Type]/[id]/$validate`. | OperationDefinition/Resource-validate | Type-level or instance-level. |
| OP-VAL-003 | Input parameters: `resource` (0..1 Resource), `mode` (0..1 code ∈ {create, update, delete, profile, *absent*}), `profile` (0..1 canonical), `usageContext` (0..* UsageContext). | OperationDefinition | `resource` SHALL be present unless mode=delete. |
| OP-VAL-004 | Output: single parameter `return` of type `OperationOutcome`. "If the operation outcome does not list any errors, and a mode was specified, then this is an indication that the operation would be expected to succeed." | OperationDefinition | — |
| OP-VAL-005 | Mode semantics — (default) validate schema+constraints+terminology; `create` also checks acceptability as new (e.g. uniqueness); `update` checks acceptability against existing (e.g. immutability); `delete` validates deletability (referential integrity); `profile` asserts profile conformance. | OperationDefinition | — |

## 20. $expand details (ValueSet)

| ID | Rule | Source | Notes |
|----|------|--------|-------|
| OP-EXP-002 | `POST [base]/ValueSet/$expand` or `POST [base]/ValueSet/[id]/$expand` or GET with primitive params. | OperationDefinition/ValueSet-expand | — |
| OP-EXP-003 | Key parameters: `url` (canonical), `valueSet` (ValueSet resource inline), `valueSetVersion`, `filter` (string substring filter), `count` (offset into expansion), `offset`, `includeDesignations`, `includeDefinition`, `activeOnly`, `excludeNested`, `displayLanguage`. | OperationDefinition | — |
| OP-EXP-004 | Output: single `return` parameter of type ValueSet (expanded). | OperationDefinition | — |

## 21. $lookup / $translate / $everything / $document details

| ID | Rule | Source | Notes |
|----|------|--------|-------|
| OP-LOOK-002 | `$lookup` input: `code`, `system`, `version`, `coding`, `date`, `displayLanguage`, `property`. Output: `name`, `display`, `designation`, `property` (multi-part), etc. | OperationDefinition/CodeSystem-lookup | — |
| OP-TRAN-002 | `$translate` input: `url` (ConceptMap), `system`+`code` or `coding` or `codeableConcept`, `target`, `targetsystem`. Output: `result`, `message`, `match` (parts: `equivalence`/`relationship`, `concept`, `product`). | OperationDefinition/ConceptMap-translate | R5 uses `relationship` in place of deprecated `equivalence`. |
| OP-EV-002 | `$everything` input: `start`, `end`, `_since`, `_type`, `_count`. Output: single `return` parameter of type `Bundle`. | OperationDefinition/Patient-everything | Bundle.type = `searchset`. |
| OP-DOC-002 | `$document` input: `id` (Composition id), `persist`, `graph`. Output: `return` of type Bundle with `type=document`. | OperationDefinition/Composition-document | Bundle.entry[0] = Composition. |

## 22. Paging semantics for operation responses

| ID | Rule | Source | Notes |
|----|------|--------|-------|
| OP-PAGE-001 | When an operation returns a Bundle that may be paged, standard `Bundle.link` paging rules apply (see search rules §8). | §3.2.1.3.3 | — |
| OP-PAGE-002 | `$everything` Bundle MAY be paged; clients follow `link.next`. | OperationDefinition/Patient-everything | — |

## 23. Interaction matrix — which verb + URL → which interaction

| HTTP | URL shape | Interaction |
|------|-----------|-------------|
| GET | `[base]/metadata` | capabilities |
| GET | `[base]/[type]/[id]` | read |
| GET | `[base]/[type]/[id]/_history/[vid]` | vread |
| PUT | `[base]/[type]/[id]` | update |
| PUT | `[base]/[type]?...` | conditional update |
| PATCH | `[base]/[type]/[id]` | patch |
| PATCH | `[base]/[type]?...` | conditional patch |
| DELETE | `[base]/[type]/[id]` | delete |
| DELETE | `[base]/[type]?...` | conditional delete |
| POST | `[base]/[type]` | create (+ If-None-Exist for conditional create) |
| GET | `[base]/[type]/[id]/_history` | instance history |
| GET | `[base]/[type]/_history` | type history |
| GET | `[base]/_history` | system history |
| GET | `[base]/[type]?params` | search |
| POST | `[base]/[type]/_search` | search (POST) |
| POST | `[base]` | batch/transaction |
| GET/POST | `[base]/$op` / `[base]/[type]/$op` / `[base]/[type]/[id]/$op` | operation |
| HEAD | any read/vread/search/history URL | header-only probe |

---

## Cross-references

- `r5-search-rules.md` — full parameter/modifier/prefix rules for search URLs used by `conditional-*` interactions and `_has`/chained parameters inside transactions.
- `fhirpath-n1-rules.md` — referenced from `$validate` constraints and from `_filter` parameters inside searches invoked during conditional operations.
- Async endpoints: https://hl7.org/fhir/R5/async-bulk.html (bulk data) and https://hl7.org/fhir/R5/async-bundle.html (interaction-async) — deep dives flagged for DSLExplorer.
- OperationDefinition metamodel: each operation's full parameter set is machine-readable at `OperationDefinition/<name>` — test-engineer should lift parameter shapes from the canonical URLs rather than duplicate them here.

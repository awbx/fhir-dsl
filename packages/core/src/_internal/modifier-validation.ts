// FHIR R5 §3.2.1.5.5: each modifier applies only to certain param types.
// The runtime doesn't carry param-type metadata, so we validate against a
// conservative allowlist of well-known FHIR R5 search params. Unknown param
// names (custom, extension, or profile-specific) skip validation — blocking
// them would force users to disable the check for every bespoke search.

const STRING_ONLY_MODIFIERS: ReadonlySet<string> = new Set(["exact", "contains"]);

// FHIR R5 search params whose type is NOT string — emitting `:exact` or
// `:contains` against these is malformed per §3.2.1.5.5.
const NON_STRING_PARAMS: ReadonlySet<string> = new Set([
  // date / dateTime / Period
  "birthdate",
  "death-date",
  "date",
  "effective-date",
  "authored",
  "authored-on",
  "recorded",
  "recorded-date",
  "onset-date",
  "onset",
  "period",
  "occurrence",
  "started",
  "performed-date",
  "due-date",
  "sent",
  "received",
  "_lastUpdated",
  // number
  "_count",
  "_offset",
  "risk-score",
  "probability",
  // quantity
  "value-quantity",
  "component-value-quantity",
  "weight",
  "height",
  // token
  "code",
  "status",
  "gender",
  "identifier",
  "type",
  "category",
  "class",
  "priority",
  "intent",
  "outcome",
  "active",
  // reference
  "patient",
  "subject",
  "organization",
  "performer",
  "author",
  "encounter",
  "based-on",
  "part-of",
  "general-practitioner",
  // uri
  "url",
  "system",
]);

export function assertModifierApplies(paramName: string, modifier: string): void {
  if (!STRING_ONLY_MODIFIERS.has(modifier)) return;
  if (NON_STRING_PARAMS.has(paramName)) {
    throw new Error(
      `where(${JSON.stringify(paramName)}, "${modifier}", ...): modifier :${modifier} applies only to string-typed search params (FHIR R5 §3.2.1.5.5). "${paramName}" is not a string-typed param.`,
    );
  }
}

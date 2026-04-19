/**
 * FHIR R5 §3.2.1.5.7 — when any of `, | $ \` appear in a search parameter
 * *value*, they must be prepended with `\`. `\` itself must be doubled.
 *
 * Scope: escapes `,`, `$`, `\` in values that will be joined by a separator
 * (`,` for OR lists, `$` for composite parts). `|` is NOT escaped here
 * because the DSL cannot yet distinguish a literal `|` inside a string from
 * the system|code / value|system|code separator carried in the same raw
 * string — a full fix requires a typed token/quantity API.
 */
export function escapeSearchValue(value: string | number): string {
  const s = String(value);
  // Backslash first so we don't double-escape `\,` → `\\,` → `\\\\,`.
  return s.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll("$", "\\$");
}

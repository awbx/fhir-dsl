/**
 * FHIRPath §2.1.20: string operations are defined over Unicode code points,
 * with the MUST-language requirement that strings be normalized to NFC before
 * comparison. JavaScript's default `.length`, `.indexOf`, `.substring`, and
 * `===` operate on UTF-16 code units on raw (potentially NFD) strings —
 * which silently mismatches NFC-only FHIR servers.
 *
 * These helpers are the boundary where we normalize and count by code point.
 */

/** Normalize a string to NFC. Cheap if already NFC. */
export function toNFC(s: string): string {
  return s.normalize("NFC");
}

/** Count code points (not UTF-16 units). String is NFC-normalized first. */
export function codePointLength(s: string): number {
  let n = 0;
  for (const _ of toNFC(s)) n++;
  return n;
}

/** Slice a string by code-point offsets. Start/length are code-point indices. */
export function codePointSlice(s: string, start: number, length?: number): string {
  const chars = Array.from(toNFC(s));
  if (length == null) return chars.slice(start).join("");
  return chars.slice(start, start + length).join("");
}

/** Code-point-aware indexOf. -1 if not found. NFC-normalizes both operands. */
export function codePointIndexOf(haystack: string, needle: string): number {
  const hay = toNFC(haystack);
  const hit = toNFC(needle);
  const raw = hay.indexOf(hit);
  if (raw < 0) return -1;
  // Convert the UTF-16 raw index to a code-point index.
  let cp = 0;
  for (let i = 0; i < raw; ) {
    const code = hay.charCodeAt(i);
    i += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
    cp++;
  }
  return cp;
}

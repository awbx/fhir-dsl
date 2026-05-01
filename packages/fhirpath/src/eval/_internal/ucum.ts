/**
 * Pragmatic UCUM core for FHIRPath Quantity comparisons. Issue #51.
 *
 * Coverage:
 *   - SI base units: m, g, s, mol, K, A, cd
 *   - SI prefixes: n μ u m c d da h k M G T  (`u` is the ASCII alias for μ)
 *   - Common derived/healthcare units: L (volume), Hz, Pa, N, J, W, V, Ω,
 *     mmHg, bar, eq, mEq, [iU] (treated as label-only)
 *   - Time: s, min, h, d, wk, mo, a  with conversion to seconds
 *   - Compound forms with one `/`: `mg/dL`, `mmol/L`, `/min`, `kg/m2`
 *   - Bracketed UCUM specials: `mm[Hg]` → mmHg
 *
 * Out of scope (throws / returns null with a clear reason):
 *   - Multi-factor compounds like `mol/(L.s)` — only single `/` parsed
 *   - Offset units: Celsius, Fahrenheit, pH (these are not pure scale)
 *   - Logarithmic units: bel, decibel, neper
 *   - Annotated codes like `{count}`
 *
 * Use `convert(value, fromUnit, toUnit)` to scale across same-dimension
 * units. Use `parseUnit(unit)` for the canonical form.
 */

/** SI base dimension vector. Each axis records the exponent of that base. */
export interface Dim {
  m: number;
  g: number;
  s: number;
  mol: number;
  K: number;
  A: number;
  cd: number;
}

const ZERO: Readonly<Dim> = { m: 0, g: 0, s: 0, mol: 0, K: 0, A: 0, cd: 0 };

function dim(partial: Partial<Dim>): Dim {
  return { ...ZERO, ...partial };
}

function dimEqual(a: Readonly<Dim>, b: Readonly<Dim>): boolean {
  return a.m === b.m && a.g === b.g && a.s === b.s && a.mol === b.mol && a.K === b.K && a.A === b.A && a.cd === b.cd;
}

function dimMul(a: Readonly<Dim>, n: number): Dim {
  return { m: a.m * n, g: a.g * n, s: a.s * n, mol: a.mol * n, K: a.K * n, A: a.A * n, cd: a.cd * n };
}

function dimDiv(a: Readonly<Dim>, b: Readonly<Dim>): Dim {
  return {
    m: a.m - b.m,
    g: a.g - b.g,
    s: a.s - b.s,
    mol: a.mol - b.mol,
    K: a.K - b.K,
    A: a.A - b.A,
    cd: a.cd - b.cd,
  };
}

function dimSum(a: Readonly<Dim>, b: Readonly<Dim>): Dim {
  return {
    m: a.m + b.m,
    g: a.g + b.g,
    s: a.s + b.s,
    mol: a.mol + b.mol,
    K: a.K + b.K,
    A: a.A + b.A,
    cd: a.cd + b.cd,
  };
}

export interface CanonicalUnit {
  /** Multiplier from this unit to its SI canonical form. */
  factor: number;
  dim: Dim;
}

/** SI prefixes — multiplicative factors keyed by short symbol. */
const PREFIXES: Record<string, number> = {
  y: 1e-24,
  z: 1e-21,
  a: 1e-18, // attention: 'a' as a prefix conflicts with the year unit symbol — handled in parseUnit by trying base lookup first.
  f: 1e-15,
  p: 1e-12,
  n: 1e-9,
  μ: 1e-6,
  u: 1e-6,
  m: 1e-3, // 'm' conflicts with metre — handled by base-first lookup.
  c: 1e-2,
  d: 1e-1,
  da: 1e1,
  h: 1e2,
  k: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  P: 1e15,
  E: 1e18,
  Z: 1e21,
  Y: 1e24,
};

/**
 * Base units. Keys are the exact symbol (no prefix). The g entry is mass
 * canonicalised to grams (UCUM convention) — kg is then a prefixed g.
 */
const BASE_UNITS: Record<string, CanonicalUnit> = {
  // SI base
  m: { factor: 1, dim: dim({ m: 1 }) },
  g: { factor: 1, dim: dim({ g: 1 }) },
  s: { factor: 1, dim: dim({ s: 1 }) },
  mol: { factor: 1, dim: dim({ mol: 1 }) },
  K: { factor: 1, dim: dim({ K: 1 }) },
  A: { factor: 1, dim: dim({ A: 1 }) },
  cd: { factor: 1, dim: dim({ cd: 1 }) },

  // Time
  min: { factor: 60, dim: dim({ s: 1 }) },
  h: { factor: 3600, dim: dim({ s: 1 }) },
  d: { factor: 86400, dim: dim({ s: 1 }) },
  wk: { factor: 604800, dim: dim({ s: 1 }) },
  // UCUM: 1 mo = 30 d (mean Gregorian month is 30.4167; UCUM rounds), 1 a = 365.25 d
  mo: { factor: 2592000, dim: dim({ s: 1 }) },
  a: { factor: 31557600, dim: dim({ s: 1 }) },

  // Volume — UCUM uses 'L' with allowance for lowercase 'l' as a synonym.
  // 1 L = 1 dm³ = 0.001 m³.
  L: { factor: 1e-3, dim: dim({ m: 3 }) },
  l: { factor: 1e-3, dim: dim({ m: 3 }) },

  // Frequency, force, energy, power, charge, voltage, resistance.
  Hz: { factor: 1, dim: dim({ s: -1 }) },
  // 1 N = 1 kg·m/s² = 1000 g·m/s² (factor 1000 since base is g)
  N: { factor: 1000, dim: dim({ g: 1, m: 1, s: -2 }) },
  // 1 Pa = 1 N/m² = 1000 g/(m·s²)
  Pa: { factor: 1000, dim: dim({ g: 1, m: -1, s: -2 }) },
  J: { factor: 1000, dim: dim({ g: 1, m: 2, s: -2 }) },
  W: { factor: 1000, dim: dim({ g: 1, m: 2, s: -3 }) },
  // Coulomb = A·s
  C: { factor: 1, dim: dim({ A: 1, s: 1 }) },
  V: { factor: 1000, dim: dim({ g: 1, m: 2, s: -3, A: -1 }) },
  // Ohm = V/A = kg·m²·s⁻³·A⁻²  (factor 1000 since base is g)
  Ω: { factor: 1000, dim: dim({ g: 1, m: 2, s: -3, A: -2 }) },

  // Pressure: mmHg → Pa via 1 mmHg ≈ 133.322387415 Pa = 133322.387 g/(m·s²)
  // bar = 1e5 Pa = 1e8 g/(m·s²)
  // Encoded as the canonical mmHg name AND the bracketed [Hg] form (parser
  // splits the bracket).
  mmHg: { factor: 133322.387415, dim: dim({ g: 1, m: -1, s: -2 }) },
  bar: { factor: 1e8, dim: dim({ g: 1, m: -1, s: -2 }) },
  atm: { factor: 1.01325e8, dim: dim({ g: 1, m: -1, s: -2 }) },

  // Substance amount aliases / IUs / Equivalents — treated as label-only
  // units (dimension = none-but-distinct). UCUM treats `[iU]`, `eq`, etc.
  // as countable. We use a sentinel dimension on cd to keep them distinct
  // from pure dimensionless without colliding with real cd-units.
  // (Healthcare codes that reach here are typically count-shaped; users
  // comparing IU to IU will succeed, IU to mg will not.)
  "[iU]": { factor: 1, dim: dim({ cd: 1 /* sentinel */ }) },
  eq: { factor: 1, dim: dim({ cd: 1 }) },
  // Plain dimensionless / count.
  "1": { factor: 1, dim: ZERO },
  "{count}": { factor: 1, dim: ZERO },
  rad: { factor: 1, dim: ZERO },
  sr: { factor: 1, dim: ZERO },
};

/** Synonyms — the parser treats these as their canonical form. */
const SYNONYMS: Record<string, string> = {
  // mm[Hg] is the official UCUM bracket form for mmHg.
  "mm[Hg]": "mmHg",
};

/** Special / offset / log units — recognised so we can throw clearly. */
const UNSUPPORTED: Record<string, string> = {
  Cel: "Celsius is an offset unit (not pure scale); convert upstream",
  "[degF]": "Fahrenheit is an offset unit (not pure scale); convert upstream",
  "[pH]": "pH is a logarithmic unit; not supported",
  B: "bel is a logarithmic unit; not supported",
  dB: "decibel is a logarithmic unit; not supported",
  Np: "neper is a logarithmic unit; not supported",
};

export class UcumError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UcumError";
  }
}

/**
 * Parse a UCUM unit string into its canonical SI form.
 * Returns null when the unit is not recognised (caller should fall back
 * to raw-string equality). Throws UcumError for unsupported special
 * units (Celsius, pH, decibel) so callers don't silently produce wrong
 * results.
 */
export function parseUnit(unit: string): CanonicalUnit | null {
  const trimmed = unit.trim();
  if (trimmed === "") return null;

  // Synonym fold (mm[Hg] → mmHg).
  const folded = SYNONYMS[trimmed] ?? trimmed;

  // Unsupported sentinel — explicit failure beats silent wrong answer.
  if (UNSUPPORTED[folded] !== undefined) {
    throw new UcumError(`Unsupported UCUM unit '${folded}': ${UNSUPPORTED[folded]}`);
  }

  // Compound: leading `/` (inverse only), or one infix `/`.
  if (folded.startsWith("/")) {
    const rest = folded.slice(1);
    const denom = parseAtom(rest);
    if (!denom) return null;
    return { factor: 1 / denom.factor, dim: dimMul(denom.dim, -1) };
  }

  // Exponent suffix: `m2`, `s-1`, `kg/m2` etc. We treat a trailing
  // signed integer right after the symbol as the exponent.
  const slash = folded.indexOf("/");
  if (slash > -1) {
    const num = folded.slice(0, slash);
    const den = folded.slice(slash + 1);
    const numU = parseAtom(num);
    const denU = parseAtom(den);
    if (!numU || !denU) return null;
    return { factor: numU.factor / denU.factor, dim: dimDiv(numU.dim, denU.dim) };
  }

  return parseAtom(folded);
}

/**
 * Parse a single atom (no `/`): symbol + optional exponent, with
 * optional SI prefix. Returns null on miss.
 */
function parseAtom(atom: string): CanonicalUnit | null {
  const trimmed = atom.trim();
  if (trimmed === "") return null;

  // Trailing signed integer is the exponent.
  const expMatch = trimmed.match(/^(.*?)(-?\d+)$/);
  let symbol = trimmed;
  let exponent = 1;
  if (expMatch) {
    const body = expMatch[1] ?? "";
    const exp = expMatch[2] ?? "1";
    if (body !== "" && /^-?\d+$/.test(exp)) {
      symbol = body;
      exponent = Number.parseInt(exp, 10);
    }
  }

  const base = lookupBase(symbol);
  if (!base) return null;
  if (exponent === 1) return base;
  return { factor: base.factor ** exponent, dim: dimMul(base.dim, exponent) };
}

/** Try direct lookup, then prefix+base. */
function lookupBase(symbol: string): CanonicalUnit | null {
  if (BASE_UNITS[symbol]) return BASE_UNITS[symbol];
  if (UNSUPPORTED[symbol] !== undefined) {
    throw new UcumError(`Unsupported UCUM unit '${symbol}': ${UNSUPPORTED[symbol]}`);
  }

  // Try 2-char then 1-char prefix.
  for (const len of [2, 1]) {
    if (symbol.length <= len) continue;
    const pre = symbol.slice(0, len);
    const rest = symbol.slice(len);
    if (PREFIXES[pre] !== undefined && BASE_UNITS[rest]) {
      const base = BASE_UNITS[rest];
      return { factor: PREFIXES[pre] * base.factor, dim: base.dim };
    }
  }
  return null;
}

/** Same dimension iff conversion is meaningful. */
export function compatible(a: CanonicalUnit, b: CanonicalUnit): boolean {
  return dimEqual(a.dim, b.dim);
}

/**
 * Convert `value` from `fromUnit` to `toUnit`. Returns the converted
 * scalar, or null when units are incompatible (different dimensions)
 * or unrecognised.
 */
export function convert(value: number, fromUnit: string, toUnit: string): number | null {
  const from = parseUnit(fromUnit);
  const to = parseUnit(toUnit);
  if (!from || !to) return null;
  if (!compatible(from, to)) return null;
  return (value * from.factor) / to.factor;
}

/** Equality with UCUM semantics: convert b to a's unit and compare values. */
export function quantityEqual(
  a: { value: number; unit: string },
  b: { value: number; unit: string },
  epsilon = 1e-9,
): boolean | null {
  if (a.unit === b.unit) return a.value === b.value;
  const converted = convert(b.value, b.unit, a.unit);
  if (converted === null) return null;
  return Math.abs(converted - a.value) < epsilon * Math.max(1, Math.abs(a.value));
}

/** Ordered comparison; returns -1/0/1 or null when incompatible. */
export function quantityCompare(
  a: { value: number; unit: string },
  b: { value: number; unit: string },
): -1 | 0 | 1 | null {
  if (a.unit === b.unit) return Math.sign(a.value - b.value) as -1 | 0 | 1;
  const converted = convert(b.value, b.unit, a.unit);
  if (converted === null) return null;
  return Math.sign(a.value - converted) as -1 | 0 | 1;
}

/** Sum of two compatible quantities, expressed in `a`'s unit. */
export function quantityAdd(
  a: { value: number; unit: string },
  b: { value: number; unit: string },
): { value: number; unit: string } | null {
  const converted = convert(b.value, b.unit, a.unit);
  if (converted === null) return null;
  return { value: a.value + converted, unit: a.unit };
}

/** Difference of two compatible quantities, expressed in `a`'s unit. */
export function quantitySub(
  a: { value: number; unit: string },
  b: { value: number; unit: string },
): { value: number; unit: string } | null {
  const converted = convert(b.value, b.unit, a.unit);
  if (converted === null) return null;
  return { value: a.value - converted, unit: a.unit };
}

// Internal helpers re-exported for the equality module.
export const _internal = { dim, dimSum, dimEqual };

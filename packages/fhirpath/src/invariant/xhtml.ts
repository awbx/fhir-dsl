// `htmlChecks()` for FHIR R4 Narrative.div (txt-1 / txt-2). A small XHTML
// tag scanner, not a full XML parser: it only has to tell a clear violation
// of the Narrative rules (https://hl7.org/fhir/R4/narrative.html) apart from
// acceptable content. Markup it cannot read with certainty is reported as
// "unknown" so the caller can return an indeterminate result instead of
// rejecting data that may be valid.

const XHTML_NS = "http://www.w3.org/1999/xhtml";

// HTML 4.0 chapters 7-11 (minus 9.4, ins/del) and 15, plus <a> and images,
// without the elements the Narrative rules exclude (html/head/body/title/meta,
// scripts, forms, frames, objects, base/link) and without the elements
// HTML 4.0 deprecates (u, s, strike, font, basefont, center, dir, menu, ...).
const ALLOWED_ELEMENTS: ReadonlySet<string> = new Set([
  // ch 7: global structure
  "div",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "address",
  // ch 8: language
  "bdo",
  // ch 9: text
  "em",
  "strong",
  "dfn",
  "code",
  "samp",
  "kbd",
  "var",
  "cite",
  "abbr",
  "acronym",
  "blockquote",
  "q",
  "sub",
  "sup",
  "p",
  "br",
  "pre",
  // ch 10: lists
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  // ch 11: tables
  "table",
  "caption",
  "thead",
  "tfoot",
  "tbody",
  "colgroup",
  "col",
  "tr",
  "th",
  "td",
  // ch 15: font style, rules
  "tt",
  "i",
  "b",
  "big",
  "small",
  "hr",
  // links and images
  "a",
  "img",
  "map",
  "area",
]);

/** Thrown when the markup can't be read with certainty. */
export class XhtmlUnknownError extends Error {}

function unknown(message: string): never {
  throw new XhtmlUnknownError(message);
}

const NAME = /^[A-Za-z_][A-Za-z0-9_.:-]*/;

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g, (whole, body: string) => {
    if (body[0] !== "#") {
      const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
      // Other named entities (e.g. &nbsp;) stand for a visible character.
      return named[body] ?? " ";
    }
    const code = body[1] === "x" ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
    if (!Number.isFinite(code) || code > 0x10ffff) unknown(`bad character reference ${whole}`);
    return String.fromCodePoint(code);
  });
}

function checkEntities(text: string): void {
  // Every `&` must start a well-formed reference.
  const stripped = text.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g, "");
  if (stripped.includes("&")) unknown("unescaped '&'");
}

function isXmlWhitespace(text: string): boolean {
  return /^[ \t\r\n]*$/.test(text);
}

/**
 * Check a Narrative.div string. Returns true when it meets the rules, false on
 * a clear violation, and throws `XhtmlUnknownError` when the markup can't be
 * read with certainty.
 */
export function checkNarrativeXhtml(source: string): boolean {
  let i = 0;
  const n = source.length;
  const stack: string[] = [];
  let rootSeen = false;
  let rootClosed = false;
  let hasContent = false;
  let violation = false;

  const skipWs = () => {
    while (i < n && /[ \t\r\n]/.test(source[i]!)) i++;
  };

  while (i < n) {
    const lt = source.indexOf("<", i);
    const textEnd = lt === -1 ? n : lt;
    if (textEnd > i) {
      const text = source.slice(i, textEnd);
      if (text.includes("]]>")) unknown("']]>' in text");
      if (stack.length === 0) {
        if (!isXmlWhitespace(text)) unknown("text outside the root element");
      } else {
        checkEntities(text);
        if (!isXmlWhitespace(decodeEntities(text))) hasContent = true;
      }
      i = textEnd;
      continue;
    }
    // At '<'.
    if (source.startsWith("<!--", i)) {
      const end = source.indexOf("-->", i + 4);
      if (end === -1) unknown("unterminated comment");
      if (source.slice(i + 4, end).includes("--")) unknown("'--' inside comment");
      i = end + 3;
      continue;
    }
    if (source.startsWith("<![CDATA[", i)) {
      if (stack.length === 0) unknown("CDATA outside the root element");
      const end = source.indexOf("]]>", i + 9);
      if (end === -1) unknown("unterminated CDATA section");
      if (!isXmlWhitespace(source.slice(i + 9, end))) hasContent = true;
      i = end + 3;
      continue;
    }
    if (source.startsWith("<!", i) || source.startsWith("<?", i)) {
      // DOCTYPE, entity declarations, processing instructions.
      unknown("declaration or processing instruction");
    }
    if (source.startsWith("</", i)) {
      i += 2;
      const m = NAME.exec(source.slice(i));
      if (!m) unknown("malformed end tag");
      const name = m[0];
      i += name.length;
      skipWs();
      if (source[i] !== ">") unknown("malformed end tag");
      i++;
      const open = stack.pop();
      if (open !== name) unknown(`mismatched end tag </${name}>`);
      if (stack.length === 0) rootClosed = true;
      continue;
    }
    // Start tag.
    i++;
    const m = NAME.exec(source.slice(i));
    if (!m) unknown("malformed start tag");
    const name = m[0];
    i += name.length;
    const attrs = new Map<string, string>();
    let selfClosing = false;
    for (;;) {
      const before = i;
      skipWs();
      if (i >= n) unknown("unterminated start tag");
      if (source[i] === ">") {
        i++;
        break;
      }
      if (source.startsWith("/>", i)) {
        i += 2;
        selfClosing = true;
        break;
      }
      if (i === before) unknown("missing whitespace between attributes");
      const am = NAME.exec(source.slice(i));
      if (!am) unknown("malformed attribute");
      const attr = am[0];
      i += attr.length;
      skipWs();
      if (source[i] !== "=") unknown(`attribute ${attr} without a value`);
      i++;
      skipWs();
      const quote = source[i];
      if (quote !== '"' && quote !== "'") unknown(`unquoted value for ${attr}`);
      const end = source.indexOf(quote, i + 1);
      if (end === -1) unknown("unterminated attribute value");
      const raw = source.slice(i + 1, end);
      if (raw.includes("<")) unknown("'<' in attribute value");
      checkEntities(raw);
      if (attrs.has(attr)) unknown(`duplicate attribute ${attr}`);
      attrs.set(attr, decodeEntities(raw));
      i = end + 1;
    }

    if (stack.length === 0) {
      if (rootSeen) unknown("more than one root element");
      rootSeen = true;
      // Root must be <div> in the XHTML namespace.
      if (name.includes(":")) unknown("prefixed root element");
      if (name !== "div") return false;
      if (attrs.get("xmlns") !== XHTML_NS) return false;
    } else {
      if (name.includes(":")) unknown(`prefixed element ${name}`);
      const ns = attrs.get("xmlns");
      if (ns !== undefined && ns !== XHTML_NS) unknown(`element ${name} in another namespace`);
      if (!ALLOWED_ELEMENTS.has(name.toLowerCase())) violation = true;
    }
    if (name.toLowerCase() === "img") hasContent = true;

    for (const [attr, value] of attrs) {
      const lower = attr.toLowerCase();
      // Event handler attributes (onclick, onload, ...).
      if (lower.startsWith("on")) violation = true;
      if (lower.startsWith("xlink:")) violation = true;
      // javascript: URLs, ignoring whitespace / control chars browsers skip.
      // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping control characters is the point
      const compact = value.replace(/[\u0000- ]/g, "").toLowerCase();
      if (compact.startsWith("javascript:") || compact.startsWith("vbscript:")) violation = true;
    }

    if (!selfClosing) stack.push(name);
    else if (stack.length === 0) rootClosed = true;
  }

  if (!rootSeen) unknown("no root element");
  if (stack.length > 0 || !rootClosed) unknown("unclosed element");
  if (violation) return false;
  return hasContent;
}

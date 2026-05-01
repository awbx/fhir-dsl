// Docusaurus plugin: inject TechArticle JSON-LD into every built /docs/api/*.html
// page after the build. Docs frontmatter doesn't support `head:`, so this is the
// cleanest way to get per-page structured data into the static HTML for SEO.
//
// Reads each page's <title> (already populated by Docusaurus from the doc's
// frontmatter title) and the og:description meta tag for the description, so
// no per-file maintenance is needed when API ref pages change.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://awbx.github.io/fhir-dsl";

function buildJsonLd({ title, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    name: title,
    description,
    url,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "fhir-dsl docs",
      url: `${SITE}/`,
    },
    about: {
      "@type": "SoftwareSourceCode",
      name: "fhir-dsl",
      codeRepository: "https://github.com/awbx/fhir-dsl",
      programmingLanguage: "TypeScript",
    },
    author: { "@type": "Person", name: "Abdelhadi Sabani" },
    publisher: { "@type": "Person", name: "Abdelhadi Sabani" },
    proficiencyLevel: "Expert",
    articleSection: "API Reference",
  };
}

function extractMeta(html) {
  // Docusaurus emits both <title> and <meta name="description"> in head.
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
  const descMatch =
    html.match(/<meta[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']+)["']/) ||
    html.match(/<meta[^>]*\bcontent=["']([^"']+)["'][^>]*\bname=["']description["']/);
  if (!titleMatch || !descMatch) return null;
  // Strip Docusaurus's " | site title" suffix from <title> for cleaner JSON-LD.
  const title = titleMatch[1].replace(/\s*\|\s*fhir-dsl\s*$/, "");
  return { title, description: descMatch[1] };
}

function injectJsonLd(html, ld) {
  const tag = `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
  // Insert just before </head> so it lands among the other head tags.
  return html.replace(/<\/head>/, `${tag}</head>`);
}

export default function apiJsonLdPlugin() {
  return {
    name: "api-jsonld-plugin",
    async postBuild({ outDir }) {
      const apiDir = join(outDir, "docs", "api");
      let stats;
      try {
        stats = statSync(apiDir);
      } catch {
        return;
      }
      if (!stats.isDirectory()) return;

      let injected = 0;
      for (const entry of readdirSync(apiDir)) {
        if (!entry.endsWith(".html")) continue;
        const path = join(apiDir, entry);
        const html = readFileSync(path, "utf-8");
        const meta = extractMeta(html);
        if (!meta) continue;
        const slug = entry.replace(/\.html$/, "");
        const url = `${SITE}/docs/api/${slug}`;
        const ld = buildJsonLd({ ...meta, url });
        writeFileSync(path, injectJsonLd(html, ld), "utf-8");
        injected++;
      }
      if (injected > 0) {
        // eslint-disable-next-line no-console
        console.log(`[api-jsonld-plugin] injected TechArticle JSON-LD into ${injected} API ref pages`);
      }
    },
  };
}

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const changelogPath = join(root, "CHANGELOG.md");
const docsChangelogPath = join(root, "apps", "docs", "docs", "changelog.md");

const DOCS_FRONTMATTER = `---
id: changelog
title: Changelog
sidebar_label: Changelog
---

`;

/**
 * Get all version tags sorted by version descending.
 */
function getTags() {
  const output = execSync("git tag --sort=-version:refname", { encoding: "utf-8" }).trim();
  return output ? output.split("\n").filter((t) => /^v\d+\.\d+\.\d+/.test(t)) : [];
}

/**
 * Get the date of a tag.
 */
function getTagDate(tag) {
  return execSync(`git log -1 --format=%ai ${tag}`, { encoding: "utf-8" }).trim().slice(0, 10);
}

/**
 * Get commits between two refs, excluding version bump commits.
 */
function getCommits(from, to) {
  const range = from ? `${from}..${to}` : to;
  const output = execSync(`git log --oneline --no-merges ${range}`, { encoding: "utf-8" }).trim();
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => {
      const hash = line.slice(0, 7);
      const message = line.slice(8);
      return { hash, message };
    })
    .filter((c) => !c.message.match(/^v\d+\.\d+\.\d+/));
}

/**
 * Categorize a commit message.
 */
function categorize(message) {
  const lower = message.toLowerCase();
  if (lower.startsWith("fix")) return "Bug Fixes";
  if (lower.startsWith("add") || lower.startsWith("implement")) return "Features";
  if (lower.startsWith("remove") || lower.startsWith("delete")) return "Removals";
  if (lower.startsWith("update") || lower.startsWith("upgrade")) return "Improvements";
  if (lower.startsWith("refactor") || lower.startsWith("replace")) return "Improvements";
  if (lower.startsWith("expand") || lower.startsWith("enhance")) return "Improvements";
  return "Other";
}

/**
 * Generate the full changelog content.
 * If newVersion is provided, it's included as the latest unreleased version.
 */
export function generateChangelog(newVersion) {
  const tags = getTags();

  // If newVersion is provided, add it as a pending entry using HEAD
  const entries = [];

  if (newVersion) {
    const vTag = newVersion.startsWith("v") ? newVersion : `v${newVersion}`;
    const latestTag = tags[0];
    const commits = getCommits(latestTag, "HEAD");
    if (commits.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      entries.push({ tag: vTag, date: today, commits });
    }
  }

  // Process existing tags
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const prevTag = tags[i + 1];
    const date = getTagDate(tag);
    const commits = getCommits(prevTag, tag);
    if (commits.length > 0) {
      entries.push({ tag, date, commits });
    }
  }

  // Build markdown
  let md = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n";

  for (const entry of entries) {
    const version = entry.tag.replace(/^v/, "");
    md += `\n## [${version}] - ${entry.date}\n`;

    // Group by category
    const groups = {};
    for (const commit of entry.commits) {
      const cat = categorize(commit.message);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(commit);
    }

    // Output categories in a fixed order
    const order = ["Features", "Improvements", "Bug Fixes", "Removals", "Other"];
    for (const cat of order) {
      if (!groups[cat]) continue;
      md += `\n### ${cat}\n\n`;
      for (const c of groups[cat]) {
        md += `- ${c.message} (\`${c.hash}\`)\n`;
      }
    }
  }

  return md;
}

/**
 * Write changelog to disk. Called from bump-version.mjs or standalone.
 */
/**
 * MDX parses bare `<Word>` as JSX. Commit messages like `Reference<T>` or
 * `Map<K,V>` would fail the Docusaurus build. Escape `<` to `&lt;` everywhere
 * except inside code spans/blocks (which MDX already treats as literal).
 */
function sanitizeForMdx(content) {
  const parts = content.split(/(`[^`]*`)/g);
  return parts.map((p, i) => (i % 2 === 1 ? p : p.replace(/</g, "&lt;"))).join("");
}

export function writeChangelog(newVersion) {
  const content = generateChangelog(newVersion);
  writeFileSync(changelogPath, content);
  writeFileSync(docsChangelogPath, DOCS_FRONTMATTER + sanitizeForMdx(content));
  console.log(`  changelog: CHANGELOG.md`);
  console.log(`  changelog: apps/docs/docs/changelog.md`);
  return [changelogPath, docsChangelogPath];
}

// Allow standalone execution: node scripts/generate-changelog.mjs [--write] [newVersion]
const isMain = process.argv[1]?.endsWith("generate-changelog.mjs");
if (isMain) {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
  const version = args[0];
  const content = generateChangelog(version);
  if (flags.includes("--write")) {
    writeFileSync(changelogPath, content);
    writeFileSync(docsChangelogPath, DOCS_FRONTMATTER + sanitizeForMdx(content));
    console.log("Wrote CHANGELOG.md and docs/changelog.md");
  } else {
    process.stdout.write(content);
  }
}

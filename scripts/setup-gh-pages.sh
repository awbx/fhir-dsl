#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# GitHub Pages Setup Script for fhir-dsl
#
# Configures GitHub Pages deployment using the gh CLI.
# Safe to run multiple times (idempotent).
#
# Prerequisites:
#   - gh CLI installed and authenticated (gh auth status)
#   - Repository already exists on GitHub
# =============================================================================

REPO="awbx/fhir-dsl"
SITE_URL="https://awbx.github.io/fhir-dsl/"

# ---------------------------------------------------------------------------
# 1. Verify gh CLI authentication
# ---------------------------------------------------------------------------
echo "--- Checking gh authentication ---"
if ! gh auth status &>/dev/null; then
  echo "ERROR: gh CLI is not authenticated."
  echo "Run: gh auth login"
  exit 1
fi
echo "Authenticated."

# ---------------------------------------------------------------------------
# 2. Verify repository access
# ---------------------------------------------------------------------------
echo ""
echo "--- Verifying repository access ---"
if ! gh repo view "$REPO" --json nameWithOwner -q .nameWithOwner &>/dev/null; then
  echo "ERROR: Cannot access repository $REPO"
  exit 1
fi
echo "Repository $REPO is accessible."

# ---------------------------------------------------------------------------
# 3. Enable GitHub Pages (Actions source)
# ---------------------------------------------------------------------------
echo ""
echo "--- Configuring GitHub Pages ---"

# Use the GitHub API to set Pages source to GitHub Actions
# This is the modern approach — no gh-pages branch needed
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/pages" \
  -f "build_type=workflow" \
  2>/dev/null || \
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/pages" \
  -f "build_type=workflow" \
  2>/dev/null || \
echo "Pages already configured (or requires manual enable for first time)."

echo "GitHub Pages configured to deploy from GitHub Actions."

# ---------------------------------------------------------------------------
# 4. Verify Pages configuration
# ---------------------------------------------------------------------------
echo ""
echo "--- Verifying Pages configuration ---"
PAGES_STATUS=$(gh api "/repos/$REPO/pages" --jq '.status' 2>/dev/null || echo "not found")
PAGES_BUILD_TYPE=$(gh api "/repos/$REPO/pages" --jq '.build_type' 2>/dev/null || echo "unknown")
PAGES_URL=$(gh api "/repos/$REPO/pages" --jq '.html_url' 2>/dev/null || echo "$SITE_URL")

echo "Pages status: $PAGES_STATUS"
echo "Build type:   $PAGES_BUILD_TYPE"
echo "Site URL:     $PAGES_URL"

# ---------------------------------------------------------------------------
# 5. Verify workflow file exists
# ---------------------------------------------------------------------------
echo ""
echo "--- Checking workflow file ---"
if [ -f ".github/workflows/deploy-docs.yml" ]; then
  echo "Workflow file found: .github/workflows/deploy-docs.yml"
else
  echo "WARNING: .github/workflows/deploy-docs.yml not found."
  echo "Make sure to create it before pushing."
fi

# ---------------------------------------------------------------------------
# 6. Verify Docusaurus project
# ---------------------------------------------------------------------------
echo ""
echo "--- Checking Docusaurus project ---"
if [ -f "apps/docs/docusaurus.config.js" ]; then
  echo "Docusaurus config found: apps/docs/docusaurus.config.js"
else
  echo "WARNING: apps/docs/docusaurus.config.js not found."
fi

if [ -f "apps/docs/package.json" ]; then
  echo "Docs package.json found."
else
  echo "WARNING: apps/docs/package.json not found."
fi

# ---------------------------------------------------------------------------
# 7. Summary
# ---------------------------------------------------------------------------
echo ""
echo "==========================================="
echo " Setup Complete"
echo "==========================================="
echo ""
echo "Next steps:"
echo "  1. pnpm install          (install docs dependencies)"
echo "  2. cd apps/docs && pnpm start   (test locally)"
echo "  3. git add -A && git commit     (commit changes)"
echo "  4. git push origin main         (triggers deployment)"
echo ""
echo "Site will be live at: $SITE_URL"
echo ""
echo "Monitor deployment:"
echo "  gh run list --workflow=deploy-docs.yml"
echo "  gh run watch"

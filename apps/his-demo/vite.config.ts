import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Set DEMO_STATIC=1 to build a static SPA (no server routes) for hosting on
// GitHub Pages at https://awbx.github.io/fhir-dsl/demo. The chatbot drawer is
// disabled in this mode because /api/chat + /api/mcp need a server runtime.
const STATIC_BUILD = process.env.DEMO_STATIC === '1'
const BASE_PATH = process.env.DEMO_BASE_PATH ?? '/'

const config = defineConfig({
  base: BASE_PATH,
  resolve: { tsconfigPaths: true },
  plugins: STATIC_BUILD
    ? [
        tailwindcss(),
        tanstackStart({
          spa: {
            enabled: true,
            // crawlLinks follows <a> tags from the SPA shell so the navbar's
            // /patients and /playground get prerendered as physical
            // dist/client/<route>/index.html files. Required because GitHub
            // Pages's 404 fallback is site-level (/fhir-dsl/404.html =
            // Docusaurus's 404), not per-subdir, so deep links need real
            // files instead of a SPA-shell fallback. Parameterized routes
            // (/patients/$id) still only resolve via in-app navigation.
            prerender: { enabled: true, crawlLinks: true },
          },
        }),
        viteReact(),
      ]
    : [
        devtools(),
        nitro({ rollupConfig: { external: [/^@sentry\//] } }),
        tailwindcss(),
        tanstackStart(),
        viteReact(),
      ],
})

export default config

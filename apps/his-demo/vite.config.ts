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
            prerender: { enabled: true },
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

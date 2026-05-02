import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './integrations/tanstack-query/root-provider'

export function getRouter() {
  const context = getContext()

  // Strip trailing slash so basepath '/fhir-dsl/demo/' becomes '/fhir-dsl/demo'.
  // TanStack Router expects no trailing slash; '/' stays as '/' for normal builds.
  const rawBase = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')
  const basepath = rawBase === '' ? '/' : rawBase

  const router = createTanStackRouter({
    routeTree,
    context,
    basepath,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

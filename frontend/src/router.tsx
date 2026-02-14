import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export interface RouterContext {
  auth: {
    isAuthenticated: boolean
    isAdmin: boolean
    isPending: boolean
    user: {
      id: string
      name: string
      email: string
      role?: string | null | undefined
    } | null
  }
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {
      auth: {
        isAuthenticated: false,
        isAdmin: false,
        isPending: true,
        user: null,
      },
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}

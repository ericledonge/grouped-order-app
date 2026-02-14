import { useEffect } from 'react'
import { createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import { useAuthSession } from '@/features/auth/domain/auth.repository'
import { AppLayout } from '@/components/layout/app-layout'
import type { RouterContext } from '@/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const auth = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    router.update({
      context: {
        ...router.options.context,
        auth: {
          isAuthenticated: auth.isAuthenticated,
          isAdmin: auth.isAdmin,
          isPending: auth.isPending,
          user: auth.user,
        },
      },
    })
  }, [auth.isAuthenticated, auth.isAdmin, auth.isPending, auth.user, router])

  return <AppLayout />
}

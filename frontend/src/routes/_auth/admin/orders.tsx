import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/admin/orders')({
  beforeLoad: () => {
    throw redirect({ to: '/orders' })
  },
})

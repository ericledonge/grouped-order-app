import { createFileRoute, redirect } from '@tanstack/react-router'
import { ListOrdersPage } from '@/features/orders/use-cases/list-orders/list-orders-page'

export const Route = createFileRoute('/_auth/admin/orders')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: ListOrdersPage,
})

import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateOrderPage } from '@/features/orders/use-cases/create-order/create-order-page'

export const Route = createFileRoute('/_auth/admin/orders_/new')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: CreateOrderPage,
})

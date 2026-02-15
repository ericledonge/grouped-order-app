import { createFileRoute } from '@tanstack/react-router'
import { ListOrdersPage } from '@/features/orders/use-cases/list-orders/list-orders-page'

export const Route = createFileRoute('/_auth/orders')({
  component: ListOrdersPage,
})

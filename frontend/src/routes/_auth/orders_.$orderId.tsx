import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/features/orders/use-cases/order-detail/order-detail-page'

export const Route = createFileRoute('/_auth/orders_/$orderId')({
  component: OrderDetailRouteComponent,
})

function OrderDetailRouteComponent() {
  const { orderId } = Route.useParams()
  return <OrderDetailPage orderId={orderId} />
}

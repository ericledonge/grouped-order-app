import { LoaderCircle } from 'lucide-react'
import type { Order } from '@/features/orders/domain/order.types'
import { OrderCardList } from './order-card-list'
import { OrderTable } from './order-table'

export function OrderListContent({
  orders,
  isPending,
  error,
}: {
  orders: Order[]
  isPending: boolean
  error: string | null
}) {
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
        {error}
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-12">
        <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return <p className="text-muted-foreground">Aucune commande pour le moment.</p>
  }

  return (
    <>
      <OrderCardList orders={orders} />
      <OrderTable orders={orders} />
    </>
  )
}

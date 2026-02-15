import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/features/auth/domain/auth.repository'
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@/features/orders/domain/order.types'
import { useListOrders } from './use-list-orders.use-case'
import { OrderListContent } from './order-list-content'

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'open', label: ORDER_STATUS_LABELS.open },
  { value: 'in_progress', label: ORDER_STATUS_LABELS.in_progress },
  { value: 'completed', label: ORDER_STATUS_LABELS.completed },
]

export function ListOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('open')
  const { isAdmin } = useAuthSession()
  const status = filter === 'all' ? undefined : filter
  const { orders, isPending, error } = useListOrders(status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commandes</h1>
        {isAdmin && (
          <Button asChild>
            <Link to="/admin/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle commande
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <OrderListContent orders={orders} isPending={isPending} error={error} />
    </div>
  )
}

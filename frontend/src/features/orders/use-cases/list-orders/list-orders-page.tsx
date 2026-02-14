import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useListOrders } from './use-list-orders.use-case'
import { OrderListContent } from './order-list-content'

export function ListOrdersPage() {
  const { orders, isPending, error } = useListOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <Button asChild>
          <Link to="/admin/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle commande
          </Link>
        </Button>
      </div>

      <OrderListContent orders={orders} isPending={isPending} error={error} />
    </div>
  )
}

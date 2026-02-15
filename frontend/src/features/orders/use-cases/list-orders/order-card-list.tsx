import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ORDER_TYPE_LABELS,
  ORDER_STATUS_LABELS,
} from '@/features/orders/domain/order.types'
import type { Order } from '@/features/orders/domain/order.types'
import { formatDate } from '@/lib/date.utils'
import { STATUS_VARIANT } from './list-orders.helpers'

export function OrderCardList({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-3 md:hidden">
      {orders.map((order) => (
        <Link key={order.id} to="/orders/$orderId" params={{ orderId: order.id }}>
          <Card className="hover:border-primary transition-colors cursor-pointer py-4 gap-3">
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">
                {ORDER_TYPE_LABELS[order.type]}
              </CardTitle>
              <Badge variant={STATUS_VARIANT[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{formatDate(order.targetDate)}</p>
              {order.description && (
                <p className="text-muted-foreground">{order.description}</p>
              )}
              <p className="text-muted-foreground text-xs">
                Créé le {formatDate(order.createdAt)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

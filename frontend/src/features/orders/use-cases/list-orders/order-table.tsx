import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ORDER_TYPE_LABELS,
  ORDER_STATUS_LABELS,
} from '@/features/orders/domain/order.types'
import type { Order } from '@/features/orders/domain/order.types'
import { formatDate } from '@/lib/date.utils'
import { STATUS_VARIANT } from './list-orders.helpers'

export function OrderTable({ orders }: { orders: Order[] }) {
  const navigate = useNavigate()

  return (
    <Table className="hidden md:table">
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Date cible</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Créé le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="cursor-pointer"
            onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order.id } })}
          >
            <TableCell>{ORDER_TYPE_LABELS[order.type]}</TableCell>
            <TableCell>{formatDate(order.targetDate)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {order.description || '—'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(order.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

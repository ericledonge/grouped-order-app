import { Link } from '@tanstack/react-router'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ORDER_TYPE_LABELS, ORDER_STATUS_LABELS } from '@/features/orders/domain/order.types'
import { WISH_STATUS_LABELS } from '@/features/wishes/domain/wish.types'
import { formatDate } from '@/lib/date.utils'
import { CreateWishForm } from '@/features/wishes/use-cases/create-wish/create-wish-form'
import { useOrderDetail } from './use-order-detail.use-case'

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { order, wishes, isPending, error } = useOrderDetail(orderId)

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
    )
  }

  if (isPending || !order) {
    return (
      <div className="flex justify-center py-12">
        <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux commandes
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{ORDER_TYPE_LABELS[order.type]}</span>
            <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Date cible : {formatDate(order.targetDate)}</p>
          {order.description && <p className="text-muted-foreground">{order.description}</p>}
        </CardContent>
      </Card>

      {wishes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Souhaits ({wishes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {wishes.map((w) => (
                <li key={w.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{w.gameName}</p>
                    <p className="text-sm text-muted-foreground">{w.philibertReference}</p>
                  </div>
                  <Badge variant="secondary">{WISH_STATUS_LABELS[w.status]}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {order.status === 'open' && <CreateWishForm orderId={orderId} />}
    </div>
  )
}

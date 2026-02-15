import { Link } from '@tanstack/react-router'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ORDER_TYPE_LABELS, ORDER_STATUS_LABELS } from '@/features/orders/domain/order.types'
import { WishCardList } from '@/features/wishes/use-cases/list-my-wishes/wish-card-list'
import { WishTable } from '@/features/wishes/use-cases/list-my-wishes/wish-table'
import { CreateWishFormContent } from '@/features/wishes/use-cases/create-wish/create-wish-form-content'
import { formatDate } from '@/lib/date.utils'
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

  const isOpen = order.status === 'open'

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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Souhaits{wishes.length > 0 && ` (${wishes.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wishes.length > 0 && (
            <>
              <WishCardList wishes={wishes} />
              <WishTable wishes={wishes} />
            </>
          )}
          {wishes.length === 0 && !isOpen && (
            <p className="text-muted-foreground">Aucun souhait pour le moment.</p>
          )}
          {isOpen && (
            <>
              {wishes.length > 0 && <Separator className="my-6" />}
              <h3 className="text-base font-semibold mb-4">Ajouter un souhait</h3>
              <CreateWishFormContent orderId={orderId} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WISH_STATUS_LABELS } from '@/features/wishes/domain/wish.types'
import type { Wish } from '@/features/wishes/domain/wish.types'
import { formatDate } from '@/lib/date.utils'
import { WISH_STATUS_VARIANT } from './list-my-wishes.helpers'

export function WishCardList({ wishes }: { wishes: Wish[] }) {
  return (
    <div className="space-y-3 md:hidden">
      {wishes.map((wish) => (
        <Card key={wish.id} className="py-4 gap-3">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">{wish.gameName}</CardTitle>
            <Badge variant={WISH_STATUS_VARIANT[wish.status]}>
              {WISH_STATUS_LABELS[wish.status]}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{wish.philibertReference}</p>
            <p className="text-muted-foreground text-xs">
              Ajouté le {formatDate(wish.createdAt)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

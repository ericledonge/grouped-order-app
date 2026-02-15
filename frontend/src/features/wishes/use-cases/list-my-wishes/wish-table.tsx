import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WISH_STATUS_LABELS } from '@/features/wishes/domain/wish.types'
import type { Wish } from '@/features/wishes/domain/wish.types'
import { formatDate } from '@/lib/date.utils'
import { WISH_STATUS_VARIANT } from './list-my-wishes.helpers'

export function WishTable({ wishes }: { wishes: Wish[] }) {
  return (
    <Table className="hidden md:table">
      <TableHeader>
        <TableRow>
          <TableHead>Jeu</TableHead>
          <TableHead>Référence</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Ajouté le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wishes.map((wish) => (
          <TableRow key={wish.id}>
            <TableCell className="font-medium">{wish.gameName}</TableCell>
            <TableCell>{wish.philibertReference}</TableCell>
            <TableCell>
              <Badge variant={WISH_STATUS_VARIANT[wish.status]}>
                {WISH_STATUS_LABELS[wish.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(wish.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

import { LoaderCircle } from 'lucide-react'
import type { Wish } from '@/features/wishes/domain/wish.types'
import { WishCardList } from './wish-card-list'
import { WishTable } from './wish-table'

export function WishListContent({
  wishes,
  isPending,
  error,
}: {
  wishes: Wish[]
  isPending: boolean
  error: string | null
}) {
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
    )
  }
  if (isPending) {
    return (
      <div className="flex justify-center py-12">
        <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }
  if (wishes.length === 0) {
    return <p className="text-muted-foreground">Aucun souhait pour le moment.</p>
  }
  return (
    <>
      <WishCardList wishes={wishes} />
      <WishTable wishes={wishes} />
    </>
  )
}

import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useListMyWishes } from './use-list-my-wishes.use-case'
import { WishListContent } from './wish-list-content'

export function ListMyWishesPage() {
  const { wishes, isPending, error } = useListMyWishes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes souhaits</h1>
        <Button asChild>
          <Link to="/orders">Voir les commandes ouvertes</Link>
        </Button>
      </div>
      <WishListContent wishes={wishes} isPending={isPending} error={error} />
    </div>
  )
}

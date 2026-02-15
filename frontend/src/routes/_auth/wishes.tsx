import { createFileRoute } from '@tanstack/react-router'
import { ListMyWishesPage } from '@/features/wishes/use-cases/list-my-wishes/list-my-wishes-page'

export const Route = createFileRoute('/_auth/wishes')({
  component: ListMyWishesPage,
})

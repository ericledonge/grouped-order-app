import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/wishes')({
  component: WishesPage,
})

function WishesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Mes souhaits</h1>
      <p className="text-muted-foreground mt-2">
        Bientôt disponible.
      </p>
    </div>
  )
}

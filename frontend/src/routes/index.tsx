import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Grouped Order</h1>
        <p className="text-muted-foreground">
          Plateforme d'achats groupés de jeux de société
        </p>
        <Button>Commencer</Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateOrder } from './use-create-order.use-case'
import { ORDER_TYPE_LABELS } from '@/features/orders/domain/order.types'

export function CreateOrderPage() {
  const { handleCreateOrder, error, isPending } = useCreateOrder()
  const [type, setType] = useState('')

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    handleCreateOrder(
      type,
      formData.get('targetDate') as string,
      (formData.get('description') as string) || undefined,
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle commande</CardTitle>
          <CardDescription>Créer une nouvelle commande groupée</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="type">Type de commande</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDate">Date cible</Label>
              <Input id="targetDate" name="targetDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input id="description" name="description" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Création...' : 'Créer la commande'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/orders">Annuler</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

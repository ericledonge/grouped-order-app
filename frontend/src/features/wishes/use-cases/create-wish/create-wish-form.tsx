import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthSession } from '@/features/auth/domain/auth.repository'
import { useUsers } from '@/features/users/domain/user.repository'
import { useCreateWish } from './use-create-wish.use-case'

export function CreateWishForm({ orderId }: { orderId: string }) {
  const { isAdmin } = useAuthSession()
  const { handleCreateWish, error, isPending } = useCreateWish(orderId)
  const { data: users } = useUsers()
  const [selectedUserId, setSelectedUserId] = useState('')

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    handleCreateWish(
      formData.get('gameName') as string,
      formData.get('philibertReference') as string,
      (formData.get('philibertUrl') as string) || undefined,
      isAdmin && selectedUserId ? selectedUserId : undefined,
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un souhait</CardTitle>
        <CardDescription>Ajoutez un jeu à cette commande</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {isAdmin && users && (
            <div className="space-y-2">
              <Label htmlFor="userId">Membre (admin : créer pour un autre membre)</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Moi-même (par défaut)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gameName">Nom du jeu</Label>
            <Input id="gameName" name="gameName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="philibertReference">Référence Philibert</Label>
            <Input id="philibertReference" name="philibertReference" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="philibertUrl">URL Philibert (optionnel)</Label>
            <Input
              id="philibertUrl"
              name="philibertUrl"
              type="url"
              placeholder="https://www.philibert.com/..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Ajout en cours...' : 'Ajouter le souhait'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

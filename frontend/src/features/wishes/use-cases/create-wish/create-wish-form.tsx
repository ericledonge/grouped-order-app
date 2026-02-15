import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateWishFormContent } from './create-wish-form-content'

export function CreateWishForm({ orderId }: { orderId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un souhait</CardTitle>
        <CardDescription>Ajoutez un jeu à cette commande</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateWishFormContent orderId={orderId} />
      </CardContent>
    </Card>
  )
}

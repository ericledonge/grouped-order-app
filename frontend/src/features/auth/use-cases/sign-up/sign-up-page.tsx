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
import { useSignUp } from './use-sign-up.use-case'

export function SignUpPage() {
  const { handleSignUp, error, isPending } = useSignUp()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    handleSignUp(
      formData.get('name') as string,
      formData.get('email') as string,
      formData.get('password') as string,
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Créez votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Courriel</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required />
              <p className="text-xs text-muted-foreground">
                Minimum 8 caractères
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Inscription...' : "S'inscrire"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte?{' '}
              <Link to="/login" className="underline hover:text-primary">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

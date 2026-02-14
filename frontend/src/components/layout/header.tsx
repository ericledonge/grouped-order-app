import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useAuthSession } from '@/features/auth/domain/auth.repository'
import { authAdapter } from '@/features/auth/domain/auth.adapter'
import { Nav } from './nav'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Header() {
  const { user, isAuthenticated } = useAuthSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-xl">
            Grouped Order
          </Link>

          <div className="hidden md:flex">
            <Nav />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => authAdapter.signOut()}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Connexion</Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <Nav onLinkClick={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

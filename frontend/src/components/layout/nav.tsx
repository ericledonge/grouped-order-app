import { Link } from '@tanstack/react-router'
import { useAuthSession } from '@/features/auth/domain/auth.repository'

interface NavProps {
  onLinkClick?: () => void
}

export function Nav({ onLinkClick }: NavProps) {
  const { isAuthenticated, isAdmin } = useAuthSession()

  const linkClass =
    'text-sm font-medium transition-colors hover:text-primary text-muted-foreground'
  const activeLinkClass = 'text-sm font-medium text-primary'

  return (
    <nav className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <Link
        to="/"
        onClick={onLinkClick}
        className={linkClass}
        activeProps={{ className: activeLinkClass }}
        activeOptions={{ exact: true }}
      >
        Accueil
      </Link>

      {isAuthenticated && (
        <Link
          to="/wishes"
          onClick={onLinkClick}
          className={linkClass}
          activeProps={{ className: activeLinkClass }}
        >
          Mes souhaits
        </Link>
      )}

      {isAdmin && (
        <Link
          to="/admin/orders"
          onClick={onLinkClick}
          className={linkClass}
          activeProps={{ className: activeLinkClass }}
        >
          Commandes
        </Link>
      )}
    </nav>
  )
}

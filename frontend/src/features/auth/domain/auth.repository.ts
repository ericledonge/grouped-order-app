import { useSession } from '@/lib/auth-client'

export function useAuthSession() {
  const session = useSession()

  return {
    user: session.data?.user ?? null,
    session: session.data?.session ?? null,
    isPending: session.isPending,
    isAuthenticated: !!session.data?.user,
    isAdmin: session.data?.user?.role === 'admin',
  }
}

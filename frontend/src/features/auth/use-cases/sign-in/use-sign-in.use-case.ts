import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearch } from '@tanstack/react-router'
import { authAdapter } from '@/features/auth/domain/auth.adapter'

export function useSignIn() {
  const router = useRouter()
  const { redirect: redirectTo } = useSearch({ from: '/login' })

  const mutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await authAdapter.signIn(email, password)
    },
    onSuccess: async () => {
      await router.invalidate()
      await router.navigate({ to: redirectTo || '/' })
    },
  })

  const handleSignIn = (email: string, password: string) => {
    mutation.mutate({ email, password })
  }

  return {
    handleSignIn,
    error: mutation.error?.message ?? null,
    isPending: mutation.isPending,
  }
}

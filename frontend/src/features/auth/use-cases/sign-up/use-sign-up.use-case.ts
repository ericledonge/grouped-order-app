import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { authAdapter } from '@/features/auth/domain/auth.adapter'

export function useSignUp() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      await authAdapter.signUp(name, email, password)
    },
    onSuccess: async () => {
      await router.invalidate()
      await router.navigate({ to: '/' })
    },
  })

  const handleSignUp = (name: string, email: string, password: string) => {
    mutation.mutate({ name, email, password })
  }

  return {
    handleSignUp,
    error: mutation.error?.message ?? null,
    isPending: mutation.isPending,
  }
}

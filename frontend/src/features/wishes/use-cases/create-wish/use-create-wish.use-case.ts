import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useCreateWishMutation } from '@/features/wishes/domain/wish.repository'
import { validateCreateWishInput } from './create-wish.service'

export function useCreateWish(orderId: string) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [validationError, setValidationError] = useState<string | null>(null)

  const mutation = useCreateWishMutation()

  const handleCreateWish = (
    gameName: string,
    philibertReference: string,
    philibertUrl?: string,
    userId?: string,
    onSuccess?: () => void,
  ) => {
    setValidationError(null)

    const validation = validateCreateWishInput({ gameName, philibertReference, philibertUrl })
    if (!validation.success) {
      setValidationError(validation.error.issues[0].message)
      return
    }

    mutation.mutate(
      { orderId, ...validation.data, userId },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['wishes'] })
          onSuccess?.()
          await router.navigate({ to: '/orders/$orderId', params: { orderId } })
        },
      },
    )
  }

  return {
    handleCreateWish,
    error: validationError ?? mutation.error?.message ?? null,
    isPending: mutation.isPending,
  }
}

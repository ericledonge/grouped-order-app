import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useCreateOrderMutation } from '@/features/orders/domain/order.repository'
import { validateCreateOrderInput } from './create-order.service'

export function useCreateOrder() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [validationError, setValidationError] = useState<string | null>(null)

  const mutation = useCreateOrderMutation()

  const handleCreateOrder = (type: string, targetDate: string, description?: string) => {
    setValidationError(null)

    const validation = validateCreateOrderInput({ type, targetDate, description })
    if (!validation.success) {
      setValidationError(validation.error.issues[0].message)
      return
    }

    mutation.mutate(validation.data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['orders'] })
        await router.navigate({ to: '/admin/orders' })
      },
    })
  }

  return {
    handleCreateOrder,
    error: validationError ?? mutation.error?.message ?? null,
    isPending: mutation.isPending,
  }
}

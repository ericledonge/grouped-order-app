import { useMyWishes } from '@/features/wishes/domain/wish.repository'

export function useListMyWishes() {
  const { data: wishes, isPending, error } = useMyWishes()

  return {
    wishes: wishes ?? [],
    isPending,
    error: error?.message ?? null,
  }
}

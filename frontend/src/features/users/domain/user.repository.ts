import { useQuery } from '@tanstack/react-query'
import { userAdapter } from './user.adapter'

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userAdapter.fetchUsers(),
    enabled,
  })
}

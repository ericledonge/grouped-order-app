import { useQuery } from '@tanstack/react-query'
import { userAdapter } from './user.adapter'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userAdapter.fetchUsers(),
  })
}

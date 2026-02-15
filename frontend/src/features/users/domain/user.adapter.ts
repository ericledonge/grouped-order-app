import { z } from 'zod'
import { apiFetch } from '@/lib/api-client'
import { userSchema } from './user.types'
import type { User } from './user.types'

export const userAdapter = {
  fetchUsers: async (): Promise<User[]> => {
    const data = await apiFetch<unknown>('/api/users')
    return z.array(userSchema).parse(data)
  },
}

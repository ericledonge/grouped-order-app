import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [adminClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient

export type Session = typeof authClient.$Infer.Session

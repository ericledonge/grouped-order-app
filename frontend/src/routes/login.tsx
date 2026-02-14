import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { SignInPage } from '@/features/auth/use-cases/sign-in/sign-in-page'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: SignInPage,
})

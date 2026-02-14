import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignUpPage } from '@/features/auth/use-cases/sign-up/sign-up-page'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: SignUpPage,
})

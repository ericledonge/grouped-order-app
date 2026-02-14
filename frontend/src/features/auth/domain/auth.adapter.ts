import { signIn, signUp, signOut } from '@/lib/auth-client'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'Courriel ou mot de passe invalide',
  INVALID_PASSWORD: 'Courriel ou mot de passe invalide',
  INVALID_EMAIL: 'Adresse courriel invalide',
  INVALID_EMAIL_OR_PASSWORD: 'Courriel ou mot de passe invalide',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec ce courriel',
  EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre courriel avant de vous connecter',
}

function getAuthErrorMessage(error: { code?: string }, fallback: string): string {
  if (error.code && error.code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[error.code]
  }
  return fallback
}

export const authAdapter = {
  signIn: async (email: string, password: string) => {
    const result = await signIn.email({ email, password })
    if (result.error) {
      throw new Error(getAuthErrorMessage(result.error, 'Courriel ou mot de passe invalide'))
    }
    return result.data
  },

  signUp: async (name: string, email: string, password: string) => {
    const result = await signUp.email({ name, email, password })
    if (result.error) {
      throw new Error(getAuthErrorMessage(result.error, "Erreur lors de l'inscription"))
    }
    return result.data
  },

  signOut: async () => {
    await signOut()
  },
}

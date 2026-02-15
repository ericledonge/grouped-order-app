import type { Page } from '@playwright/test'

const API_URL = 'http://localhost:3000'

export async function resetDatabase() {
  const res = await fetch(`${API_URL}/api/e2e/reset`, { method: 'POST' })
  if (!res.ok) throw new Error(`E2E reset failed: ${res.status}`)
}

export const ADMIN_USER = {
  email: 'admin@e2e.test',
  password: 'password123',
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Courriel').fill(ADMIN_USER.email)
  await page.getByLabel('Mot de passe').fill(ADMIN_USER.password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL('/')
}

export async function signUpUser(
  page: Page,
  user: { name: string; email: string; password: string },
) {
  await page.goto('/signup')
  await page.getByLabel('Nom').fill(user.name)
  await page.getByLabel('Courriel').fill(user.email)
  await page.getByLabel('Mot de passe').fill(user.password)
  await page.getByRole('button', { name: "S'inscrire" }).click()
  await page.waitForURL('/')
}

/** Sign up a user via API (no browser needed). */
export async function apiSignUp(user: { name: string; email: string; password: string }) {
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify(user),
    redirect: 'manual',
  })
  if (!res.ok) throw new Error(`API sign-up failed: ${res.status}`)
}

/** Login via API and return session cookie. */
export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ email, password }),
    redirect: 'manual',
  })
  if (!res.ok) throw new Error(`API login failed: ${res.status}`)
  return res.headers.getSetCookie().join('; ')
}

/** Create an order via API. Requires an admin session cookie. */
export async function apiCreateOrder(
  cookie: string,
  order: { type: string; targetDate: string; description?: string },
) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', Cookie: cookie },
    body: JSON.stringify(order),
  })
  if (!res.ok) throw new Error(`API create order failed: ${res.status}`)
  return res.json()
}

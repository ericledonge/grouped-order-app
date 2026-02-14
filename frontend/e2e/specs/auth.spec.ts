import { test, expect } from '@playwright/test'
import { signUpUser, loginAsAdmin, resetDatabase } from '../fixtures/auth.fixture'

test.describe('Authentication', () => {
  test.beforeAll(async () => {
    await resetDatabase()
  })

  test('a new user can sign up', async ({ page }) => {
    await signUpUser(page, {
      name: 'Jean Tremblay',
      email: 'jean@test.com',
      password: 'motdepasse123',
    })

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Jean Tremblay')).toBeVisible()
  })

  test('a user can log in with existing credentials', async ({ page }) => {
    await loginAsAdmin(page)

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Admin E2E')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Courriel').fill('admin@e2e.test')
    await page.getByLabel('Mot de passe').fill('wrongpassword')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(
      page.getByText('Courriel ou mot de passe invalide'),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })
})

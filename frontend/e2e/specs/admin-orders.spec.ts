import { test, expect } from '@playwright/test'
import { loginAsAdmin, resetDatabase } from '../fixtures/auth.fixture'

test.describe('Admin - Orders', () => {
  test.beforeAll(async () => {
    await resetDatabase()
  })

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('admin can create a new order and see it in the list', async ({
    page,
  }) => {
    // Navigate via nav link (direct goto may race with auth context loading)
    await page.getByRole('link', { name: 'Commandes' }).click()
    await expect(page.getByRole('heading', { name: 'Commandes' })).toBeVisible()

    await page.getByRole('link', { name: 'Nouvelle commande' }).click()
    await expect(page).toHaveURL('/admin/orders/new')

    // Select order type (Radix Select)
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Mensuelle' }).click()

    // Fill target date (tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.getByLabel('Date cible').fill(dateString)

    // Fill description
    await page.getByLabel('Description (optionnel)').fill('Commande E2E test')

    // Submit
    await page.getByRole('button', { name: 'Créer la commande' }).click()

    // Should redirect to orders list
    await expect(page).toHaveURL('/admin/orders')

    // Verify the order appears (use table cell to avoid card+table duplicate matches)
    await expect(page.getByRole('cell', { name: 'Mensuelle' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Commande E2E test' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Ouverte' })).toBeVisible()
  })
})

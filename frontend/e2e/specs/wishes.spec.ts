import { test, expect } from '@playwright/test'
import {
  loginAsAdmin,
  resetDatabase,
  apiLogin,
  apiCreateOrder,
  apiSignUp,
  ADMIN_USER,
} from '../fixtures/auth.fixture'

const MEMBER = {
  name: 'Marie Dubois',
  email: 'marie@test.com',
  password: 'motdepasse123',
}

function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

async function loginAsMember(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Courriel').fill(MEMBER.email)
  await page.getByLabel('Mot de passe').fill(MEMBER.password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL('/')
}

/** Seed: reset DB, create an open order, register the member */
async function seedOrderAndMember() {
  await resetDatabase()
  const adminCookie = await apiLogin(ADMIN_USER.email, ADMIN_USER.password)
  await apiCreateOrder(adminCookie, {
    type: 'monthly',
    targetDate: tomorrowISO(),
    description: 'Commande pour test wishes',
  })
  await apiSignUp(MEMBER)
}

test.describe('Wishes - member adds a wish', () => {
  test.beforeAll(async () => {
    await seedOrderAndMember()
  })

  test('member can add a wish to an open order and see it in my wishes', async ({
    page,
  }) => {
    await loginAsMember(page)

    // Navigate to orders and click the order
    await page.getByRole('link', { name: 'Commandes' }).click()
    await expect(page.getByRole('heading', { name: 'Commandes' })).toBeVisible()
    await page.getByRole('cell', { name: 'Mensuelle' }).click()

    // Fill the wish form
    await expect(page.getByText('Ajouter un souhait')).toBeVisible()
    await page.getByLabel('Nom du jeu').fill('Terraforming Mars')
    await page.getByLabel('Référence Philibert').fill('PHI-12345')
    await page
      .getByLabel('URL Philibert (optionnel)')
      .fill('https://www.philibert.com/terraforming-mars')
    await page.getByRole('button', { name: 'Ajouter le souhait' }).click()

    // Verify the wish appears on the order detail page
    await expect(page.getByRole('cell', { name: 'Terraforming Mars' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'PHI-12345' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Soumis' })).toBeVisible()

    // Check it also appears in "Mes souhaits"
    await page.getByRole('link', { name: 'Mes souhaits' }).click()
    await expect(page.getByRole('heading', { name: 'Mes souhaits' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Terraforming Mars' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'PHI-12345' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Soumis' })).toBeVisible()
  })
})

test.describe('Wishes - admin creates for another member', () => {
  test.beforeAll(async () => {
    await seedOrderAndMember()
  })

  test('admin can create a wish for another member', async ({ page }) => {
    await loginAsAdmin(page)

    // Navigate to orders and click the order
    await page.getByRole('link', { name: 'Commandes' }).click()
    await page.getByRole('cell', { name: 'Mensuelle' }).click()

    // The admin should see the member dropdown
    await expect(
      page.getByText('Membre (admin : créer pour un autre membre)'),
    ).toBeVisible()

    // Select the member in the dropdown
    await page.getByRole('combobox').last().click()
    await page
      .getByRole('option', { name: `${MEMBER.name} (${MEMBER.email})` })
      .click()

    // Fill the wish form
    await page.getByLabel('Nom du jeu').fill('Everdell')
    await page.getByLabel('Référence Philibert').fill('PHI-77777')
    await page.getByRole('button', { name: 'Ajouter le souhait' }).click()

    // Verify the wish appears on the order detail
    await expect(page.getByRole('cell', { name: 'Everdell' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'PHI-77777' })).toBeVisible()
  })
})

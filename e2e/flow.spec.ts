import { expect, test } from '@playwright/test'

test('fluxo principal em layout mobile', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Sua melhor versão começa hoje.' })).toBeVisible()
  await page.getByLabel('Como podemos te chamar?').fill('Pedro')
  await page.getByRole('button', { name: 'Começar minha jornada' }).click()
  await expect(page.getByRole('heading', { name: /Pedro/ })).toBeVisible()

  await page.getByRole('link', { name: 'Metas' }).click()
  await page.getByRole('button', { name: 'Nova' }).click()
  await page.getByLabel('Nome da meta').fill('Estudar 5 horas')
  await page.getByLabel('Valor-alvo').fill('5')
  await page.getByRole('button', { name: 'Criar meta' }).click()
  await expect(page.getByRole('heading', { name: 'Estudar 5 horas' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Estudar 5 horas' })).toBeVisible()
})

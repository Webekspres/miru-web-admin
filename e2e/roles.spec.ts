import { expect, test } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('login per role', () => {
  test.describe.configure({ timeout: 60_000 })
  test('admin lands on dashboard', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('link', { name: 'Nasabah' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pengaturan' })).toBeVisible()
  })

  test('petugas sees setoran menu and not penarikan', async ({ page }) => {
    await loginAs(page, 'petugas')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('link', { name: 'Input Setoran' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Penarikan Saldo' })).toHaveCount(0)
  })

  test('koordinator is read-only on nasabah', async ({ page }) => {
    await loginAs(page, 'koordinator')
    await expect(page).toHaveURL(/\/dashboard/)
    await page.goto('/customers')
    await expect(page.getByRole('heading', { name: /Nasabah/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Tambah/i })).toHaveCount(0)
  })

  test('pemerintah lands on reports with limited menu', async ({ page }) => {
    await loginAs(page, 'pemerintah')
    await expect(page).toHaveURL(/\/reports/)
    await expect(page.getByRole('link', { name: 'Laporan' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nasabah' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Pengaturan' })).toHaveCount(0)
  })
})

import { expect, test } from '@playwright/test'
import { loginAs, mockApi } from './helpers'

test.describe('keamanan role', () => {
  test.describe.configure({ timeout: 60_000 })
  test('nasabah ditolak di login web admin', async ({ page }) => {
    await mockApi(page, 'nasabah')
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { name: 'Masuk Panel' }).waitFor()
    await page.getByLabel('Nama pengguna').fill('nasabah')
    await page.getByLabel('Kata sandi').fill('password-aman')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page.getByText(/aplikasi mobile MIRU/)).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('pemerintah tidak mengirim mutasi dari UI', async ({ page }) => {
    const mutations: string[] = []
    await loginAs(page, 'pemerintah')

    page.on('request', (request) => {
      if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method()) && request.url().includes('/api/')) {
        mutations.push(`${request.method()} ${request.url()}`)
      }
    })

    await page.goto('/warehouse')
    await expect(page.getByRole('heading', { name: /Gudang/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /tambah|simpan|hapus|ubah/i })).toHaveCount(0)
    expect(mutations.filter((item) => !item.includes('/auth/'))).toEqual([])
  })

  test('petugas tidak dapat membuka approve penarikan', async ({ page }) => {
    await loginAs(page, 'petugas')
    await page.goto('/balance')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('button', { name: 'Setujui' })).toHaveCount(0)
  })
})

import type { Page } from '@playwright/test'

export function envelope<T>(data: T, statusCode = 200) {
  return {
    success: true,
    status_code: statusCode,
    message: 'OK',
    data,
    meta: {
      timestamp: '2026-09-02T00:00:00+09:00',
      request_id: 'e2e',
    },
  }
}

export function errorEnvelope(message: string, statusCode = 401, code = 'AUTHENTICATION_FAILED') {
  return {
    success: false,
    status_code: statusCode,
    message,
    code,
    data: null,
    errors: null,
    meta: {
      timestamp: '2026-09-02T00:00:00+09:00',
      request_id: 'e2e-err',
    },
  }
}

export type E2ERole = 'admin' | 'petugas' | 'koordinator' | 'pemerintah' | 'nasabah'

export function mockUser(role: E2ERole) {
  return {
    id: 10,
    username: role,
    role,
    nama_lengkap: `Pengguna ${role}`,
    no_hp: '081234567890',
    saldo: '0',
    poin: 0,
    is_active: true,
    avatar_url: null,
  }
}

export async function mockApi(page: Page, role: E2ERole) {
  await page.route(/\/api\//, async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/api/auth/login/') && method === 'POST') {
      if (role === 'nasabah') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            envelope({
              access: 'e2e.access.token',
              refresh: 'e2e.refresh.token',
              user: mockUser('nasabah'),
            }),
          ),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          envelope({
            access: 'e2e.access.token',
            refresh: 'e2e.refresh.token',
            user: mockUser(role),
          }),
        ),
      })
      return
    }

    if (url.includes('/api/auth/me/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope(mockUser(role === 'nasabah' ? 'admin' : role))),
      })
      return
    }

    if (url.includes('/api/auth/refresh/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope({ access: 'e2e.access.token' })),
      })
      return
    }

    if (method === 'POST' || method === 'PATCH' || method === 'DELETE' || method === 'PUT') {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Anda tidak memiliki akses', 403, 'PERMISSION_DENIED')),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope([])),
    })
  })
}

export async function loginAs(page: Page, role: Exclude<E2ERole, 'nasabah'>) {
  await mockApi(page, role)
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Masuk Panel' }).waitFor()
  await page.getByLabel('Nama pengguna').fill(role)
  await page.getByLabel('Kata sandi').fill('password-aman')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 })
}

import { API_BASE_URL, API_DEBUG, API_PREFIX, AUTH } from './config'
import { TOKEN_KEYS } from './auth-constants'
import {
  clearCsrfToken,
  clearRoleCookie,
  getCsrfToken,
} from './auth-cookies'
import { notifyForbidden, notifyUnauthorized } from './api-handlers'
import { redactLogValue, redactSecrets } from './redact'
import {
  ApiError,
  type ApiEnvelope,
  type RefreshResponse,
} from '@/types/api'

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * Session web admin hidup di cookie HttpOnly yang di-set backend
 * (access_token/refresh_token) — token TIDAK pernah disimpan di localStorage
 * atau cookie yang bisa dibaca JS. Fungsi di bawah hanya membersihkan
 * marker lokal (role + csrf); cookie HttpOnly dihapus lewat /auth/logout/.
 */
export function clearTokens(): void {
  clearRoleCookie()
  clearCsrfToken()
  if (typeof window === 'undefined') return
  // Bersihkan token lama dari versi sebelum migrasi ke cookie HttpOnly —
  // tidak dipakai lagi, tapi tidak boleh dibiarkan mengendap di localStorage.
  localStorage.removeItem(TOKEN_KEYS.access)
  localStorage.removeItem(TOKEN_KEYS.refresh)
}

/** Logout server-side: blacklist refresh token & hapus cookie HttpOnly.
 * Dipanggil saat logout eksplisit ATAU sesi terbukti tidak valid lagi. */
export async function revokeSession(): Promise<void> {
  if (typeof window === 'undefined') return

  const csrf = getCsrfToken()
  try {
    await fetchWithTimeout(AUTH.logout, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'id',
        ...(csrf ? { 'X-CSRFToken': csrf } : {}),
      },
      body: JSON.stringify({}),
    })
  } catch {
    // Cookie basi/expired akan kedaluwarsa sendiri; pembersihan lokal tetap jalan.
  }
}

export async function parseEnvelope<T>(response: Response): Promise<T> {
  let envelope: ApiEnvelope<T>

  try {
    envelope = await response.json()
  } catch {
    throw new ApiError(invalidResponseMessage(response), response.status, 'INVALID_RESPONSE')
  }

  if (typeof envelope?.success !== 'boolean') {
    throw new ApiError(invalidResponseMessage(response), response.status, 'INVALID_RESPONSE')
  }

  if (!envelope.success) {
    throw new ApiError(
      envelope.message || defaultErrorMessage(envelope.code),
      envelope.status_code ?? response.status,
      envelope.code,
      envelope.errors ?? undefined,
    )
  }

  return envelope.data as T
}

/** Pesan ramah saat body bukan JSON envelope MIRU (HTML 404 nginx, proxy error, dll). */
function invalidResponseMessage(response: Response): string {
  const status = response.status

  if (status === 404) {
    return 'Maaf, layanan yang Anda tuju tidak tersedia. Silakan coba beberapa saat lagi.'
  }
  if (status === 401 || status === 403) {
    return 'Maaf, sesi Anda tidak dapat diverifikasi. Silakan login ulang.'
  }
  if (status >= 500) {
    return SERVER_UNAVAILABLE_MESSAGE
  }
  if (status >= 400) {
    return 'Maaf, permintaan Anda tidak dapat diproses. Silakan coba lagi.'
  }
  return 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
}

function defaultErrorMessage(code?: string): string {
  if (code) return `Maaf, permintaan Anda gagal diproses (${code}). Silakan coba lagi.`
  return 'Maaf, permintaan Anda gagal diproses. Silakan coba lagi.'
}

export const SERVER_UNAVAILABLE_MESSAGE =
  'Maaf, sistem kami sedang mengalami gangguan. Silakan coba beberapa saat lagi.'

/** Ubah error koneksi mentah (`fetch failed`, timeout) menjadi ApiError berbahasa Indonesia. */
function toNetworkError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError(SERVER_UNAVAILABLE_MESSAGE, 0, 'TIMEOUT')
  }

  return new ApiError(SERVER_UNAVAILABLE_MESSAGE, 0, 'NETWORK_ERROR')
}

const DEFAULT_TIMEOUT_MS = 15000

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (API_DEBUG) {
      console.error(`[api] request gagal: ${redactSecrets(url)}`, redactLogValue(error))
    }
    throw toNetworkError(error)
  } finally {
    clearTimeout(timer)
  }
}

let refreshPromise: Promise<void> | null = null

/**
 * Refresh via cookie HttpOnly: body diisi kosong, backend membaca
 * `refresh_token` dari cookie (JS tidak bisa membaca token itu). Respons
 * men-set cookie access_token baru yang langsung terkirim di request berikut.
 */
async function refreshAccessToken(): Promise<void> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const csrf = getCsrfToken()
    const res = await fetchWithTimeout(AUTH.refresh, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'id',
        ...(csrf ? { 'X-CSRFToken': csrf } : {}),
      },
      body: JSON.stringify({}),
    })

    await parseEnvelope<RefreshResponse>(res)
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

type RequestOptions = {
  method?: string
  body?: unknown
  params?: Record<string, string>
  retried?: boolean
  skipAuth?: boolean
  timeoutMs?: number
}

class ApiClient {
  private getHeaders(isMultipart: boolean, method: string): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Language': 'id',
    }
    if (!isMultipart) headers['Content-Type'] = 'application/json'

    // Cookie dikirim ambien (credentials: 'include'); metode tidak-aman wajib
    // proteksi CSRF double-submit: header X-CSRFToken harus sama dengan cookie.
    if (UNSAFE_METHODS.has(method.toUpperCase())) {
      const csrf = getCsrfToken()
      if (csrf) headers['X-CSRFToken'] = csrf
    }
    return headers
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${API_PREFIX}${path}`)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value)
      }
    }
    return url.toString()
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      params,
      retried = false,
      skipAuth = false,
      timeoutMs,
    } = options
    const url = this.buildUrl(path, params)
    const isMultipart = body instanceof FormData

    const res = await fetchWithTimeout(
      url,
      {
        method,
        credentials: 'include',
        headers: this.getHeaders(isMultipart, method),
        ...(body !== undefined
          ? { body: isMultipart ? body : JSON.stringify(body) }
          : {}),
      },
      timeoutMs,
    )

    const isUnauthorized = res.status === 401
    const canRetry =
      !retried && !skipAuth && isUnauthorized && typeof window !== 'undefined'

    if (canRetry) {
      try {
        await refreshAccessToken()
        return this.request<T>(path, { ...options, retried: true })
      } catch {
        clearTokens()
        notifyUnauthorized()
        throw new ApiError('Sesi berakhir. Silakan login kembali.', 401)
      }
    }

    if (isUnauthorized && !skipAuth) {
      clearTokens()
      notifyUnauthorized()
    }

    if (res.status === 403 && !skipAuth) {
      notifyForbidden()
    }

    return parseEnvelope<T>(res)
  }

  get<T>(
    path: string,
    params?: Record<string, string>,
    options?: { skipAuth?: boolean },
  ): Promise<T> {
    return this.request<T>(path, { params, skipAuth: options?.skipAuth })
  }

  post<T>(path: string, body: unknown, options?: { skipAuth?: boolean }): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, skipAuth: options?.skipAuth })
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body })
  }

  delete(path: string): Promise<void> {
    return this.request<void>(path, { method: 'DELETE' })
  }

  upload<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: formData, timeoutMs: 30000 })
  }
}

export const api = new ApiClient()
export { ApiError, AUTH }
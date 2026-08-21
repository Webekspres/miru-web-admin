import { API_BASE_URL, API_DEBUG, API_PREFIX, AUTH } from './config'
import { TOKEN_KEYS } from './auth-constants'
import {
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from './auth-cookies'
import { notifyForbidden, notifyUnauthorized } from './api-handlers'
import {
  ApiError,
  type ApiEnvelope,
  type RefreshResponse,
} from '@/types/api'

export { TOKEN_KEYS } from './auth-constants'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.access)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.refresh)
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEYS.access, access)
  localStorage.setItem(TOKEN_KEYS.refresh, refresh)
  setAccessTokenCookie(access)
}

export function setAccessToken(access: string): void {
  localStorage.setItem(TOKEN_KEYS.access, access)
  setAccessTokenCookie(access)
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEYS.access)
  localStorage.removeItem(TOKEN_KEYS.refresh)
  clearAccessTokenCookie()
}

export async function parseEnvelope<T>(response: Response): Promise<T> {
  let envelope: ApiEnvelope<T>

  try {
    envelope = await response.json()
  } catch {
    throw new ApiError('Respons server tidak valid.', response.status)
  }

  if (!envelope.success) {
    throw new ApiError(
      envelope.message,
      envelope.status_code,
      envelope.code,
      envelope.errors ?? undefined,
    )
  }

  return envelope.data as T
}

/** Ubah error koneksi mentah (`fetch failed`, timeout) menjadi ApiError berbahasa Indonesia. */
function toNetworkError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError(
      'Koneksi ke server melebihi batas waktu. Periksa jaringan lalu coba lagi.',
      0,
      'TIMEOUT',
    )
  }

  return new ApiError(
    `Tidak dapat terhubung ke server MIRU di ${API_BASE_URL}. ` +
      'Pastikan backend berjalan dan koneksi jaringan aktif.',
    0,
    'NETWORK_ERROR',
  )
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
      console.error(`[api] request gagal: ${url}`, error)
    }
    throw toNetworkError(error)
  } finally {
    clearTimeout(timer)
  }
}

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refresh = getRefreshToken()
    if (!refresh) {
      throw new ApiError('Sesi berakhir. Silakan login kembali.', 401)
    }

    const res = await fetchWithTimeout(AUTH.refresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'id',
      },
      body: JSON.stringify({ refresh }),
    })

    const data = await parseEnvelope<RefreshResponse>(res)
    setAccessToken(data.access)
    return data.access
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
  private getHeaders(isMultipart = false, skipAuth = false): HeadersInit {
    const token = skipAuth ? null : getAccessToken()
    return {
      ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      'Accept-Language': 'id',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
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
        headers: this.getHeaders(isMultipart, skipAuth),
        ...(body !== undefined
          ? { body: isMultipart ? body : JSON.stringify(body) }
          : {}),
      },
      timeoutMs,
    )

    const isUnauthorized = res.status === 401
    const canRetry =
      !retried &&
      !skipAuth &&
      isUnauthorized &&
      typeof window !== 'undefined' &&
      getRefreshToken() !== null

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

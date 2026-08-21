import type { UserRole } from '@/types/models'
import type { ApiError } from '@/types/api'
import {
  isWebAdminRole,
  type WebAdminRole,
} from '@/lib/navigation'

export const NASABAH_LOGIN_MESSAGE =
  'Akun nasabah hanya dapat login melalui aplikasi mobile MIRU.'

export const WEB_ADMIN_ACCESS_DENIED_MESSAGE =
  'Akun tidak memiliki akses ke panel admin MIRU.'

export const LOGIN_RATE_LIMIT_MESSAGE =
  'Terlalu banyak percobaan login. Silakan tunggu sebentar lalu coba lagi.'

export const LOGIN_USER_NOT_FOUND_MESSAGE =
  'Nama pengguna tidak terdaftar.'

export const LOGIN_WRONG_PASSWORD_MESSAGE = 'Kata sandi salah.'

export const LOGIN_INVALID_CREDENTIALS_MESSAGE =
  'Nama pengguna atau kata sandi salah.'

export class WebAdminAccessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WebAdminAccessError'
  }
}

export function validateWebAdminRole(role: UserRole): WebAdminRole {
  if (role === 'nasabah') {
    throw new WebAdminAccessError(NASABAH_LOGIN_MESSAGE)
  }

  if (!isWebAdminRole(role)) {
    throw new WebAdminAccessError(WEB_ADMIN_ACCESS_DENIED_MESSAGE)
  }

  return role
}

function collectErrorText(error: ApiError): string {
  const fieldMessages = Object.values(error.errors ?? {}).flat()
  return [error.message, ...fieldMessages].filter(Boolean).join(' ')
}

/** Ambil sisa detik dari pesan throttle Inggris / field `wait`. */
export function extractThrottleWaitSeconds(error: ApiError): number | null {
  const waitField = error.errors?.wait?.[0]
  if (waitField != null) {
    const fromField = Number.parseInt(String(waitField), 10)
    if (Number.isFinite(fromField) && fromField > 0) return fromField
  }

  const text = collectErrorText(error)
  const match =
    text.match(/(\d+)\s*seconds?/i) ??
    text.match(/available in\s+(\d+)/i) ??
    text.match(/dalam\s+(\d+)\s*detik/i)

  if (!match) return null
  const seconds = Number.parseInt(match[1], 10)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

function isRateLimitError(error: ApiError, text: string): boolean {
  const code = (error.code ?? '').toUpperCase()
  return (
    error.statusCode === 429 ||
    code === 'THROTTLED' ||
    code === 'RATE_LIMIT_EXCEEDED' ||
    /throttl|rate.?limit|expected available/i.test(text)
  )
}

/**
 * Map error login API → pesan Bahasa Indonesia ramah.
 * Menangani rate-limit Inggris DRF dan kode/pesan gagal spesifik dari backend.
 */
export function mapLoginError(error: ApiError): string {
  const text = collectErrorText(error)
  const code = (error.code ?? '').toUpperCase()

  if (isRateLimitError(error, text)) {
    const seconds = extractThrottleWaitSeconds(error)
    if (seconds != null) {
      return `Terlalu banyak percobaan login. Coba lagi dalam ${seconds} detik.`
    }
    return LOGIN_RATE_LIMIT_MESSAGE
  }

  // Kode spesifik dulu — lalu pesan gabungan — baru pola teks spesifik.
  if (code === 'USER_NOT_FOUND') {
    return LOGIN_USER_NOT_FOUND_MESSAGE
  }

  if (code === 'INVALID_PASSWORD') {
    return LOGIN_WRONG_PASSWORD_MESSAGE
  }

  if (
    /username atau password|no active account|invalid credentials|unable to log in/i.test(
      text,
    )
  ) {
    return LOGIN_INVALID_CREDENTIALS_MESSAGE
  }

  if (
    /tidak terdaftar|tidak ditemukan|user not found|username.*(not found|unknown|does not exist)/i.test(
      text,
    )
  ) {
    return LOGIN_USER_NOT_FOUND_MESSAGE
  }

  if (
    /^(kata sandi|password) salah\.?$/i.test(text.trim()) ||
    /wrong password|incorrect password|invalid password/i.test(text)
  ) {
    return LOGIN_WRONG_PASSWORD_MESSAGE
  }

  if (code === 'AUTHENTICATION_FAILED') {
    return LOGIN_INVALID_CREDENTIALS_MESSAGE
  }

  return error.message || 'Login gagal. Silakan coba lagi.'
}

import { ApiError } from '@/types/api'
import { redactSecrets } from '@/lib/redact'

export const GENERIC_USER_ERROR =
  'Terjadi kesalahan. Silakan coba lagi. Jika berlanjut, hubungi pengelola.'

function looksLikeInternalDetail(text: string): boolean {
  return (
    /stack|exception|traceback|at\s+\S+\s+\(/i.test(text) ||
    /eyJ[A-Za-z0-9_-]+\./.test(text) ||
    /password/i.test(text)
  )
}

/** Pesan untuk UI: envelope API saja, tanpa stack / JWT / password. */
export function toUserFacingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const message = redactSecrets(error.message).trim()
    if (!message || looksLikeInternalDetail(message)) return GENERIC_USER_ERROR
    return message
  }

  return GENERIC_USER_ERROR
}

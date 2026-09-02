export const SESSION_EXPIRED_PARAM = 'reason'
export const SESSION_EXPIRED_VALUE = 'expired'

export const SESSION_EXPIRED_MESSAGE =
  'Sesi Anda telah berakhir. Silakan login kembali.'

export function isSessionExpiredReason(value: string | null): boolean {
  return value === SESSION_EXPIRED_VALUE
}

export function buildLoginUrl(from?: string | null, expired = false): string {
  const params = new URLSearchParams()
  if (expired) params.set(SESSION_EXPIRED_PARAM, SESSION_EXPIRED_VALUE)
  if (from && from.startsWith('/') && !from.startsWith('//')) {
    params.set('from', from)
  }
  const query = params.toString()
  return query ? `/login?${query}` : '/login'
}

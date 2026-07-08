import type { UserRole } from '@/types/models'
import {
  isWebAdminRole,
  type WebAdminRole,
} from '@/lib/navigation'

export const NASABAH_LOGIN_MESSAGE =
  'Akun nasabah hanya dapat login melalui aplikasi mobile MIRU.'

export const WEB_ADMIN_ACCESS_DENIED_MESSAGE =
  'Akun tidak memiliki akses ke panel admin MIRU.'

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

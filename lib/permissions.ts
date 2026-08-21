import type { WebAdminRole } from '@/lib/routes'

export function isReadOnlyRole(role: WebAdminRole): boolean {
  return role === 'koordinator' || role === 'pemerintah'
}

export function canMutate(role: WebAdminRole): boolean {
  return !isReadOnlyRole(role)
}

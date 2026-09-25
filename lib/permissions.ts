import type { WebAdminRole } from '@/lib/navigation'

export function isReadOnlyRole(role: WebAdminRole): boolean {
  return role === 'koordinator' || role === 'pemerintah'
}

export function canMutate(role: WebAdminRole): boolean {
  return !isReadOnlyRole(role)
}

/** Approve penarikan saldo: admin saja (petugas tidak). */
export function canApproveWithdrawal(role: WebAdminRole): boolean {
  return role === 'admin'
}

/** Approve tukar poin: admin saja. */
export function canApproveRedemption(role: WebAdminRole): boolean {
  return role === 'admin'
}

export function canCreateDeposit(role: WebAdminRole): boolean {
  return role === 'admin' || role === 'petugas'
}

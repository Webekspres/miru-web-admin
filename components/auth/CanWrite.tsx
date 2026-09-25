'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { canMutate } from '@/lib/permissions'

export interface CanWriteProps {
  children: ReactNode
  fallback?: ReactNode
}

/** Sembunyikan tombol edit/delete untuk role read-only (koordinator, pemerintah). */
export function CanWrite({ children, fallback = null }: CanWriteProps) {
  const { role } = useAuth()

  if (!role || !canMutate(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function useCanWrite(): boolean {
  const { role } = useAuth()
  return role ? canMutate(role) : false
}

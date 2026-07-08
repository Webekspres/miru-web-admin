'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resolvePostLoginPath } from '@/lib/routes'
import { useAuth } from '@/providers/AuthProvider'

export function LoginSessionSync() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status, isAuthenticated, role } = useAuth()

  useEffect(() => {
    if (status === 'loading' || !isAuthenticated || !role) return

    router.replace(resolvePostLoginPath(role, searchParams.get('from')))
  }, [status, isAuthenticated, role, router, searchParams])

  return null
}

'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { clearApiErrorHandlers, setApiErrorHandlers } from '@/lib/api-handlers'
import { buildLoginUrl } from '@/lib/session'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/providers/AuthProvider'

export function ApiErrorBridge() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()
  const { error: toastError } = useToast()

  useEffect(() => {
    setApiErrorHandlers({
      onUnauthorized: () => {
        logout()
        router.replace(buildLoginUrl(pathname, true))
      },
      onForbidden: () => {
        toastError('Anda tidak memiliki akses')
      },
    })

    return () => clearApiErrorHandlers()
  }, [logout, router, toastError, pathname])

  return null
}

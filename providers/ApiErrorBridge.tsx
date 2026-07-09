'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clearApiErrorHandlers, setApiErrorHandlers } from '@/lib/api-handlers'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/providers/AuthProvider'

export function ApiErrorBridge() {
  const router = useRouter()
  const { logout } = useAuth()
  const { error: toastError } = useToast()

  useEffect(() => {
    setApiErrorHandlers({
      onUnauthorized: () => {
        logout()
        router.replace('/login')
      },
      onForbidden: () => {
        toastError('Anda tidak memiliki akses')
      },
    })

    return () => clearApiErrorHandlers()
  }, [logout, router, toastError])

  return null
}

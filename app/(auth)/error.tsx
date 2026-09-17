'use client'

import { RouteErrorView } from '@/components/feedback/RouteErrorView'

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteErrorView reset={reset} />
}

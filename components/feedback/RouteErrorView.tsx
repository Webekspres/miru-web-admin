'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface RouteErrorViewProps {
  reset: () => void
}

export function RouteErrorView({ reset }: RouteErrorViewProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="size-6" aria-hidden />
      </div>
      <h1 className="text-lg font-semibold text-foreground">Halaman tidak dapat ditampilkan</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Terjadi gangguan saat memuat halaman ini. Silakan coba lagi. Jika berlanjut, hubungi
        pengelola.
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Muat ulang
      </Button>
    </div>
  )
}

'use client'

import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#171717',
        }}
      >
        <div role="alert" style={{ textAlign: 'center', padding: '2rem', maxWidth: '28rem' }}>
          <AlertCircle
            aria-hidden
            style={{ width: 28, height: 28, color: '#dc2626', margin: '0 auto 1rem' }}
          />
          <h1 style={{ fontSize: '1.125rem', margin: 0 }}>Aplikasi tidak dapat dimuat</h1>
          <p style={{ fontSize: '0.875rem', color: '#52525b', marginTop: '0.5rem' }}>
            Terjadi gangguan. Silakan muat ulang halaman. Jika berlanjut, hubungi pengelola.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              minHeight: 44,
              padding: '0 1.25rem',
              borderRadius: 8,
              border: 'none',
              background: '#15803d',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  )
}

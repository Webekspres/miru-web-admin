import Link from 'next/link'
import { MiruLogo } from '@/components/brand/MiruLogo'
import { APP_NAME } from '@/lib/config'

export function PublicShell({
  children,
  active,
}: {
  children: React.ReactNode
  active?: 'hapus-akun' | 'kebijakan-privasi'
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <MiruLogo variant="icon" height={36} className="rounded-lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">MIRU</p>
              <p className="truncate text-xs text-muted-foreground">{APP_NAME}</p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
          <p>© {new Date().getFullYear()} MIRU Bank Sampah. Semua hak dilindungi.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link
              href="/hapus-akun"
              className={
                active === 'hapus-akun'
                  ? 'font-medium text-foreground'
                  : 'font-medium text-primary hover:underline'
              }
            >
              Hapus Akun
            </Link>
            <Link
              href="/kebijakan-privasi"
              className={
                active === 'kebijakan-privasi'
                  ? 'font-medium text-foreground'
                  : 'font-medium text-primary hover:underline'
              }
            >
              Kebijakan Privasi
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

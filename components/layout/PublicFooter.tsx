import Image from 'next/image'
import Link from 'next/link'
import { MiruLogo } from '@/components/brand/MiruLogo'
import { NAV_LINKS } from './PublicNavbar'

export const FOOTER_LEGAL_LINKS = [
  { href: '/privacy-policy', label: 'Kebijakan Privasi' },
  { href: '/terms', label: 'Syarat & Ketentuan' },
  { href: '/hapus-akun', label: 'Hapus Akun' },
] as const

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/miru-g-badge.webp"
                alt="Logo MIRU-G"
                width={48}
                height={48}
                className="size-12 rounded-full object-cover"
              />
              <MiruLogo variant="full" height={32} className="h-8 w-auto" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Bank Sampah MIRU-G
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Distrik Mimika Baru · Kabupaten Mimika, Papua Tengah
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wide text-foreground uppercase">
              Navigasi
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="transition hover:text-primary">
                  Masuk Panel Admin
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="transition hover:text-primary">
                  Tentang MIRU
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wide text-foreground uppercase">
              Legal
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wide text-foreground uppercase">
              Kontak
            </h4>
            <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed text-muted-foreground">
              <p>Kantor Distrik Mimika Baru</p>
              <p>Jl. Cenderawasih, Timika</p>
              <p>Mimika Baru, Papua Tengah</p>
            </address>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Pemerintah Distrik Mimika Baru · MIRU-G</p>
          <p>
            Developed by{' '}
            <a
              href="https://webekspres.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Webekspres
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

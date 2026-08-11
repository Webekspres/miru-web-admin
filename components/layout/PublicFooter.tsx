import Image from 'next/image'
import Link from 'next/link'
import { MiruLogo } from '@/components/brand/MiruLogo'
import { NAV_LINKS } from './PublicNavbar'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background/95 text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand Identity & Governance Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <Image
                src="/brand/lambang-kabupaten-mimika.webp"
                alt="Lambang Kabupaten Mimika"
                width={56}
                height={56}
                className="size-14 object-contain"
              />
              <Image
                src="/brand/miru-g-badge.webp"
                alt="Logo MIRU-G"
                width={64}
                height={64}
                className="size-16 rounded-full object-cover"
              />
              <MiruLogo variant="full-bg" height={40} className="h-10 w-auto" />
            </div>

            <div>
              <p className="text-xs font-bold tracking-wider text-primary uppercase">
                Pemerintah Kabupaten Mimika · Distrik Mimika Baru
              </p>
              <h3 className="text-base font-bold text-foreground">
                MIRU-G — Mimika Baru Green Solution
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Sistem pengelolaan bank sampah digital terpadu untuk efisiensi operasional,
                pencatatan setoran, penjemputan armada, transparansi saldo nasabah, dan pelaporan
                distrik.
              </p>
              <p className="mt-3 text-xs italic font-medium text-emerald-700 dark:text-emerald-400">
                “Bersih Lingkungannya, Sehat Warganya, Maju Daerahnya”
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-foreground uppercase">
              Navigasi Layanan
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-medium text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors duration-150 hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className="transition-colors duration-150 hover:text-primary">
                  Masuk Panel Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Contact Info */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-foreground uppercase">
              Wilayah Operasional
            </h4>
            <div className="mt-4 space-y-3 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                <strong className="text-foreground">Kantor Distrik Mimika Baru</strong>
                <br />
                Jl. Cenderawasih, Timika, Mimika Baru
                <br />
                Kabupaten Mimika, Papua Tengah
              </p>
              <div className="rounded-md border border-border/60 bg-muted/40 p-3">
                <p className="font-semibold text-foreground">Akses Pengguna:</p>
                <p className="mt-1 text-[11px]">
                  • Panel Web: Admin, Koordinator, Petugas & Pemerintah Distrik
                  <br />• Mobile App: Nasabah Bank Sampah
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © {currentYear} Pemerintah Distrik Mimika Baru · MIRU-G. Semua hak dilindungi undang-undang.
          </p>
          <p>
            Developed by{' '}
            <a
              href="https://webekspres.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary underline-offset-2 transition hover:underline"
            >
              Webekspres
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

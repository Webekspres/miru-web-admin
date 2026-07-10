'use client'

import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  Leaf,
  LogIn,
  Recycle,
  Smartphone,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { APP_NAME, API_DOCS_URL, PLAY_STORE_URL } from '@/lib/config'

const BENEFITS = [
  {
    icon: Recycle,
    title: 'Kelola Setoran Sampah',
    description:
      'Catat transaksi setoran nasabah secara digital, pantau tonase, dan hitung nilai ekonomi sampah secara real-time.',
  },
  {
    icon: Truck,
    title: 'Penjemputan Terjadwal',
    description:
      'Atur permintaan penjemputan, tugaskan petugas, dan lacak status dari permintaan hingga selesai.',
  },
  {
    icon: Wallet,
    title: 'Saldo & Penarikan',
    description:
      'Proses penarikan saldo nasabah dengan validasi yang aman dan riwayat transaksi yang transparan.',
  },
  {
    icon: BarChart3,
    title: 'Laporan & Monitoring',
    description:
      'Dashboard agregat, laporan harian/mingguan/bulanan, dan ringkasan stok untuk pengambilan keputusan.',
  },
  {
    icon: Users,
    title: 'Manajemen Nasabah',
    description:
      'Kelola data nasabah, poin reward, dan aktivitas setoran dalam satu panel terpusat.',
  },
  {
    icon: Smartphone,
    title: 'Aplikasi Mobile Nasabah',
    description:
      'Nasabah dapat setor, ajukan penjemputan, tarik saldo, dan pantau poin langsung dari ponsel.',
  },
] as const

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">MIRU</p>
              <p className="truncate text-xs text-muted-foreground">{APP_NAME}</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href={API_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground sm:inline-flex"
            >
              <BookOpen className="size-4" aria-hidden />
              Dokumentasi API
            </a>
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <LogIn className="size-4" aria-hidden />
              Masuk Panel Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-border bg-linear-to-b from-primary/5 to-background">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Leaf className="size-4" aria-hidden />
                Platform Bank Sampah Digital
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Kelola Bank Sampah Lebih Efisien dengan MIRU
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {APP_NAME} menghubungkan nasabah, petugas, koordinator, dan pemerintah
                distrik dalam satu ekosistem digital — dari setoran sampah hingga laporan
                operasional.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  <LogIn className="size-4" aria-hidden />
                  Masuk untuk Admin & Petugas
                </Link>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-base font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  <Smartphone className="size-4" aria-hidden />
                  Download untuk Nasabah
                </a>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Panel web untuk admin, koordinator, petugas, dan pemerintah distrik.
                Nasabah menggunakan aplikasi mobile Android.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Keunggulan MIRU</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Solusi terintegrasi untuk operasional bank sampah modern.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-border bg-background p-6 shadow-sm"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border-t border-border bg-surface-muted/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Akses Panel Web
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Login tersedia untuk peran yang mengelola operasional melalui browser:
                  Admin Aplikasi, Koordinator Program, Petugas Bank Sampah, dan Pemerintah
                  Distrik.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  Masuk ke Panel Admin
                </Link>
              </div>

              <div className="rounded-xl border border-border bg-background p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Aplikasi untuk Nasabah
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Nasabah bank sampah tidak mengakses panel web. Unduh aplikasi MIRU di
                  Google Play Store untuk setor sampah, cek saldo, ajukan penjemputan, dan
                  tukar poin reward.
                </p>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  <Smartphone className="size-4" aria-hidden />
                  Buka Google Play Store
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="dokumentasi" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <BookOpen className="mx-auto size-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              Dokumentasi API
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Pelajari kontrak API MIRU untuk integrasi, pengembangan, dan pengujian
              endpoint backend.
            </p>
            <a
              href={API_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Buka Dokumentasi API
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
          <p>© {new Date().getFullYear()} MIRU Bank Sampah. Semua hak dilindungi.</p>
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Dokumentasi API
          </a>
        </div>
      </footer>
    </div>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ClipboardList,
  Coins,
  FileText,
  Globe2,
  Leaf,
  LogIn,
  MapPin,
  Menu,
  Recycle,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { MiruLogo } from '@/components/brand/MiruLogo'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/config'

const NAV_LINKS = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#tentang', label: 'Tentang' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#alur', label: 'Alur Kerja' },
  { href: '#akses', label: 'Akses' },
] as const

const FLOW = [
  {
    title: 'Pilah',
    description: 'Nasabah memilah sampah rumah tangga sesuai kategori yang ditetapkan.',
    color: 'bg-emerald-600',
    icon: Leaf,
  },
  {
    title: 'Setor',
    description: 'Sampah disetor ke bank sampah atau diajukan lewat penjemputan terjadwal.',
    color: 'bg-sky-600',
    icon: Recycle,
  },
  {
    title: 'Nabung',
    description: 'Hasil penimbangan dicatat digital dan nilai ekonomi masuk ke saldo nasabah.',
    color: 'bg-amber-500',
    icon: Coins,
  },
  {
    title: 'Bermanfaat',
    description: 'Data operasional mendukung monitoring, laporan, dan pengambilan keputusan.',
    color: 'bg-stone-600',
    icon: BarChart3,
  },
  {
    title: 'Lestari',
    description: 'Mendorong praktik daur ulang berkelanjutan untuk Mimika Baru.',
    color: 'bg-green-700',
    icon: Globe2,
  },
] as const

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Setoran & Penimbangan',
    description:
      'Catat jenis sampah, berat, dan nilai transaksi secara digital dengan riwayat yang dapat ditelusuri.',
  },
  {
    icon: Truck,
    title: 'Penjemputan Terjadwal',
    description:
      'Kelola permintaan penjemputan, penugasan petugas, dan status hingga selesai.',
  },
  {
    icon: Wallet,
    title: 'Saldo & Penarikan',
    description:
      'Pantau saldo nasabah dan proses penarikan dengan validasi serta jejak transaksi.',
  },
  {
    icon: Users,
    title: 'Manajemen Nasabah & Petugas',
    description:
      'Kelola data nasabah, staf, dan peran akses (admin, koordinator, petugas, pemerintah distrik).',
  },
  {
    icon: FileText,
    title: 'Laporan & Dashboard',
    description:
      'Ringkasan tonase, transaksi, dan indikator operasional untuk monitoring harian hingga bulanan.',
  },
  {
    icon: BookOpen,
    title: 'Edukasi & Pengaduan',
    description:
      'Sediakan materi edukasi pemilahan sampah serta tindak lanjut pengaduan warga.',
  },
  {
    icon: ShieldCheck,
    title: 'Kontrol Akses Berbasis Peran',
    description:
      'Hak akses disesuaikan peran pengguna agar data operasional tetap terkendali.',
  },
  {
    icon: MapPin,
    title: 'Konteks Wilayah Mimika Baru',
    description:
      'Dibangun sebagai aplikasi bank sampah Distrik Mimika Baru untuk mendukung layanan publik.',
  },
] as const

const ROLES = [
  {
    title: 'Admin & Koordinator',
    description: 'Mengelola operasional, staf, kategori sampah, laporan, dan pengaturan lembaga.',
  },
  {
    title: 'Petugas Bank Sampah',
    description: 'Mencatat setoran, menangani penjemputan, dan melayani transaksi nasabah.',
  },
  {
    title: 'Pemerintah Distrik',
    description: 'Memantau ringkasan kinerja dan laporan operasional bank sampah wilayah.',
  },
] as const

function SectionLabel({
  children,
  align = 'start',
}: {
  children: ReactNode
  align?: 'start' | 'center'
}) {
  return (
    <div
      className={cn(
        'mb-3 flex items-center gap-3',
        align === 'center' && 'justify-center',
      )}
    >
      <span className="h-px w-8 bg-primary/60" aria-hidden />
      <span className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        {children}
      </span>
      <span className="h-px w-8 bg-primary/60" aria-hidden />
    </div>
  )
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-white/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link
            href="#beranda"
            className="group flex min-w-0 items-center transition-transform duration-300 hover:scale-[1.02]"
          >
            <MiruLogo
              variant="full"
              height={36}
              className="hidden sm:block"
              priority
            />
            <MiruLogo
              variant="icon"
              height={34}
              className="rounded-md sm:hidden"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
            >
              <LogIn className="size-4" aria-hidden />
              <span className="hidden sm:inline">Masuk</span>
            </Link>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-surface-muted lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="size-4" aria-hidden />
              ) : (
                <Menu className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-300 lg:hidden',
            mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 border-t border-border/60 px-4 pt-3 pb-3 sm:px-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-primary/10 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="beranda" className="relative isolate min-h-svh overflow-hidden">
        <Image
          src="/landing/hero.webp"
          alt="Pengelolaan sampah dan daur ulang di lingkungan masyarakat"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/35" />

        <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">
              Solusi sampah untuk Mimika Baru
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {APP_NAME} (MIRU-G) adalah panel operasional bank sampah digital milik Pemerintah
              Distrik Mimika Baru. Halaman ini menjelaskan fitur yang tersedia bagi petugas,
              koordinator, admin, dan pemerintah distrik.
            </p>

            <div className="mt-8">
              <Link
                href="/login"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
              >
                Masuk ke Panel Admin
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/70">
              Pilah sampah · Jaga lingkungan · Raih manfaat · Bangun masa depan
            </p>
          </div>
        </div>
      </section>

      {/* Tentang */}
      <section id="tentang" className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div className="mx-auto w-full max-w-sm">
              <div className="group relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface-muted p-4 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl">
                <Image
                  src="/brand/miru-g-badge.webp"
                  alt="Logo MIRU-G — Mimika Baru Green Solution"
                  fill
                  className="object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 90vw, 380px"
                  priority
                />
              </div>
            </div>

            <div>
              <SectionLabel>Tentang MIRU-G</SectionLabel>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Mimika Baru Green Solution
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                MIRU-G dikembangkan sebagai aplikasi bank sampah untuk mendukung program
                pengelolaan sampah di Distrik Mimika Baru. Sistem ini mencatat setoran, saldo,
                penjemputan, dan laporan operasional dalam satu panel web.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Bersih lingkungannya, sehat warganya, maju daerahnya',
                  'Bersama membangun Mimika Baru melalui bank sampah digital',
                  'Panel web untuk petugas & admin; nasabah memakai aplikasi mobile',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition duration-300 hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Masuk untuk mengelola data
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Alur */}
      <section id="alur" className="bg-surface-muted/70 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel align="center">Alur Kerja</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Dari pilah sampai lestari
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Lima tahap utama yang digambarkan pada identitas MIRU-G dan didukung oleh fitur
              sistem.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FLOW.map((step, index) => {
              const Icon = step.icon
              return (
                <article
                  key={step.title}
                  className="group rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <div
                    className={cn(
                      'mb-4 flex size-11 items-center justify-center rounded-full text-white transition duration-300 group-hover:scale-110',
                      step.color,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <p className="text-[11px] font-bold tracking-widest text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <SectionLabel>Fitur Panel Web</SectionLabel>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Modul yang tersedia di MIRU
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Berikut ringkasan kemampuan panel administrasi. Setiap fitur mengarah ke kebutuhan
                operasional bank sampah, bukan promosi produk.
              </p>
              <div className="relative mt-8 hidden aspect-4/5 overflow-hidden rounded-[1.25rem] lg:block">
                <Image
                  src="/landing/why-us-portrait.webp"
                  alt="Proses pengelolaan sampah daur ulang"
                  fill
                  className="object-cover transition duration-700 hover:scale-105"
                  sizes="40vw"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-border bg-background p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/5 hover:shadow-lg"
                  >
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Akses / peran */}
      <section id="akses" className="bg-surface-muted/60 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel align="center">Akses Pengguna</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Peran akses panel web
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Panel web ditujukan untuk peran operasional dan monitoring. Nasabah menggunakan
              aplikasi mobile terpisah.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {ROLES.map((role) => (
              <article
                key={role.title}
                className="rounded-[1.25rem] border border-border bg-background p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {role.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-border">
            <div className="relative aspect-21/9 min-h-48">
              <Image
                src="/landing/about.webp"
                alt="Kegiatan pengelolaan bank sampah"
                fill
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/45 to-transparent" />
              <div className="absolute inset-0 flex items-end p-6 sm:p-10">
                <div className="max-w-lg">
                  <h3 className="text-2xl font-bold text-white sm:text-3xl">
                    Siap mengelola operasional bank sampah?
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    Masuk dengan akun petugas atau admin yang telah diberikan oleh pengelola.
                  </p>
                  <Link
                    href="/login"
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-primary transition duration-300 hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    <LogIn className="size-4" aria-hidden />
                    Masuk ke Panel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-start">
            <div className="flex items-start gap-4">
              <Image
                src="/brand/miru-g-badge-sm.webp"
                alt="Logo MIRU-G"
                width={72}
                height={72}
                className="size-16 rounded-full object-cover ring-1 ring-border"
              />
              <div>
                <div className="flex items-center gap-2">
                  <MiruLogo variant="icon" height={28} className="rounded-md" />
                  <p className="text-sm font-bold text-foreground">MIRU-G</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mimika Baru Green Solution — Aplikasi Bank Sampah Distrik Mimika Baru.
                </p>
                <p className="mt-2 text-xs italic text-muted-foreground">
                  “Bersih Lingkungannya, Sehat Warganya, Maju Daerahnya”
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground md:justify-end">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
              <Link href="/login" className="transition hover:text-primary">
                Masuk
              </Link>
            </nav>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
            <p>
              © {new Date().getFullYear()} Pemerintah Distrik Mimika Baru · MIRU-G. Semua hak
              dilindungi.
            </p>
            <p>
              Developed by{' '}
              <a
                href="https://webekspres.id"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-2 transition hover:underline"
              >
                Webekspres
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

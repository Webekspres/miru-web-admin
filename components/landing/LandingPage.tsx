'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardList,
  Coins,
  FileSpreadsheet,
  HeartPulse,
  Landmark,
  Layers,
  Leaf,
  LogIn,
  Recycle,
  ShieldCheck,
  Smartphone,
  Sprout,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/config'
import { PhotoBackdrop } from '@/components/landing/PhotoBackdrop'
import { KeywordMarquee } from '@/components/landing/KeywordMarquee'
import { HERO_BACKDROPS } from '@/components/landing/backdrops'
import { PublicEducationPreview } from '@/components/education/PublicEducationPreview'

const WORKFLOW = [
  {
    step: '01',
    title: 'Pilah Sampah',
    desc: 'Warga memilah sampah anorganik di rumah tangga.',
    icon: Leaf,
  },
  {
    step: '02',
    title: 'Setor & Penjemputan',
    desc: 'Setor ke bank sampah atau ajukan jemput via mobile.',
    icon: Truck,
  },
  {
    step: '03',
    title: 'Penimbangan Digital',
    desc: 'Petugas menimbang dan input berat serta tarif di panel.',
    icon: Recycle,
  },
  {
    step: '04',
    title: 'Tabungan & Laporan',
    desc: 'Nilai masuk saldo nasabah; tonase masuk laporan distrik.',
    icon: Coins,
  },
] as const

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Setoran & Penimbangan',
    desc: 'Catat jenis, berat, dan harga per kg secara digital.',
  },
  {
    icon: Truck,
    title: 'Penjemputan Armada',
    desc: 'Antrean jemput, penugasan driver, lokasi realtime.',
  },
  {
    icon: Wallet,
    title: 'Saldo & Penarikan',
    desc: 'Dompet nasabah, klaim penarikan, dan bukti transfer.',
  },
  {
    icon: Users,
    title: 'Staf & Nasabah',
    desc: 'Pendaftaran, verifikasi, dan otorisasi petugas.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Laporan Tonase',
    desc: 'Grafik tonase daur ulang dan nilai ekonomi wilayah.',
  },
  {
    icon: BookOpen,
    title: 'Edukasi & Pengaduan',
    desc: 'Panduan pemilahan dan penanganan laporan warga.',
  },
  {
    icon: ShieldCheck,
    title: 'Kontrol Akses (RBAC)',
    desc: 'Hak akses Admin, Koordinator, Petugas, dan Distrik.',
  },
  {
    icon: Layers,
    title: 'Integrasi Mobile & Web',
    desc: 'Sinkronisasi transaksi mobile nasabah dan web admin.',
  },
] as const

const PILLARS = [
  {
    icon: Sprout,
    title: 'Bersih Lingkungannya',
    desc: 'Kurangi sampah liar di kawasan pemukiman Mimika Baru.',
    tone: 'bg-emerald-50 text-emerald-800',
    iconBg: 'bg-emerald-600',
  },
  {
    icon: HeartPulse,
    title: 'Sehat Warganya',
    desc: 'Cegah dampak kesehatan dari tumpukan sampah tidak terkelola.',
    tone: 'bg-teal-50 text-teal-900',
    iconBg: 'bg-teal-600',
  },
  {
    icon: TrendingUp,
    title: 'Maju Daerahnya',
    desc: 'Nilai ekonomi daur ulang & laporan distrik yang transparan.',
    tone: 'bg-lime-50 text-lime-950',
    iconBg: 'bg-lime-700',
  },
] as const

const CATEGORIES = [
  {
    title: 'Plastik & Botol PET',
    desc: 'Botol, gelas plastik, ember, jeriken, HDPE.',
    image: '/landing/illustrations/cat-plastic.webp',
  },
  {
    title: 'Kertas & Kardus',
    desc: 'Kardus, koran, majalah, HVS, dupleks.',
    image: '/landing/illustrations/cat-paper.webp',
  },
  {
    title: 'Logam & Aluminium',
    desc: 'Kaleng, besi tua, seng, tembaga.',
    image: '/landing/illustrations/cat-metal.webp',
  },
  {
    title: 'Kaca & Botol Utuh',
    desc: 'Botol kaca, toples, pecahan olahan.',
    image: '/landing/illustrations/cat-glass.webp',
  },
] as const

const ROLES = [
  {
    title: 'Admin & Koordinator',
    desc: 'Master data, tarif, staf, laporan wilayah, dan sistem.',
    icon: UserCog,
  },
  {
    title: 'Petugas Bank Sampah',
    desc: 'Penimbangan harian, penjemputan, verifikasi setoran.',
    icon: Building2,
  },
  {
    title: 'Pemerintah Distrik',
    desc: 'Monitoring tonase kelurahan dan efektivitas kebersihan.',
    icon: Landmark,
  },
  {
    title: 'Nasabah Warga',
    desc: 'Aplikasi mobile: saldo, riwayat, dan ajukan jemput.',
    icon: Smartphone,
  },
] as const

const FAQS = [
  {
    q: 'Apa itu platform MIRU-G?',
    a: 'MIRU-G (Mimika Baru Green Solution) adalah platform bank sampah digital terpadu milik Pemerintah Distrik Mimika Baru untuk pencatatan setoran, penjemputan armada, dan pelaporan wilayah.',
  },
  {
    q: 'Siapa saja yang menggunakan Web Admin ini?',
    a: 'Web Admin untuk Admin, Koordinator Distrik, Staf Petugas Lapangan/Kasir, dan Pejabat Pemerintah Distrik Mimika Baru.',
  },
  {
    q: 'Bagaimana nasabah menyetor sampah dan melihat saldo?',
    a: 'Nasabah memakai Aplikasi Mobile MIRU untuk saldo, riwayat setoran, katalog harga, dan pengajuan penjemputan.',
  },
  {
    q: 'Apa keunggulan pencatatan penimbangan digital?',
    a: 'Mengurangi kesalahan manual, transparansi harga, dan struk digital yang tersimpan aman.',
  },
] as const

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-foreground">
      {/* 1. HERO — full-bleed */}
      <section id="beranda" className="relative min-h-[85vh] overflow-hidden text-white sm:min-h-[90vh]">
        <PhotoBackdrop
          src={HERO_BACKDROPS}
          alt="Kegiatan bank sampah MIRU-G Mimika Baru"
          overlay="hero"
          extraOverlay="heroBottom"
          kenBurns
          priority
        />

        <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-end px-4 py-12 sm:min-h-[90vh] sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
              <p className="mb-3 text-sm font-medium text-emerald-100/85">
                Pemerintah Kabupaten Mimika · Distrik Mimika Baru
              </p>

              <h1 className="text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
                Digitalisasi Pengelolaan Bank Sampah Terpadu
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                Panel operasional {APP_NAME} (MIRU-G) untuk setoran digital, armada
                penjemputan, saldo nasabah, dan laporan tonase wilayah.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-emerald-500 px-6 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-400 active:scale-[0.98]"
                >
                  Masuk Panel Administrasi
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/edukasi"
                  className="inline-flex h-12 items-center rounded-md border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Edukasi Sampah
                </Link>
              </div>

              <p className="mt-8 text-xs font-medium tracking-wide text-white/60 sm:text-sm">
                100% Digital · Mimika Baru · Laporan Realtime
              </p>
          </div>
        </div>
      </section>

      <KeywordMarquee />

      {/* 2. TENTANG */}
      <section id="tentang" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
            <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-emerald-50 sm:aspect-16/10">
              <PhotoBackdrop
                src="/landing/illustrations/about.webp"
                alt="Pemilahan sampah di bank sampah MIRU-G"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
                Tentang MIRU-G
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Mitra Terpercaya Pengelolaan Bank Sampah Mimika
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                MIRU-G mengintegrasikan pemilahan sampah masyarakat dengan panel
                administrasi digital — transparansi saldo, efisiensi jemput armada,
                dan data akurat bagi Pemerintah Distrik Mimika Baru.
              </p>

              <div className="mt-7 space-y-3">
                {PILLARS.map((pillar) => {
                  const Icon = pillar.icon
                  return (
                    <div
                      key={pillar.title}
                      className={cn(
                        'flex gap-4 rounded-lg p-4 transition',
                        pillar.tone,
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                          pillar.iconBg,
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold sm:text-base">
                          {pillar.title}
                        </h3>
                        <p className="mt-0.5 text-sm opacity-80">{pillar.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ALUR — kolom tanpa card berborder */}
      <section id="alur" className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0">
          <PhotoBackdrop src="/landing/illustrations/about.webp" overlay="mist" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Alur Kerja Sistem Bank Sampah
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Empat tahap dari rumah tangga hingga laporan distrik
            </p>
          </div>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {WORKFLOW.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="text-center motion-safe:animate-fade-up sm:text-left"
                  style={{ animationDelay: `${Number(item.step) * 80}ms` }}
                >
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white sm:mx-0">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 text-xs font-bold tracking-wider text-emerald-700">
                    LANGKAH {item.step}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. FITUR — ilustrasi + daftar */}
      <section id="fitur" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-12">
            <div className="relative min-h-80 overflow-hidden rounded-xl bg-emerald-50 lg:min-h-full">
              <PhotoBackdrop
                src="/landing/illustrations/features.webp"
                alt="Ilustrasi operasional panel bank sampah"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-emerald-950/75 to-transparent p-6 pt-16 text-white">
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Modul Utama Panel Administrasi
                </h2>
                <p className="mt-2 text-sm text-white/80">
                  Pengawasan dan eksekusi transaksi bank sampah
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURES.map((feat) => {
                const Icon = feat.icon
                return (
                  <div
                    key={feat.title}
                    className="rounded-xl bg-white p-5 shadow-[0_12px_40px_-28px_rgba(6,78,59,0.45)] ring-1 ring-emerald-900/5 transition hover:shadow-[0_18px_44px_-24px_rgba(6,78,59,0.4)]"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Icon className="size-4.5" />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-foreground">
                      {feat.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {feat.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. KATEGORI — mengelola berbagai jenis sampah */}
      <section id="kategori" className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-linear-to-b from-[#e8f2eb] via-white to-white" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
              Jenis sampah
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Mengelola Berbagai Jenis Sampah
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Satu platform untuk menimbang dan mencatat plastik, kertas, logam, dan kaca
              — dari setoran warga hingga laporan tonase distrik.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <article
                key={cat.title}
                className="group overflow-hidden rounded-xl bg-white shadow-[0_18px_50px_-32px_rgba(6,78,59,0.55)] ring-1 ring-emerald-900/5 transition"
              >
                <div className="relative aspect-square overflow-hidden bg-emerald-50">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-extrabold text-foreground">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{cat.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicEducationPreview />

      {/* 6. PERAN — full-bleed */}
      <section id="akses" className="bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-60 lg:min-h-full">
            <PhotoBackdrop
              src="/landing/illustrations/roles.webp"
              alt="Ilustrasi peran pengguna MIRU-G"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute inset-0 bg-linear-to-r from-emerald-950/20 via-transparent to-emerald-950/80 lg:from-transparent lg:to-emerald-950" />
          </div>

          <div className="relative z-10 flex flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hak Akses & Peran Pengguna
            </h2>
            <p className="mt-2 text-sm text-emerald-100/70">
              Otorisasi berlapis untuk keamanan dan akurasi transaksi
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {ROLES.map((role) => {
                const Icon = role.icon
                return (
                  <div
                    key={role.title}
                    className="rounded-lg bg-white/8 p-4 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/12"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-200">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold">{role.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-100/65">
                      {role.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            Pertanyaan Umum
          </h2>

          <div className="mt-10 divide-y divide-border/80">
            {FAQS.map((faq, idx) => (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold text-foreground sm:text-base"
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                      openFaq === idx && 'rotate-180 text-emerald-600',
                    )}
                  />
                </button>
                {openFaq === idx && (
                  <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA — full-bleed */}
      <section className="relative overflow-hidden">
        <PhotoBackdrop src={HERO_BACKDROPS} overlay="dark" kenBurns />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Siap Mengelola Operasional Bank Sampah?
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Masuk dengan akun petugas, koordinator, atau admin yang terdaftar.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 active:scale-[0.98]"
          >
            <LogIn className="size-4" />
            Masuk ke Panel Administrasi
          </Link>
        </div>
      </section>
    </div>
  )
}

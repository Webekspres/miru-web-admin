import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoginSessionSync } from '@/components/auth/LoginSessionSync'
import { CardSkeleton } from '@/components/feedback/LoadingSkeleton'
import { APP_NAME } from '@/lib/config'

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <CardSkeleton className="h-16" />
      <CardSkeleton className="h-16" />
      <CardSkeleton className="h-10" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginSessionSync />
      </Suspense>

      <div className="grid min-h-full flex-1 lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden lg:block">
          <Image
            src="/landing/illustrations/hero.webp"
            alt="Pengelolaan bank sampah Mimika Baru"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-linear-to-br from-emerald-950/92 via-emerald-900/78 to-black/70" />

          <div className="relative z-10 flex h-full flex-col justify-center p-10 text-white xl:p-14">

            <div>
              <div className="mb-8 flex items-center gap-4">
                <Image
                  src="/brand/lambang-kabupaten-mimika.webp"
                  alt="Lambang Kabupaten Mimika"
                  width={72}
                  height={72}
                  className="size-16 object-contain drop-shadow-md sm:size-18"
                  priority
                />
                <Image
                  src="/brand/miru-g-badge.webp"
                  alt="Logo MIRU-G Mimika Baru"
                  width={80}
                  height={80}
                  className="size-18 rounded-full object-cover shadow-lg ring-2 ring-white/35 sm:size-20"
                  priority
                />
              </div>

              <p className="mb-3 text-sm font-medium text-emerald-100/80">
                Pemerintah Distrik Mimika Baru
              </p>
              <h1 className="max-w-lg text-3xl font-bold tracking-tight xl:text-4xl">
                Panel Administrasi MIRU-G
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 xl:text-base">
                Mimika Baru Green Solution — aplikasi bank sampah digital untuk mencatat setoran,
                penjemputan, saldo, dan laporan operasional wilayah.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-white/85">
                {[
                  'Akses sesuai peran: admin, koordinator, petugas, pemerintah distrik',
                  'Data penimbangan digital & transaksi dapat ditelusuri',
                  'Monitoring operasional wilayah Distrik Mimika Baru',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-white/55">
              Pemerintah Distrik Mimika Baru · MIRU-G Bank Sampah
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <main className="relative flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(22,163,74,0.08),transparent_50%)]"
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-md">
            {/* Mobile-only: back + brand (no logo repeat on desktop form) */}
            <div className="mb-6 space-y-5 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Kembali ke beranda
              </Link>
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/miru-g-badge.webp"
                  alt="Logo MIRU-G"
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">MIRU-G</p>
                  <p className="text-xs text-muted-foreground">Distrik Mimika Baru</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/95 p-6 shadow-md backdrop-blur sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Masuk Panel</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Gunakan akun {APP_NAME} Anda untuk mengelola operasional bank sampah.
              </p>

              <div className="mt-6">
                <Suspense fallback={<LoginFormFallback />}>
                  <LoginForm />
                </Suspense>
              </div>
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline mt-4 block text-right"
                >
                  Kembali ke beranda
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

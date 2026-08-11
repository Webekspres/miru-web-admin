import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { MiruLogo } from '@/components/brand/MiruLogo'
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

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden lg:block">
          <Image
            src="/landing/hero.webp"
            alt="Pengelolaan bank sampah Mimika Baru"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-linear-to-br from-emerald-950/90 via-emerald-900/75 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,163,74,0.35),transparent_55%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-14">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Kembali ke beranda
            </Link>

            <div>
              <div className="mb-8 flex items-center gap-4">
                <Image
                  src="/brand/miru-g-badge.webp"
                  alt="Logo MIRU-G Mimika Baru"
                  width={112}
                  height={112}
                  className="size-24 rounded-full object-cover shadow-xl ring-2 ring-white/30"
                  priority
                />
                <MiruLogo variant="icon" height={56} className="rounded-xl bg-white/10 p-1.5" />
              </div>

              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <MapPin className="size-3.5" aria-hidden />
                Distrik Mimika Baru
              </p>
              <h1 className="max-w-md text-3xl font-bold tracking-tight xl:text-4xl">
                Panel administrasi MIRU-G
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 xl:text-base">
                Mimika Baru Green Solution — aplikasi bank sampah untuk mencatat setoran,
                penjemputan, saldo, dan laporan operasional.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-white/85">
                {[
                  'Akses sesuai peran: admin, koordinator, petugas, pemerintah distrik',
                  'Data transaksi tersimpan dan dapat ditelusuri',
                  'Monitoring operasional wilayah Mimika Baru',
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
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary lg:hidden"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Kembali ke beranda
            </Link>

            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <Image
                src="/brand/miru-g-badge-sm.webp"
                alt="Logo MIRU-G"
                width={56}
                height={56}
                className="size-14 rounded-full object-cover ring-1 ring-border"
                priority
              />
              <MiruLogo variant="full" height={40} />
            </div>

            <div className="rounded-3xl border border-border bg-background/90 p-6 shadow-xl shadow-black/5 backdrop-blur sm:p-8">
              <div className="mb-6 hidden items-center gap-3 lg:flex">
                <Image
                  src="/brand/miru-g-badge-sm.webp"
                  alt="Logo MIRU-G"
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover ring-1 ring-border"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">MIRU-G</p>
                  <p className="text-xs text-muted-foreground">Mimika Baru Green Solution</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-foreground">Masuk</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Gunakan akun {APP_NAME} untuk mengelola operasional bank sampah.
              </p>

              <div className="mt-6">
                <Suspense fallback={<LoginFormFallback />}>
                  <LoginForm />
                </Suspense>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Developed by{' '}
              <a
                href="https://webekspres.id"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Webekspres
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

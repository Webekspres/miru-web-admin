import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoginSessionSync } from '@/components/auth/LoginSessionSync'
import { CardSkeleton } from '@/components/feedback/LoadingSkeleton'
import { PhotoBackdrop } from '@/components/landing/PhotoBackdrop'
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

      <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
        <PhotoBackdrop src="/landing/hero.webp" alt="" overlay="dark" priority sizes="100vw" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-4">
              <Image
                src="/brand/lambang-kabupaten-mimika.webp"
                alt="Lambang Kabupaten Mimika"
                width={56}
                height={56}
                className="size-14 object-contain drop-shadow-md"
                priority
              />
              <Image
                src="/brand/miru-g-badge.webp"
                alt="Logo MIRU-G Mimika Baru"
                width={64}
                height={64}
                className="size-16 rounded-full object-cover shadow-lg ring-2 ring-white/35"
                priority
              />
            </div>
            <p className="mt-3 text-sm font-medium text-emerald-100/90">
              Pemerintah Distrik Mimika Baru
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-background/95 p-6 shadow-md backdrop-blur sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Masuk Panel</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Gunakan akun {APP_NAME} Anda untuk mengelola operasional bank sampah.
            </p>

            <div className="mt-6">
              <Suspense fallback={<LoginFormFallback />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white/85 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </>
  )
}
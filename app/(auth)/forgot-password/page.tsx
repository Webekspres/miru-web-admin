import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { PhotoBackdrop } from '@/components/landing/PhotoBackdrop'

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <PhotoBackdrop src="/landing/hero.webp" overlay="split" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/25"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke login
        </Link>

        <div className="rounded-2xl border border-white/20 bg-background/95 p-6 shadow-md backdrop-blur sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lupa kata sandi
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pulihkan akses akun panel dengan verifikasi WhatsApp OTP.
          </p>
          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}

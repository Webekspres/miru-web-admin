import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke beranda
        </Link>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-md sm:p-8">
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

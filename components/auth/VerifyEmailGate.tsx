'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { MailCheck } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const RESEND_SECONDS = 60

interface RequestOtpResponse {
  masked_email?: string
  email_verified?: boolean
  dev_otp?: string
}

/**
 * Wajib sekali untuk semua role: akun tanpa email terverifikasi
 * (`email_required`) harus mengisi email + OTP sebelum memakai panel.
 */
export function VerifyEmailGate({ onLogout }: { onLogout: () => void }) {
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState(user?.email ?? '')
  const [otp, setOtp] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | undefined>()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  function showError(err: unknown, fallback: string, field: 'email' | 'otp') {
    if (err instanceof ApiError) {
      setError(err.message)
      setFieldError(err.errors?.[field]?.[0])
    } else {
      setError(fallback)
    }
  }

  async function requestOtp(event?: FormEvent) {
    event?.preventDefault()
    setError(null)
    setFieldError(undefined)
    setLoading(true)
    try {
      const data = await api.post<RequestOtpResponse>('/auth/email/request-otp/', {
        email: email.trim(),
      })
      if (data.email_verified) {
        // Mode testing (verifikasi dilewati) — langsung selesai.
        await refreshProfile()
        return
      }
      setMaskedEmail(data.masked_email ?? email.trim())
      setDevOtp(data.dev_otp ?? null)
      setOtp('')
      setCooldown(RESEND_SECONDS)
      setStep('otp')
    } catch (err) {
      showError(err, 'Gagal mengirim kode OTP. Coba lagi.', 'email')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldError(undefined)
    setLoading(true)
    try {
      await api.post('/auth/email/verify-otp/', { otp: otp.trim() })
      await refreshProfile()
    } catch (err) {
      showError(err, 'Verifikasi OTP gagal. Coba lagi.', 'otp')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-md sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="size-5 text-primary" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">Verifikasi email</h1>
            <p className="text-sm text-muted-foreground">
              Halo, {user?.nama_lengkap}. Satu langkah lagi sebelum masuk panel.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Email dipakai untuk kode OTP saat lupa kata sandi dan pemberitahuan akun.
          Verifikasi cukup sekali.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={requestOtp} className="mt-4 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldError}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full" loading={loading} disabled={!email.trim()}>
              Kirim Kode OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-4 space-y-4" noValidate>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-800">
              Kode OTP dikirim ke <strong>{maskedEmail}</strong>. Periksa kotak masuk atau folder
              spam. Kode berlaku 5 menit.
            </div>
            {devOtp && (
              <p className="text-xs text-muted-foreground">
                Mode development: gunakan kode <strong>{devOtp}</strong>.
              </p>
            )}
            <Input
              label="Kode OTP"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6 digit kode"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              error={fieldError}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full" loading={loading} disabled={otp.length !== 6}>
              Verifikasi
            </Button>
            <div className="flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setError(null)
                  setFieldError(undefined)
                  setStep('email')
                }}
              >
                Ganti email
              </button>
              <button
                type="button"
                className="cursor-pointer text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                disabled={cooldown > 0 || loading}
                onClick={() => requestOtp()}
              >
                {cooldown > 0 ? `Kirim ulang (${cooldown} dtk)` : 'Kirim ulang kode'}
              </button>
            </div>
          </form>
        )}

        <button
          type="button"
          className="mt-6 w-full cursor-pointer text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          Keluar
        </button>
      </div>
    </div>
  )
}

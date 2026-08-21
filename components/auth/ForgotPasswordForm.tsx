'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'

type Step = 'username' | 'phone' | 'otp' | 'password' | 'done'

function mapFieldErrors(
  errors?: Record<string, string[]>,
): Record<string, string> {
  if (!errors) return {}
  const mapped: Record<string, string> = {}
  for (const [key, messages] of Object.entries(errors)) {
    if (messages[0]) mapped[key] = messages[0]
  }
  return mapped
}

export function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('username')
  const [username, setUsername] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [info, setInfo] = useState<string | null>(null)

  function clearAlerts() {
    setFormError(null)
    setFieldErrors({})
    setInfo(null)
  }

  async function handleUsername(event: FormEvent) {
    event.preventDefault()
    clearAlerts()
    setLoading(true)
    try {
      const data = await api.post<{
        username: string
        masked_phone: string
        next: string
      }>('/auth/forgot-password/', { username: username.trim() }, { skipAuth: true })
      setMaskedPhone(data.masked_phone)
      setInfo(
        `Akun ditemukan. Konfirmasi nomor HP yang terdaftar (${data.masked_phone}), lalu kami kirim OTP ke WhatsApp.`,
      )
      setStep('phone')
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(mapFieldErrors(error.errors))
      } else {
        setFormError('Gagal memeriksa username. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handlePhone(event: FormEvent) {
    event.preventDefault()
    clearAlerts()
    setLoading(true)
    try {
      const data = await api.post<{
        username: string
        masked_phone: string
        expires_in_seconds: number
      }>(
        '/auth/reset-password/request-otp/',
        { username: username.trim(), no_hp: phone.trim() },
        { skipAuth: true },
      )
      setMaskedPhone(data.masked_phone)
      setInfo(`Kode OTP telah dikirim ke WhatsApp ${data.masked_phone}.`)
      setStep('otp')
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(mapFieldErrors(error.errors))
      } else {
        setFormError('Gagal mengirim OTP. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleOtp(event: FormEvent) {
    event.preventDefault()
    clearAlerts()
    setLoading(true)
    try {
      const data = await api.post<{ reset_token: string; expires_in: string }>(
        '/auth/reset-password/verify-otp/',
        { username: username.trim(), otp: otp.trim() },
        { skipAuth: true },
      )
      setResetToken(data.reset_token)
      setInfo('OTP valid. Silakan buat kata sandi baru.')
      setStep('password')
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(mapFieldErrors(error.errors))
      } else {
        setFormError('Verifikasi OTP gagal. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handlePassword(event: FormEvent) {
    event.preventDefault()
    clearAlerts()
    setLoading(true)
    try {
      await api.post(
        '/auth/reset-password/',
        {
          token: resetToken,
          password,
          password_confirm: passwordConfirm,
        },
        { skipAuth: true },
      )
      setStep('done')
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(mapFieldErrors(error.errors))
      } else {
        setFormError('Gagal menyimpan kata sandi baru.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-foreground">
          Kata sandi berhasil diperbarui.
        </p>
        <p className="text-sm text-muted-foreground">
          Silakan masuk dengan kata sandi baru Anda.
        </p>
        <Button type="button" className="w-full" onClick={() => router.push('/login')}>
          Ke halaman masuk
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {formError}
        </div>
      )}
      {info && !formError && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-800">
          {info}
        </div>
      )}

      {step === 'username' && (
        <form onSubmit={handleUsername} className="space-y-4" noValidate>
          <Input
            label="Nama pengguna"
            name="username"
            autoComplete="username"
            placeholder="Masukkan nama pengguna"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
            disabled={loading}
            required
          />
          <Button type="submit" className="w-full" loading={loading} disabled={!username.trim()}>
            Lanjut
          </Button>
        </form>
      )}

      {step === 'phone' && (
        <form onSubmit={handlePhone} className="space-y-4" noValidate>
          <p className="text-xs text-muted-foreground">
            Nomor terdaftar: <strong>{maskedPhone}</strong>
          </p>
          <Input
            label="Nomor HP"
            name="no_hp"
            type="tel"
            placeholder="08xxxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={fieldErrors.no_hp}
            disabled={loading}
            required
          />
          <Button type="submit" className="w-full" loading={loading} disabled={!phone.trim()}>
            Kirim OTP WhatsApp
          </Button>
          <button
            type="button"
            className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearAlerts()
              setStep('username')
            }}
          >
            Ganti nama pengguna
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtp} className="space-y-4" noValidate>
          <Input
            label="Kode OTP"
            name="otp"
            inputMode="numeric"
            placeholder="Masukkan kode dari WhatsApp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={fieldErrors.otp}
            disabled={loading}
            required
          />
          <Button type="submit" className="w-full" loading={loading} disabled={!otp.trim()}>
            Verifikasi OTP
          </Button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handlePassword} className="space-y-4" noValidate>
          <PasswordInput
            label="Kata sandi baru"
            name="password"
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
            required
          />
          <PasswordInput
            label="Konfirmasi kata sandi"
            name="password_confirm"
            autoComplete="new-password"
            placeholder="Ulangi kata sandi baru"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={fieldErrors.password_confirm}
            disabled={loading}
            required
          />
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={password.length < 6 || password !== passwordConfirm}
          >
            Simpan kata sandi
          </Button>
        </form>
      )}

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke masuk
      </Link>
    </div>
  )
}

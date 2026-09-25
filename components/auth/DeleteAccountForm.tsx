'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { APP_NAME } from '@/lib/config'
import { formatRupiah } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Step = 'username' | 'email' | 'confirm' | 'done'

interface RiwayatCounts {
  jumlah_setoran: number
  jumlah_penjemputan: number
  jumlah_penarikan: number
  jumlah_penukaran_poin: number
  jumlah_pengaduan: number
}

interface CheckResponse {
  username: string
  masked_email: string
  next: string
}

interface RequestOtpResponse {
  username: string
  nama_lengkap: string
  masked_email: string
  saldo: string
  poin: number
  riwayat: RiwayatCounts
  expires_in_seconds: number
}

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

export function DeleteAccountForm() {
  const [step, setStep] = useState<Step>('username')
  const [username, setUsername] = useState('')
  const [account, setAccount] = useState<CheckResponse | null>(null)
  const [accountDetail, setAccountDetail] = useState<RequestOtpResponse | null>(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [acknowledge, setAcknowledge] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
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
      const data = await api.post<CheckResponse>(
        '/auth/delete-account/check/',
        { username: username.trim() },
        { skipAuth: true },
      )
      setAccount(data)
      setInfo(
        'Akun ditemukan. Konfirmasi email yang terdaftar untuk melanjutkan.',
      )
      setStep('email')
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

  async function handleEmail(event: FormEvent) {
    event.preventDefault()
    clearAlerts()
    setLoading(true)
    try {
      const data = await api.post<RequestOtpResponse>(
        '/auth/delete-account/request-otp/',
        { username: username.trim(), email: email.trim() },
        { skipAuth: true },
      )
      setAccountDetail(data)
      setInfo(`Kode OTP telah dikirim ke ${data.masked_email}. Periksa kotak masuk atau folder spam.`)
      setStep('confirm')
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

  async function handleConfirm(event: FormEvent) {
    event.preventDefault()
    clearAlerts()
    setLoading(true)
    try {
      await api.post(
        '/auth/delete-account/confirm/',
        {
          username: username.trim(),
          otp: otp.trim(),
          confirmation_text: confirmationText.trim(),
          acknowledge,
        },
        { skipAuth: true },
      )
      setStep('done')
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(mapFieldErrors(error.errors))
      } else {
        setFormError('Gagal memproses penghapusan akun. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  const canSubmitConfirm =
    otp.trim().length === 6 && acknowledge && confirmationText.trim().length > 0

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="size-7 text-danger" aria-hidden />
        </div>
        <p className="text-sm font-medium text-foreground">
          Permintaan penghapusan akun berhasil diproses.
        </p>
        <p className="text-sm text-muted-foreground">
          Data pribadi Anda telah dihapus dan akun tidak dapat digunakan lagi.
          Terima kasih telah menggunakan {APP_NAME}.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setStep('username')
            setUsername('')
            setAccount(null)
            setAccountDetail(null)
            setEmail('')
            setOtp('')
            setAcknowledge(false)
            setConfirmationText('')
            clearAlerts()
          }}
        >
          Kembali ke halaman utama
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
          <div
            role="alert"
            className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            <strong>Perhatian:</strong> penghapusan akun bersifat permanen dan
            tidak dapat dibatalkan. Data pribadi Anda akan dihapus.
          </div>
          <Input
            label="Nama pengguna (username)"
            name="username"
            autoComplete="username"
            placeholder="Masukkan username akun Anda"
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

      {step === 'email' && account && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-muted p-4 text-sm">
            <p className="font-semibold text-foreground">@{account.username}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Untuk melindungi data Anda, ringkasan akun (nama, saldo, poin,
              riwayat) hanya ditampilkan setelah email yang terdaftar
              dikonfirmasi.
            </p>
          </div>

          <form onSubmit={handleEmail} className="space-y-4" noValidate>
            <p className="text-xs text-muted-foreground">
              Email terdaftar: <strong>{account.masked_email}</strong>
            </p>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full" loading={loading} disabled={!email.trim()}>
              Kirim Kode OTP
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
        </div>
      )}

      {step === 'confirm' && account && accountDetail && (
        <form onSubmit={handleConfirm} className="space-y-4" noValidate>
          <div
            role="alert"
            className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            Anda akan menghapus akun <strong>{accountDetail.nama_lengkap}</strong> (
            @{account.username}) beserta saldo {formatRupiah(accountDetail.saldo)} dan{' '}
            {accountDetail.poin.toLocaleString('id-ID')} poin.
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• {accountDetail.riwayat.jumlah_setoran} transaksi setoran</li>
            <li>• {accountDetail.riwayat.jumlah_penjemputan} penjemputan</li>
            <li>• {accountDetail.riwayat.jumlah_penarikan} penarikan saldo</li>
            <li>• {accountDetail.riwayat.jumlah_penukaran_poin} penukaran poin</li>
            <li>• {accountDetail.riwayat.jumlah_pengaduan} pengaduan</li>
          </ul>

          <Input
            label="Kode OTP dari email"
            name="otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="Masukkan kode 6 digit"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            error={fieldErrors.otp}
            disabled={loading}
            required
          />

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={acknowledge}
              onChange={(e) => setAcknowledge(e.target.checked)}
              disabled={loading}
              className="mt-0.5 size-4 rounded border-border accent-danger"
            />
            <span>
              Saya paham bahwa tindakan ini <strong>permanen</strong> dan tidak
              dapat dibatalkan: data pribadi saya akan dihapus, akun
              dinonaktifkan, dan saya tidak dapat login kembali.
            </span>
          </label>
          {fieldErrors.acknowledge && (
            <p className="text-xs text-danger" role="alert">
              {fieldErrors.acknowledge}
            </p>
          )}

          <Input
            label="Ketik HAPUS AKUN untuk konfirmasi"
            name="confirmation_text"
            autoComplete="off"
            placeholder="HAPUS AKUN"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            error={fieldErrors.confirmation_text}
            disabled={loading}
            required
          />

          <Button
            type="submit"
            variant="danger"
            className="w-full"
            loading={loading}
            disabled={!canSubmitConfirm}
          >
            Hapus Akun Saya
          </Button>
          <button
            type="button"
            className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearAlerts()
              setStep('email')
            }}
          >
            Kembali ke langkah sebelumnya
          </button>
        </form>
      )}

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke beranda
      </Link>
    </div>
  )
}

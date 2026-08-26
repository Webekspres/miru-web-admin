'use client'

import { useMemo, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  APP_DISPLAY_NAME,
  buildDeleteAccountWaUrl,
  buildDeleteRequestMessage,
  FALLBACK_INSTITUTION,
} from '@/lib/delete-account'
import type { InstitutionSettings } from '@/types/models'

type Contact = Pick<InstitutionSettings, 'nama_institusi' | 'kontak' | 'email'>

export function DeleteAccountPage({ settings }: { settings: Contact | null }) {
  const contact = settings ?? FALLBACK_INSTITUTION
  const [nama, setNama] = useState('')
  const [noHp, setNoHp] = useState('')
  const [email, setEmail] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<{ nama?: string; noHp?: string; confirmed?: string }>({})

  const messagePreview = useMemo(
    () => buildDeleteRequestMessage({ nama: nama || '…', noHp: noHp || '…', email }),
    [nama, noHp, email],
  )

  function validate() {
    const next: typeof errors = {}
    if (!nama.trim()) next.nama = 'Nama wajib diisi.'
    if (!noHp.trim()) next.noHp = 'No. HP terdaftar wajib diisi.'
    if (!confirmed) next.confirmed = 'Centang konfirmasi untuk melanjutkan.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const url = buildDeleteAccountWaUrl(contact.kontak, { nama, noHp, email })
    // location.href: andal di mobile (Play audience); window.open sering diblokir.
    window.location.href = url
  }

  async function handleCopy() {
    if (!validate()) return
    const text = buildDeleteRequestMessage({ nama, noHp, email })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-primary">{APP_DISPLAY_NAME}</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Permintaan Penghapusan Akun
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Nasabah dapat meminta penghapusan akun aplikasi MIRU melalui formulir di
          bawah. Permintaan diverifikasi pengelola, lalu akun dinonaktifkan. Target
          proses: <strong className="font-medium text-foreground">7 hari kerja</strong>.
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="langkah-heading">
        <h2 id="langkah-heading" className="text-lg font-semibold text-foreground">
          Langkah permintaan
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Isi formulir dengan nama dan nomor HP yang terdaftar di aplikasi.</li>
          <li>Kirim permintaan lewat WhatsApp ke pengelola MIRU.</li>
          <li>Admin memverifikasi identitas dan memproses penghapusan akun.</li>
          <li>Anda menerima konfirmasi setelah akun dinonaktifkan.</li>
        </ol>
      </section>

      <section className="space-y-3" aria-labelledby="data-hapus-heading">
        <h2 id="data-hapus-heading" className="text-lg font-semibold text-foreground">
          Data yang dihapus / dihapus akses
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Identitas: nama, NIK, nomor HP, alamat, foto KTP</li>
          <li>Kredensial login dan token perangkat</li>
          <li>Saldo dan poin pada akun aktif</li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="data-tahan-heading">
        <h2 id="data-tahan-heading" className="text-lg font-semibold text-foreground">
          Data yang dipertahankan
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Arsip transaksi, setoran, dan penarikan dianonimkan dan disimpan untuk
          kepatuhan selama <strong className="font-medium text-foreground">5 tahun</strong>,
          lalu dihapus atau dianonimkan penuh sesuai kebijakan institusi.
        </p>
      </section>

      <section
        className="rounded-xl border border-border bg-surface-muted/40 p-5 sm:p-6"
        aria-labelledby="form-heading"
      >
        <h2 id="form-heading" className="text-lg font-semibold text-foreground">
          Form permintaan
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kirim ke WhatsApp: {contact.kontak}
          {contact.email ? ` · ${contact.email}` : ''}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <Input
            label="Nama lengkap"
            name="nama"
            autoComplete="name"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            error={errors.nama}
            required
          />
          <Input
            label="No. HP terdaftar"
            name="no_hp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xxxxxxxxxx"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            error={errors.noHp}
            required
          />
          <Input
            label="Email (opsional)"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="flex items-start gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-border"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>Saya meminta penghapusan akun MIRU saya.</span>
          </label>
          {errors.confirmed && (
            <p className="text-xs text-danger" role="alert">
              {errors.confirmed}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="sm:flex-1">
              <MessageCircle className="size-4" aria-hidden />
              Kirim via WhatsApp
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy} className="sm:flex-1">
              {copied ? 'Pesan disalin' : 'Salin template pesan'}
            </Button>
          </div>
        </form>

        <details className="mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            Pratinjau pesan WhatsApp
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-background p-3 font-sans">
            {messagePreview}
          </pre>
        </details>
      </section>

      <details className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-foreground">
          Untuk pengelola (SOP singkat)
        </summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 leading-relaxed">
          <li>Cari nasabah di panel admin berdasarkan nomor HP.</li>
          <li>Tangani saldo / penarikan outstanding (transfer atau catat zero).</li>
          <li>
            Nonaktifkan akun (<code className="text-foreground">is_active = false</code>) —
            jangan hard delete.
          </li>
          <li>
            Scrub PII: anonimkan nama, NIK, no HP, alamat, foto KTP, email; ganti
            username ke <code className="text-foreground">deleted_&lt;id&gt;</code>.
          </li>
          <li>Balas pemohon bahwa permintaan selesai.</li>
        </ol>
      </details>
    </div>
  )
}

import Link from 'next/link'
import type { PrivacyPolicy } from '@/types/models'

export function PrivacyPolicyPage({ policy }: { policy: PrivacyPolicy | null }) {
  if (!policy) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Kebijakan Privasi</h1>
        <p className="text-sm text-muted-foreground">
          Konten kebijakan sementara tidak dapat dimuat dari server. Silakan coba
          lagi nanti, atau hubungi pengelola MIRU.
        </p>
      </div>
    )
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-medium text-primary">{policy.institusi}</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {policy.judul}
        </h1>
        <p className="text-sm text-muted-foreground">
          Versi {policy.versi} · {policy.dasar_hukum}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {policy.ringkasan}
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="data-heading">
        <h2 id="data-heading" className="text-lg font-semibold text-foreground">
          Data yang disimpan
        </h2>
        <ul className="space-y-4">
          {policy.data_yang_disimpan.map((item) => (
            <li
              key={item.kategori}
              className="rounded-xl border border-border bg-surface-muted/30 p-4"
            >
              <h3 className="text-sm font-semibold text-foreground">{item.kategori}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.tujuan}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.field.join(', ')}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2" aria-labelledby="retensi-heading">
        <h2 id="retensi-heading" className="text-lg font-semibold text-foreground">
          Retensi ({policy.retensi.masa_tahun} tahun)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {policy.retensi.keterangan}
        </p>
      </section>

      <section className="space-y-2" aria-labelledby="hak-heading">
        <h2 id="hak-heading" className="text-lg font-semibold text-foreground">
          Hak pengguna
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          {policy.hak_pengguna.map((hak) => (
            <li key={hak}>{hak}</li>
          ))}
          <li>
            Mengajukan penghapusan akun melalui halaman{' '}
            <Link href="/hapus-akun" className="font-medium text-primary hover:underline">
              Hapus Akun
            </Link>
          </li>
        </ul>
      </section>

      {policy.persetujuan_registrasi && (
        <section className="space-y-2" aria-labelledby="persetujuan-heading">
          <h2 id="persetujuan-heading" className="text-lg font-semibold text-foreground">
            Persetujuan registrasi
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {policy.persetujuan_registrasi.keterangan}
          </p>
        </section>
      )}
    </article>
  )
}

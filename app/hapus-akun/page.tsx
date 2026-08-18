import type { Metadata } from 'next'
import { DeleteAccountForm } from '@/components/auth/DeleteAccountForm'
import { PhotoBackdrop } from '@/components/landing/PhotoBackdrop'

export const metadata: Metadata = {
  title: 'Hapus Akun',
  description:
    'Hapus akun MIRU-G Bank Sampah — verifikasi kepemilikan dengan OTP WhatsApp dan konfirmasi mendalam sebelum data pribadi dihapus.',
  openGraph: {
    title: 'Hapus Akun | MIRU-G',
    description:
      'Permintaan penghapusan akun nasabah bank sampah MIRU-G dengan verifikasi OTP WhatsApp.',
  },
}

export default function DeleteAccountPage() {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <PhotoBackdrop src="/landing/hero.webp" overlay="split" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/20 bg-background/95 p-6 shadow-md backdrop-blur sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hapus Akun
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Untuk melindungi akun Anda, kami akan memverifikasi kepemilikan
            melalui OTP WhatsApp dan meminta konfirmasi tertulis sebelum data
            dihapus.
          </p>
          <div className="mt-6">
            <DeleteAccountForm />
          </div>
        </div>
      </div>
    </div>
  )
}

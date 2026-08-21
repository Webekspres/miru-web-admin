import type { Metadata } from 'next'
import { PublicLegalDoc } from '@/components/legal/PublicLegalDoc'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description:
    'Syarat dan Ketentuan (Terms & Conditions) penggunaan aplikasi MIRU-G Bank Sampah Distrik Mimika Baru.',
  openGraph: {
    title: 'Syarat & Ketentuan | MIRU-G',
    description:
      'Syarat dan Ketentuan layanan aplikasi MIRU-G untuk nasabah bank sampah.',
  },
}

export default function TermsPage() {
  return (
    <PublicLegalDoc
      kind="terms"
      apiPath="/terms/"
      heroLabel="Dokumen legal · Play Store"
      heroTitle="Syarat & Ketentuan"
      heroDescription="Ketentuan penggunaan aplikasi MIRU-G: pendaftaran akun, setoran sampah, saldo & poin, penarikan, penjemputan, dan tata cara pengaduan."
      icon="file"
      relatedHref="/privacy-policy"
      relatedLabel="← Lihat Kebijakan Privasi"
    />
  )
}

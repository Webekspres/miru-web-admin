import type { Metadata } from 'next'
import { PublicLegalDoc } from '@/components/legal/PublicLegalDoc'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan Privasi (Privacy Policy) MIRU-G — perlindungan data pribadi nasabah bank sampah Distrik Mimika Baru.',
  openGraph: {
    title: 'Kebijakan Privasi | MIRU-G',
    description:
      'Kebijakan Privasi MIRU-G untuk aplikasi bank sampah resmi Distrik Mimika Baru.',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <PublicLegalDoc
      kind="privacy"
      apiPath="/privacy-policy/"
      heroLabel="Dokumen legal · Play Store"
      heroTitle="Kebijakan Privasi"
      heroDescription="Informasi tentang data yang kami kumpulkan, cara penggunaannya, hak Anda sebagai subjek data, dan keamanan informasi di aplikasi MIRU-G."
      icon="shield"
      relatedHref="/terms"
      relatedLabel="Lihat Syarat & Ketentuan →"
    />
  )
}

import type { Metadata } from 'next'
import { PublicAbout } from '@/components/legal/PublicAbout'

export const metadata: Metadata = {
  title: 'Tentang MIRU',
  description:
    'Tentang MIRU-G Bank Sampah Distrik Mimika Baru — visi, misi, layanan, dan cara kerja bank sampah digital untuk warga.',
  openGraph: {
    title: 'Tentang MIRU | MIRU-G',
    description:
      'MIRU (Mimika Recycle Unit) — aplikasi bank sampah resmi Distrik Mimika Baru.',
  },
}

export default function AboutPage() {
  return <PublicAbout />
}

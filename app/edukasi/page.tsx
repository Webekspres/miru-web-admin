import type { Metadata } from 'next'
import { PublicEducationList } from '@/components/education/PublicEducationList'

export const metadata: Metadata = {
  title: 'Edukasi Sampah',
  description:
    'Panduan pemilahan dan daur ulang sampah untuk warga Distrik Mimika Baru.',
}

export default function PublicEducationPage() {
  return <PublicEducationList />
}

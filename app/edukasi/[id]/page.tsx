import type { Metadata } from 'next'
import { PublicEducationArticle } from '@/components/education/PublicEducationArticle'

export const metadata: Metadata = {
  title: 'Artikel Edukasi',
  description: 'Artikel edukasi pemilahan sampah MIRU-G.',
}

export default function PublicEducationArticlePage() {
  return <PublicEducationArticle />
}

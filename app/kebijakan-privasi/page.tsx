import type { Metadata } from 'next'
import { PrivacyPolicyPage } from '@/components/landing/PrivacyPolicyPage'
import { PublicShell } from '@/components/landing/PublicShell'
import { fetchPublicData } from '@/lib/public-api'
import type { PrivacyPolicy } from '@/types/models'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan data pribadi MIRU Bank Sampah — Distrik Mimika Baru.',
}

export default async function KebijakanPrivasiRoute() {
  const policy = await fetchPublicData<PrivacyPolicy>('/privacy-policy/')

  return (
    <PublicShell active="kebijakan-privasi">
      <PrivacyPolicyPage policy={policy} />
    </PublicShell>
  )
}

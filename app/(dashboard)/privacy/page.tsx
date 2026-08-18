import { MarkdownDocView } from '@/components/settings/MarkdownDocView'

export default function PrivacyPage() {
  return (
    <MarkdownDocView
      title="Kebijakan Data"
      description="Dokumen mobile; versi publik Play Store di /privacy-policy."
      field="kebijakan"
      editHref="/privacy/edit"
    />
  )
}

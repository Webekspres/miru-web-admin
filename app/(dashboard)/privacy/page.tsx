import { MarkdownDocView } from '@/components/settings/MarkdownDocView'

export default function PrivacyPage() {
  return (
    <MarkdownDocView
      title="Kebijakan Data"
      description="Dokumen ini tampil di aplikasi mobile."
      field="kebijakan"
      editHref="/privacy/edit"
    />
  )
}

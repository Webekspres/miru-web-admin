import { MarkdownDocView } from '@/components/settings/MarkdownDocView'

export default function PrivacyPage() {
  return (
    <MarkdownDocView
      title="Kebijakan Privasi"
      description="Konten ini tampil di aplikasi mobile dan halaman publik /privacy-policy."
      field="kebijakan"
      editHref="/privacy/edit"
      publicHref="/privacy-policy"
    />
  )
}

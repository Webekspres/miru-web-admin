import { MarkdownDocView } from '@/components/settings/MarkdownDocView'

export default function TermsAdminPage() {
  return (
    <MarkdownDocView
      title="Syarat & Ketentuan"
      description="Dokumen publik di /terms untuk Play Store dan situs web."
      field="syarat_ketentuan"
      editHref="/syarat-ketentuan/edit"
    />
  )
}

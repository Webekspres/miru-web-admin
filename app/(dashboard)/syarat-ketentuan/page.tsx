import { MarkdownDocView } from '@/components/settings/MarkdownDocView'

export default function TermsAdminPage() {
  return (
    <MarkdownDocView
      title="Syarat & Ketentuan"
      description="Konten halaman publik /terms — dapat diedit admin kapan saja."
      field="syarat_ketentuan"
      editHref="/syarat-ketentuan/edit"
      publicHref="/terms"
    />
  )
}

import { MarkdownDocView } from '@/components/settings/MarkdownDocView'

export default function AboutPage() {
  return (
    <MarkdownDocView
      title="Tentang MIRU"
      description="Dokumen ini tampil di aplikasi mobile."
      field="tentang"
      editHref="/about/edit"
    />
  )
}

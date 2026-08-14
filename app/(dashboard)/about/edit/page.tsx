import { MarkdownDocEdit } from '@/components/settings/MarkdownDocEdit'

export default function AboutEditPage() {
  return (
    <MarkdownDocEdit
      title="Edit tentang MIRU"
      field="tentang"
      backHref="/about"
    />
  )
}

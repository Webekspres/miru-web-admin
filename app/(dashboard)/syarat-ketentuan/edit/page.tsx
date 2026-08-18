import { MarkdownDocEdit } from '@/components/settings/MarkdownDocEdit'

export default function TermsEditPage() {
  return (
    <MarkdownDocEdit
      title="Edit syarat & ketentuan"
      field="syarat_ketentuan"
      backHref="/syarat-ketentuan"
    />
  )
}

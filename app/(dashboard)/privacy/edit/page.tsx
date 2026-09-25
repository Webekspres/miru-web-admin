import { MarkdownDocEdit } from '@/components/settings/MarkdownDocEdit'

export default function PrivacyEditPage() {
  return (
    <MarkdownDocEdit
      title="Edit kebijakan privasi"
      field="kebijakan"
      backHref="/privacy"
    />
  )
}

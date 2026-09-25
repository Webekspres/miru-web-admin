import { use } from 'react'
import { EducationEditClient } from './EducationEditClient'

export default function EducationEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const articleId = parseInt(resolvedParams.id, 10)

  return <EducationEditClient articleId={articleId} />
}

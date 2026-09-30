import { NotificationDetail } from '@/components/notifications/NotificationDetail'

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <NotificationDetail id={Number(id)} />
}

import { StaffEditClient } from '@/components/staff/StaffEditClient'

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <StaffEditClient staffId={Number(id)} />
}

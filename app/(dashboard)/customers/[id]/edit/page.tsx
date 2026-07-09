import { CustomerEditClient } from './CustomerEditClient'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CustomerEditClient customerId={Number(id)} />
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Save } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadContentImage } from '@/lib/media'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { SettingsPageHeader } from '@/components/settings/SettingsPageHeader'
import type { InstitutionSettings } from '@/types/models'

export function MarkdownDocEdit({
  title,
  field,
  backHref,
}: {
  title: string
  field: 'tentang' | 'kebijakan'
  backHref: string
}) {
  const router = useRouter()
  const { role } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const [saving, setSaving] = useState(false)
  const [value, setValue] = useState('')
  const initialized = useRef(false)
  const { data, error, isLoading, mutate } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (data && !initialized.current) {
      setValue(data[field] ?? '')
      initialized.current = true
    }
  }, [data, field])

  useEffect(() => {
    if (role && role !== 'admin') {
      router.replace(backHref)
    }
  }, [role, router, backHref])

  if (role && role !== 'admin') return null

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch('/settings/', { [field]: value })
      await mutate()
      toastSuccess('Dokumen berhasil disimpan.')
      router.push(backHref)
    } catch {
      toastError('Gagal menyimpan dokumen. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <TableSkeleton rows={8} cols={1} />
  if (error) {
    return (
      <ErrorMessage
        title="Gagal memuat data"
        message="Tidak dapat memuat dokumen."
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader title={title} backHref={backHref} />
      <Card className="p-4">
        <RichTextEditor
          id={`md-${field}`}
          label="Konten (Markdown, gambar didukung)"
          value={value}
          onChange={setValue}
          onUploadImage={async (file) => {
            const uploaded = await uploadContentImage(file)
            return uploaded.url
          }}
          rows={18}
        />
        <div className="mt-4">
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            <Save className="size-4" aria-hidden />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

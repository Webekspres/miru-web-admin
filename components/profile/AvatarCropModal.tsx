'use client'

import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { getCroppedFile } from '@/lib/cropImage'

export function AvatarCropModal({
  open,
  imageSrc,
  onClose,
  onConfirm,
}: {
  open: boolean
  imageSrc: string
  onClose: () => void
  onConfirm: (file: File) => Promise<void>
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels)
  }, [])

  async function handleConfirm() {
    if (!area) return
    setSaving(true)
    try {
      const file = await getCroppedFile(imageSrc, area)
      await onConfirm(file)
    } catch {
      // Pesan error sudah ditampilkan pemanggil.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Potong foto profil"
      description="Geser dan zoom hingga wajah pas di dalam lingkaran."
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} loading={saving} disabled={!area || saving}>
            Simpan foto
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </label>
      </div>
    </Modal>
  )
}

export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Gagal memuat gambar.')))
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}

export async function getCroppedFile(
  imageSrc: string,
  pixelCrop: CropArea,
  fileName = 'avatar.jpg',
): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas tidak tersedia.')
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal memotong gambar.'))
          return
        }
        resolve(new File([blob], fileName, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92,
    )
  })
}

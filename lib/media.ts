import { api } from './api'

export type MediaUploadResult = {
  url: string
  key: string
  content_type: string
  size: number
}

export async function uploadEducationImage(file: File): Promise<MediaUploadResult> {
  return uploadPublicImage(file, 'edukasi')
}

export async function uploadAvatarImage(file: File): Promise<MediaUploadResult> {
  return uploadPublicImage(file, 'avatar')
}

export async function uploadContentImage(file: File): Promise<MediaUploadResult> {
  return uploadPublicImage(file, 'konten')
}

async function uploadPublicImage(
  file: File,
  purpose: 'edukasi' | 'avatar' | 'konten',
): Promise<MediaUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', purpose)
  return api.upload<MediaUploadResult>('/media/uploads/', formData)
}

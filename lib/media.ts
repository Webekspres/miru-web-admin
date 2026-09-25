import { api } from './api'
import { API_BASE_URL } from './config'

/** Absolute-kan URL media publik (MinIO/objects atau path relatif). */
export function resolvePublicMediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`
  return url
}

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

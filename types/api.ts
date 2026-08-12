export interface PaginationMeta {
  count: number
  page: number
  page_size: number
  total_pages: number
  next: string | null
  previous: string | null
}

export interface EnvelopeMeta {
  timestamp: string
  request_id: string
  pagination?: PaginationMeta
}

export interface ApiEnvelope<T> {
  success: boolean
  status_code: number
  message: string
  data: T | null
  code?: string
  errors?: Record<string, string[]> | null
  meta: EnvelopeMeta
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface LoginResponse {
  access: string
  refresh: string
  user: {
    id: number
    username: string
    role: string
    nama_lengkap: string
    no_hp?: string
    saldo?: string
    poin?: number
    avatar_url?: string | null
  }
}

export interface RefreshResponse {
  access: string
}

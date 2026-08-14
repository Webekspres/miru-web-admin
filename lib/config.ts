export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const API_PREFIX = `${API_BASE_URL}/api`

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? 'MIRU Bank Sampah'

export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.example.mirumobileapp'

export const API_DEBUG = process.env.NEXT_PUBLIC_API_DEBUG === 'true'

export const AUTH = {
  login: `${API_PREFIX}/auth/login/`,
  refresh: `${API_PREFIX}/auth/refresh/`,
  me: `${API_PREFIX}/auth/me/`,
  forgotPassword: `${API_PREFIX}/auth/forgot-password/`,
  resetPasswordRequestOtp: `${API_PREFIX}/auth/reset-password/request-otp/`,
  resetPasswordVerifyOtp: `${API_PREFIX}/auth/reset-password/verify-otp/`,
  resetPassword: `${API_PREFIX}/auth/reset-password/`,
} as const

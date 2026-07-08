'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ApiError } from '@/lib/api'
import { WebAdminAccessError } from '@/lib/auth'
import { resolvePostLoginPath } from '@/lib/routes'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function mapFieldErrors(
  errors?: Record<string, string[]>,
): Record<string, string> {
  if (!errors) return {}

  const mapped: Record<string, string> = {}
  for (const [key, messages] of Object.entries(errors)) {
    if (messages[0]) mapped[key] = messages[0]
  }
  return mapped
}

export function LoginForm() {
  const { login, status } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isDisabled = loading || status === 'loading'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setLoading(true)

    try {
      const role = await login(username.trim(), password)
      router.replace(resolvePostLoginPath(role, searchParams.get('from')))
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(mapFieldErrors(error.errors))
      } else if (error instanceof WebAdminAccessError) {
        setFormError(error.message)
      } else if (error instanceof Error) {
        setFormError(error.message)
      } else {
        setFormError('Login gagal. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {formError}
        </div>
      )}

      <Input
        label="Nama pengguna"
        name="username"
        autoComplete="username"
        placeholder="Masukkan nama pengguna"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        error={fieldErrors.username}
        disabled={isDisabled}
        required
      />

      <Input
        label="Kata sandi"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Masukkan kata sandi"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        disabled={isDisabled}
        required
      />

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={isDisabled}
      >
        Masuk
      </Button>
    </form>
  )
}

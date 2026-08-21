import { describe, expect, it } from 'vitest'
import { parseEnvelope } from '@/lib/api'
import { ApiError } from '@/types/api'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('parseEnvelope', () => {
  it('returns data on success envelope', async () => {
    const response = jsonResponse({
      success: true,
      status_code: 200,
      message: 'Data berhasil diambil.',
      data: { id: 1, nama_lengkap: 'Budi Santoso' },
      meta: {
        timestamp: '2026-07-07T14:30:00+09:00',
        request_id: 'req_test_1',
      },
    })

    const data = await parseEnvelope<{ id: number; nama_lengkap: string }>(response)

    expect(data).toEqual({ id: 1, nama_lengkap: 'Budi Santoso' })
  })

  it('throws ApiError on error envelope with field errors', async () => {
    const response = jsonResponse(
      {
        success: false,
        status_code: 400,
        message: 'Satu atau lebih field tidak valid.',
        code: 'VALIDATION_ERROR',
        data: null,
        errors: {
          password: ['Password minimal 6 karakter.'],
        },
        meta: {
          timestamp: '2026-07-07T14:30:00+09:00',
          request_id: 'req_test_2',
        },
      },
      400,
    )

    await expect(parseEnvelope(response)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Satu atau lebih field tidak valid.',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      errors: { password: ['Password minimal 6 karakter.'] },
    })

    await expect(parseEnvelope(response)).rejects.toBeInstanceOf(ApiError)
  })

  it('throws ApiError on authentication failure', async () => {
    const response = jsonResponse(
      {
        success: false,
        status_code: 401,
        message: 'Username atau password salah.',
        code: 'AUTHENTICATION_FAILED',
        data: null,
        errors: null,
        meta: {
          timestamp: '2026-07-07T14:30:00+09:00',
          request_id: 'req_test_3',
        },
      },
      401,
    )

    await expect(parseEnvelope(response)).rejects.toMatchObject({
      statusCode: 401,
      code: 'AUTHENTICATION_FAILED',
    })
  })

  it('throws ApiError when response body is not valid JSON', async () => {
    const response = new Response('not-json', { status: 500 })

    await expect(parseEnvelope(response)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Respons server tidak valid.',
      statusCode: 500,
    })
  })
})

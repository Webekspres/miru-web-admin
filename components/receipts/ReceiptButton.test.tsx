import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '@/components/feedback/Toast'
import { ReceiptButton } from '@/components/receipts/ReceiptButton'
import { api, ApiError } from '@/lib/api'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderButton(kind: 'setoran' | 'penarikan', onRowClick = vi.fn()) {
  render(
    <ToastProvider>
      <div onClick={onRowClick}>
        <ReceiptButton kind={kind} id={42} />
      </div>
    </ToastProvider>,
  )
  return onRowClick
}

describe('ReceiptButton', () => {
  it('downloads the deposit receipt without triggering the row click', async () => {
    const download = vi.spyOn(api, 'download').mockResolvedValue()
    const rowClick = renderButton('setoran')

    await userEvent.click(screen.getByRole('button', { name: /Bukti PDF/ }))

    expect(download).toHaveBeenCalledWith('/deposits/42/receipt/', 'bukti_setoran_42.pdf')
    expect(rowClick).not.toHaveBeenCalled()
  })

  it('downloads the withdrawal receipt', async () => {
    const download = vi.spyOn(api, 'download').mockResolvedValue()
    renderButton('penarikan')

    await userEvent.click(screen.getByRole('button', { name: /Tanda terima/ }))

    expect(download).toHaveBeenCalledWith('/withdrawals/42/receipt/', 'tanda_terima_penarikan_42.pdf')
  })

  it('shows the server message when the download fails', async () => {
    vi.spyOn(api, 'download').mockRejectedValue(
      new ApiError('Anda tidak memiliki akses ke bukti setoran ini.', 403),
    )
    renderButton('setoran')

    await userEvent.click(screen.getByRole('button', { name: /Bukti PDF/ }))

    await waitFor(() =>
      expect(screen.getByText('Anda tidak memiliki akses ke bukti setoran ini.')).toBeInTheDocument(),
    )
  })
})

describe('api.download', () => {
  it('saves the PDF blob through a temporary link', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      // Body string, bukan Blob jsdom: Response milik Node butuh blob.stream().
      new Response('%PDF-1.4', { status: 200, headers: { 'Content-Type': 'application/pdf' } }),
    )
    const createUrl = vi.fn(() => 'blob:x')
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: vi.fn() })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await api.download('/deposits/1/receipt/', 'bukti_setoran_1.pdf')

    expect(createUrl).toHaveBeenCalled()
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('turns an error envelope into ApiError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, status_code: 404, message: 'Tidak ditemukan.', code: 'NOT_FOUND', data: null }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(api.download('/deposits/9/receipt/', 'x.pdf')).rejects.toMatchObject({
      message: 'Tidak ditemukan.',
      statusCode: 404,
    })
  })
})

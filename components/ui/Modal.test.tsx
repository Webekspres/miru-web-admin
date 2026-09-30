import { afterEach, describe, expect, it } from 'vitest'
import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

function Form() {
  const [value, setValue] = useState('')
  // onClose inline — fungsi baru setiap render, seperti di semua pemanggil.
  return (
    <Modal open onClose={() => {}} title="Tolak">
      <label htmlFor="alasan">Alasan</label>
      <input id="alasan" value={value} onChange={(e) => setValue(e.target.value)} />
    </Modal>
  )
}

describe('Modal', () => {
  afterEach(cleanup)

  it('keeps focus in the input while typing', async () => {
    const user = userEvent.setup()
    render(<Form />)
    const input = screen.getByLabelText('Alasan')
    await user.click(input)
    await user.type(input, 'Stok habis')
    expect(document.activeElement).toBe(input)
    expect((input as HTMLInputElement).value).toBe('Stok habis')
  })
})

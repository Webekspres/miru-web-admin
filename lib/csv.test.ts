import { describe, expect, it } from 'vitest'
import { csvCell, csvRow } from '@/lib/csv'
import { canExportContactData } from '@/lib/permissions'
import { customersToCsv } from '@/components/customers/CustomerList'

describe('csvCell', () => {
  it('quotes and escapes values', () => {
    expect(csvCell('Budi "Santoso"')).toBe('"Budi ""Santoso"""')
    expect(csvCell(null)).toBe('')
    expect(csvCell(12)).toBe('"12"')
  })

  it('neutralises spreadsheet formulas', () => {
    expect(csvCell('=HYPERLINK("http://x")')).toBe('"\'=HYPERLINK(""http://x"")"')
    expect(csvCell('+62812')).toBe('"\'+62812"')
    expect(csvCell('@SUM(A1)')).toBe('"\'@SUM(A1)"')
    expect(csvRow(['a', '-1'])).toBe('"a","\'-1"')
  })
})

describe('customer export columns', () => {
  const rows = [{
    id: 1, nama_lengkap: 'Budi', no_hp: '0812', alamat: 'Jl. A', kelurahan_nama: 'Kwamki',
    rt: '01', rw: '02', saldo: '1000', poin: 5, is_active: true,
  }] as unknown as Parameters<typeof customersToCsv>[0]

  it('includes contact columns for operational roles only', () => {
    expect(canExportContactData('admin')).toBe(true)
    expect(canExportContactData('petugas')).toBe(true)
    expect(canExportContactData('koordinator')).toBe(false)
    expect(canExportContactData('pemerintah')).toBe(false)
  })

  it('drops No. HP, alamat, RT and RW without contact access', () => {
    const [header, row] = customersToCsv(rows, false).split('\n')
    expect(header).toBe('"ID","Nama Lengkap","Kelurahan","Saldo","Poin","Status"')
    expect(row).not.toContain('0812')
    expect(row).not.toContain('Jl. A')

    expect(customersToCsv(rows, true).split('\n')[0]).toContain('"No. HP","Alamat"')
  })
})

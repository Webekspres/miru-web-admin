'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api, ApiError } from '@/lib/api'
import { formatRupiah, formatWeightKg } from '@/lib/format'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { Search, Plus, Trash2, User as UserIcon, Package, Scale, Calculator, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react'
import type { User, WasteCategory } from '@/types/models'

// ─── Types ───────────────────────────────────────────────────────

interface NasabahOption {
  id: number
  nama_lengkap: string
  no_hp?: string
  alamat?: string
}

interface DetailRow {
  id: string
  kategori: number | ''
  kategori_nama: string
  berat_kg: string
  harga_per_kg: number
  subtotal: number
}

// ─── Constants ────────────────────────────────────────────────────

const MIN_BERAT_KG = 1
const EMPTY_DETAIL_ROW: Omit<DetailRow, 'id'> = {
  kategori: '',
  kategori_nama: '',
  berat_kg: '',
  harga_per_kg: 0,
  subtotal: 0,
}

// ─── Helpers ──────────────────────────────────────────────────────

function parseNumber(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return Number.isFinite(num) ? num : 0
}

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
}

// ─── Nasabah Search Combobox ─────────────────────────────────────

function NasabahSearch({
  onSelect,
  selectedName,
  error,
}: {
  onSelect: (nasabah: NasabahOption) => void
  selectedName: string
  error?: string
}) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Debounce search query (300ms)
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const shouldSearch = debouncedQuery.length >= 1
  const { data, error: searchError, isLoading } = useSWR(
    shouldSearch ? `/users/?role=nasabah&search=${encodeURIComponent(debouncedQuery)}` : null,
    (path) => api.get<User[]>(path),
    { revalidateOnFocus: false },
  )

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIdx(-1)
  }, [data])

  const results: NasabahOption[] = (data ?? [])
    .filter((u) => u.is_active)
    .map((u) => ({
      id: u.id,
      nama_lengkap: u.nama_lengkap,
      no_hp: u.no_hp,
      alamat: u.alamat,
    }))

  function handleSelect(nasabah: NasabahOption) {
    onSelect(nasabah)
    setQuery('')
    setDebouncedQuery('')
    setOpen(false)
    setHighlightedIdx(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && highlightedIdx >= 0) {
      e.preventDefault()
      handleSelect(results[highlightedIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIdx >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIdx] as HTMLElement
      item?.scrollIntoView?.({ block: 'nearest' })
    }
  }, [highlightedIdx])

  return (
    <div className="relative">
      <label className="text-sm font-medium text-foreground">
        Nasabah <span className="text-danger">*</span>
      </label>

      {selectedName ? (
        <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
          <UserIcon className="size-5 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{selectedName}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect({ id: 0, nama_lengkap: '' })
              inputRef.current?.focus()
            }}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            aria-label="Ganti nasabah"
          >
            <span className="text-xs">Ganti</span>
          </button>
        </div>
      ) : (
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay blur to allow click on list items
              setTimeout(() => setOpen(false), 200)
            }}
            placeholder="Cari nasabah berdasarkan nama atau No. HP..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
            aria-label="Cari nasabah"
            aria-expanded={open}
            aria-autocomplete="list"
            role="combobox"
          />
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-danger" role="alert">{error}</p>
      )}

      {/* Dropdown Results */}
      {open && !selectedName && query.length >= 1 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
          {isLoading && (
            <div className="p-3">
              <LoadingSkeleton lines={3} />
            </div>
          )}

          {searchError && (
            <p className="p-3 text-sm text-danger">Gagal mencari nasabah.</p>
          )}

          {!isLoading && !searchError && results.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">
              {debouncedQuery.length >= 1
                ? 'Nasabah tidak ditemukan.'
                : 'Ketik minimal 1 karakter untuk mencari.'}
            </p>
          )}

          {!isLoading && results.length > 0 && (
            <ul ref={listRef} className="max-h-60 overflow-y-auto py-1" role="listbox">
              {results.map((nasabah, idx) => (
                <li
                  key={nasabah.id}
                  role="option"
                  aria-selected={highlightedIdx === idx}
                  onMouseDown={() => handleSelect(nasabah)}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    highlightedIdx === idx
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-surface-muted'
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
                    <UserIcon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{nasabah.nama_lengkap}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {nasabah.no_hp ?? '—'}
                      {nasabah.alamat ? ` · ${nasabah.alamat}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Nasabah QR / ID Search ──────────────────────────────────────

function NasabahQrInput({
  onSelect,
  selectedName,
  error,
}: {
  onSelect: (nasabah: NasabahOption) => void
  selectedName: string
  error?: string
}) {
  const [idInput, setIdInput] = useState('')
  const [searchResult, setSearchResult] = useState<NasabahOption | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    const trimmed = idInput.trim()
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setSearchError('Masukkan ID nasabah yang valid (angka).')
      return
    }

    setLoading(true)
    setSearchError(null)
    setSearchResult(null)
    setSearched(true)

    try {
      const user = await api.get<User>(`/users/${trimmed}/`)
      if (user.role !== 'nasabah') {
        setSearchError('ID tersebut bukan milik nasabah.')
        return
      }
      if (!user.is_active) {
        setSearchError('Nasabah dengan ID tersebut tidak aktif.')
        return
      }
      setSearchResult({
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        no_hp: user.no_hp,
        alamat: user.alamat,
      })
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setSearchError('Nasabah dengan ID tersebut tidak ditemukan.')
      } else if (err instanceof ApiError) {
        setSearchError(err.message)
      } else {
        setSearchError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSelectResult() {
    if (searchResult) {
      onSelect(searchResult)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  // Already selected — show summary
  if (selectedName) {
    return (
      <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
        <QrCode className="size-5 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{selectedName}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect({ id: 0, nama_lengkap: '' })
            setIdInput('')
            setSearchResult(null)
            setSearched(false)
          }}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label="Ganti nasabah"
        >
          <span className="text-xs">Ganti</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* ID Input + Search Button */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="ID Nasabah"
            type="text"
            inputMode="numeric"
            placeholder="Masukkan ID nasabah dari scan QR..."
            value={idInput}
            onChange={(e) => {
              setIdInput(e.target.value)
              if (searched) {
                setSearchResult(null)
                setSearchError(null)
                setSearched(false)
              }
            }}
            onKeyDown={handleKeyDown}
            error={searchError ?? error}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={handleSearch}
          loading={loading}
          disabled={loading}
          className="mb-0.5 shrink-0"
        >
          <Search className="size-4" aria-hidden />
          Cari
        </Button>
      </div>

      {/* Search Result — found */}
      {searchResult && !loading && (
        <div className="rounded-lg border border-success/30 bg-success/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                <UserIcon className="size-5 text-success" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{searchResult.nama_lengkap}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {searchResult.id}
                  {searchResult.no_hp ? ` · ${searchResult.no_hp}` : ''}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSelectResult}
              className="shrink-0"
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Pilih
            </Button>
          </div>
        </div>
      )}

      {/* Not found / hint */}
      {searched && !searchResult && !loading && !searchError && (
        <p className="text-sm text-muted-foreground">
          Nasabah tidak ditemukan. Coba cari menggunakan nama atau nomor HP.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        <QrCode className="mr-1 inline size-3" aria-hidden />
        Masukkan ID nasabah dari QR code. Fitur scan kamera akan tersedia kemudian.
      </p>
    </div>
  )
}

// ─── Detail Row ───────────────────────────────────────────────────

function DetailRowInput({
  row,
  categories,
  onUpdate,
  onRemove,
  canRemove,
  error,
}: {
  row: DetailRow
  categories: WasteCategory[]
  onUpdate: (id: string, field: keyof DetailRow, value: string | number) => void
  onRemove: (id: string) => void
  canRemove: boolean
  error?: Record<string, string>
}) {
  const options = categories.map((cat) => ({
    value: String(cat.id),
    label: `${cat.nama} (${formatRupiah(cat.harga_beli_per_kg)}/kg)`,
  }))

  function handleKategoriChange(value: string) {
    const catId = value ? Number(value) : ''
    const cat = categories.find((c) => c.id === catId)
    const harga = cat ? parseNumber(cat.harga_beli_per_kg) : 0
    const berat = parseNumber(row.berat_kg)
    const subtotal = harga * berat

    onUpdate(row.id, 'kategori', catId)
    onUpdate(row.id, 'kategori_nama', cat?.nama ?? '')
    onUpdate(row.id, 'harga_per_kg', harga)
    onUpdate(row.id, 'subtotal', subtotal)
  }

  function handleBeratChange(value: string) {
    // Allow empty or valid decimal
    if (value !== '' && !/^\d*[.,]?\d*$/.test(value)) return

    const normalized = value.replace(',', '.')
    const berat = parseNumber(normalized)
    const harga = row.harga_per_kg
    const subtotal = harga * berat

    onUpdate(row.id, 'berat_kg', normalized)
    onUpdate(row.id, 'subtotal', subtotal)
  }

  const beratError = error?.berat_kg ?? error?.berat

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface-muted/20 p-3">
      {/* Kategori */}
      <div className="min-w-0 flex-1 basis-[200px]">
        <Select
          label="Jenis Sampah"
          placeholder="Pilih kategori..."
          options={options}
          value={row.kategori !== '' ? String(row.kategori) : ''}
          onChange={(e) => handleKategoriChange(e.target.value)}
          error={error?.kategori}
        />
      </div>

      {/* Berat */}
      <div className="w-[140px] shrink-0">
        <Input
          label="Berat (kg)"
          type="text"
          inputMode="decimal"
          placeholder="Min 1 kg"
          value={row.berat_kg}
          onChange={(e) => handleBeratChange(e.target.value)}
          error={beratError}
        />
      </div>

      {/* Harga (read-only) */}
      <div className="w-[130px] shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Harga/kg</span>
          <div className="flex h-10 items-center rounded-lg border border-border bg-surface-muted px-3 text-sm text-muted-foreground">
            {row.harga_per_kg > 0 ? formatRupiah(row.harga_per_kg) : '—'}
          </div>
        </div>
      </div>

      {/* Subtotal (read-only) */}
      <div className="w-[130px] shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Subtotal</span>
          <div className="flex h-10 items-center rounded-lg border border-border bg-surface-muted px-3 text-sm font-semibold text-foreground">
            {row.subtotal > 0 ? formatRupiah(row.subtotal) : '—'}
          </div>
        </div>
      </div>

      {/* Hapus */}
      <div className="flex shrink-0 items-end pb-0.5">
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          disabled={!canRemove}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Hapus baris ${row.kategori_nama || ''}`.trim()}
          title="Hapus baris"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────

export function DepositForm() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()

  // ── Data ──
  const {
    data: categories,
    error: catError,
    isLoading: catLoading,
    mutate: reloadCategories,
  } = useSWR('/waste-categories/', (path) => api.get<WasteCategory[]>(path), {
    revalidateOnFocus: false,
  })

  // ── Form state ──
  const [nasabahId, setNasabahId] = useState<number | null>(null)
  const [nasabahNama, setNasabahNama] = useState('')
  const [searchMode, setSearchMode] = useState<'name' | 'qr'>('name')
  const [details, setDetails] = useState<DetailRow[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── Derived values ──
  const total = details.reduce((sum, row) => sum + row.subtotal, 0)
  const validCategories = categories ?? []

  // ── Actions ──
  function handleSelectNasabah(nasabah: NasabahOption) {
    if (nasabah.id === 0) {
      setNasabahId(null)
      setNasabahNama('')
    } else {
      setNasabahId(nasabah.id)
      setNasabahNama(nasabah.nama_lengkap)
    }
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.nasabah
      return next
    })
  }

  function addRow() {
    setDetails((prev) => [
      ...prev,
      { id: generateId(), ...EMPTY_DETAIL_ROW },
    ])
  }

  function updateRow(id: string, field: keyof DetailRow, value: string | number) {
    setDetails((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value as never } : row)),
    )
    // Clear error for this row
    setRowErrors((prev) => {
      const next = { ...prev }
      const idx = details.findIndex((r) => r.id === id)
      if (idx >= 0 && next[idx]) {
        const rowErr = { ...next[idx] }
        delete rowErr[field === 'kategori' ? 'kategori' : 'berat_kg']
        delete rowErr[field === 'kategori' ? 'kategori' : 'berat']
        if (Object.keys(rowErr).length === 0) delete next[idx]
        else next[idx] = rowErr
      }
      return next
    })
  }

  function removeRow(id: string) {
    setDetails((prev) => prev.filter((row) => row.id !== id))
  }

  // ── Validation ──
  function validate(): boolean {
    const errs: Record<string, string> = {}
    const rowErrs: Record<number, Record<string, string>> = {}
    let valid = true

    if (!nasabahId) {
      errs.nasabah = 'Pilih nasabah terlebih dahulu.'
      valid = false
    }

    if (details.length === 0) {
      errs.details = 'Tambahkan minimal satu jenis sampah.'
      valid = false
    }

    details.forEach((row, idx) => {
      const rowErr: Record<string, string> = {}

      if (row.kategori === '' || row.kategori === 0) {
        rowErr.kategori = 'Pilih jenis sampah.'
        valid = false
      }

      const berat = parseNumber(row.berat_kg)
      if (!row.berat_kg || berat < MIN_BERAT_KG) {
        rowErr.berat_kg = `Minimal ${formatWeightKg(MIN_BERAT_KG)}.`
        valid = false
      }

      if (Object.keys(rowErr).length > 0) {
        rowErrs[idx] = rowErr
      }
    })

    setFieldErrors(errs)
    setRowErrors(rowErrs)
    return valid
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!validate()) return

    setSubmitting(true)
    setShowConfirm(false)

    const payload = {
      nasabah: nasabahId,
      details: details
        .filter((row) => row.kategori !== '' && parseNumber(row.berat_kg) >= MIN_BERAT_KG)
        .map((row) => ({
          kategori: Number(row.kategori),
          berat_kg: parseNumber(row.berat_kg),
        })),
    }

    try {
      await api.post('/deposits/', payload)
      toastSuccess('Setoran berhasil disimpan!')
      router.push('/transactions')
    } catch (err) {
      if (err instanceof ApiError) {
        // Map field errors from API envelope
        if (err.errors) {
          const apiErrs: Record<string, string> = {}
          const apiRowErrs: Record<number, Record<string, string>> = {}

          for (const [field, messages] of Object.entries(err.errors)) {
            const msg = messages.join(', ')

            if (field === 'nasabah') {
              apiErrs.nasabah = msg
            } else if (field === 'details' || field === 'non_field_errors') {
              apiErrs.details = msg
            } else if (field.startsWith('details[') || field.startsWith('details.')) {
              // Parse index from field name like "details[0].kategori" or "details.0.berat_kg"
              const match = field.match(/details[\[.](\d+)[\].](\w+)/)
              if (match) {
                const idx = Number(match[1])
                const subField = match[2]
                if (!apiRowErrs[idx]) apiRowErrs[idx] = {}
                apiRowErrs[idx][subField] = msg
              }
            } else {
              // Unknown field - show as general error
              apiErrs._general = msg
            }
          }

          setFieldErrors(apiErrs)
          setRowErrors((prev) => ({ ...prev, ...apiRowErrs }))
        } else {
          setFieldErrors({ _general: err.message })
        }
        // Additional toast for general error
        if (!err.errors) {
          toastError(err.message || 'Gagal menyimpan setoran.')
        } else {
          toastError('Periksa kembali isian form.')
        }
      } else {
        toastError('Terjadi kesalahan. Silakan coba lagi.')
      }
      setSubmitting(false)
    }
  }

  // ── Initial row on mount ──
  useEffect(() => {
    if (details.length === 0) {
      addRow()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Loading state ──
  if (catLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Input Setoran</CardTitle>
          <CardDescription>Memuat data kategori sampah...</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={6} />
        </CardContent>
      </Card>
    )
  }

  // ── Error state ──
  if (catError) {
    return (
      <ErrorMessage
        title="Gagal memuat data"
        message="Tidak dapat memuat data kategori sampah. Periksa koneksi ke server."
        onRetry={() => reloadCategories()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Input Setoran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat setoran sampah nasabah. Setiap setoran minimal 1 kg per jenis sampah.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" aria-hidden />
            Form Setoran
          </CardTitle>
          <CardDescription>
            Pilih nasabah, lalu masukkan detail sampah yang disetorkan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Nasabah Search — Toggle: Name/Phone or QR/ID */}
          <div className="space-y-3">
            {/* Mode Toggle */}
            {!nasabahNama && (
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setSearchMode('name')}
                  className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    searchMode === 'name'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                  }`}
                >
                  <Search className="size-4" aria-hidden />
                  Cari Nama/HP
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('qr')}
                  className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    searchMode === 'qr'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                  }`}
                >
                  <QrCode className="size-4" aria-hidden />
                  Scan QR/ID
                </button>
              </div>
            )}

            {/* Search Component by Mode */}
            {searchMode === 'name' ? (
              <NasabahSearch
                onSelect={handleSelectNasabah}
                selectedName={nasabahNama}
                error={fieldErrors.nasabah}
              />
            ) : (
              <NasabahQrInput
                onSelect={handleSelectNasabah}
                selectedName={nasabahNama}
                error={fieldErrors.nasabah}
              />
            )}
          </div>

          {/* Detail Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Detail Setoran
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (min. {formatWeightKg(MIN_BERAT_KG)} per jenis)
                </span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                disabled={details.length >= (validCategories?.length ?? 0)}
              >
                <Plus className="size-4" aria-hidden />
                Tambah Baris
              </Button>
            </div>

            {fieldErrors.details && (
              <p className="text-xs text-danger" role="alert">
                {fieldErrors.details}
              </p>
            )}

            {details.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
                <Scale className="mb-2 size-8 text-muted-foreground/50" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  Belum ada detail setoran. Klik &quot;Tambah Baris&quot; untuk memulai.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {details.map((row, idx) => (
                  <DetailRowInput
                    key={row.id}
                    row={row}
                    categories={validCategories}
                    onUpdate={updateRow}
                    onRemove={removeRow}
                    canRemove={details.length > 1}
                    error={rowErrors[idx]}
                  />
                ))}
              </div>
            )}

            {/* Tips */}
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 inline size-3 text-warning" aria-hidden />
              Pastikan berat yang dimasukkan sudah sesuai hasil timbangan.
            </p>
          </div>
        </CardContent>

        {/* Footer with Total & Submit */}
        <CardFooter className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-muted-foreground">Total Nilai Setoran:</span>
            <span className="text-2xl font-bold text-primary">
              {total > 0 ? formatRupiah(total) : 'Rp0,00'}
            </span>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/transactions')}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (validate()) {
                  setShowConfirm(true)
                }
              }}
              loading={submitting}
              disabled={submitting}
              className="min-w-[160px]"
            >
              <Calculator className="size-4" aria-hidden />
              Simpan Setoran
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Konfirmasi Setoran"
        description="Pastikan data setoran sudah benar sebelum disimpan."
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={submitting}
            >
              Kembali
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Ya, Simpan Setoran
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Nasabah Info */}
          <div className="rounded-lg bg-surface-muted p-3">
            <p className="text-xs text-muted-foreground">Nasabah</p>
            <p className="font-medium text-foreground">{nasabahNama}</p>
          </div>

          {/* Detail Summary */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Sampah</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Harga/kg</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details
                .filter((row) => row.kategori !== '' && parseNumber(row.berat_kg) > 0)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.kategori_nama || `Kategori #${row.kategori}`}</TableCell>
                    <TableCell>{formatWeightKg(row.berat_kg)}</TableCell>
                    <TableCell>{formatRupiah(row.harga_per_kg)}</TableCell>
                    <TableCell className="font-semibold">{formatRupiah(row.subtotal)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Total */}
          <div className="flex justify-between rounded-lg bg-primary/5 p-3">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">{formatRupiah(total)}</span>
          </div>

          {fieldErrors._general && (
            <p className="text-sm text-danger" role="alert">
              {fieldErrors._general}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}

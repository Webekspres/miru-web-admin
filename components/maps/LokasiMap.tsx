'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap } from 'leaflet'

export interface MapPoint {
  id: number | string
  lat: number
  lng: number
  /** Baris pertama popup (mis. nama nasabah). */
  title: string
  /** Baris tambahan popup (alamat, jadwal, status). */
  lines?: string[]
  /** Warna penanda (CSS color). */
  color?: string
}

/** Pusat default: Timika, Distrik Mimika Baru. */
export const TIMIKA_CENTER: [number, number] = [-4.5467, 136.8833]

/** Kotak kasar sekitar Timika (sama dengan backend `PETA.batas`). */
export function dalamAreaMimika(lat: number, lng: number): boolean {
  return lat >= -4.7 && lat <= -4.25 && lng >= 136.65 && lng <= 137.05
}

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'

export function osmLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

/**
 * Peta OpenStreetMap (Leaflet) tanpa API key. Satu titik → zoom ke titik;
 * banyak titik → peta menyesuaikan agar semua terlihat.
 *
 * Zoom: Ctrl/⌘ + scroll (atau pinch trackpad) saat kursor di atas peta.
 * Scroll biasa tetap menggulir halaman dan memunculkan petunjuk.
 */
export function LokasiMap({
  points,
  height = 320,
  zoom = 16,
  className = '',
}: {
  points: MapPoint[]
  height?: number
  zoom?: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    // Fase capture: hentikan scroll tanpa Ctrl sebelum sampai ke handler zoom Leaflet.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setShowHint(false)
        return
      }
      e.stopPropagation()
      setShowHint(true)
      clearTimeout(timer)
      timer = setTimeout(() => setShowHint(false), 1200)
    }
    el.addEventListener('wheel', onWheel, { capture: true })
    return () => {
      el.removeEventListener('wheel', onWheel, { capture: true })
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null

    import('leaflet').then(({ default: L }) => {
      if (cancelled || !containerRef.current) return
      map = L.map(containerRef.current, { scrollWheelZoom: true, wheelPxPerZoomLevel: 90 })
      mapRef.current = map
      L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map)

      const layer = L.featureGroup().addTo(map)
      for (const p of points) {
        const color = p.color ?? '#16a34a'
        const popup = [
          `<strong>${escapeHtml(p.title)}</strong>`,
          ...(p.lines ?? []).map(escapeHtml),
          `<a href="${osmLink(p.lat, p.lng)}" target="_blank" rel="noopener noreferrer">Buka di OpenStreetMap</a>`,
        ].join('<br/>')
        L.circleMarker([p.lat, p.lng], {
          radius: 9,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.95,
        })
          .bindPopup(popup)
          .addTo(layer)
      }

      if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], zoom)
      } else if (points.length > 1) {
        map.fitBounds(layer.getBounds(), { padding: [32, 32], maxZoom: zoom })
      } else {
        map.setView(TIMIKA_CENTER, 13)
      }
    })

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
  }, [points, zoom])

  return (
    <div className={`relative z-0 w-full ${className}`} style={{ height }}>
      <div
        ref={containerRef}
        role="region"
        aria-label="Peta lokasi. Tahan Ctrl lalu scroll untuk memperbesar atau memperkecil."
        className="h-full w-full overflow-hidden rounded-lg border border-border"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center rounded-lg bg-black/45 text-sm font-medium text-white transition-opacity duration-200 ${
          showHint ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Tahan Ctrl (⌘ di Mac) lalu scroll untuk zoom peta
      </div>
    </div>
  )
}

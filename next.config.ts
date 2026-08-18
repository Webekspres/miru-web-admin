import type { NextConfig } from 'next'

/** Hostname API untuk gambar MinIO (/objects/...) di next/image. */
function remoteImagePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/objects/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/objects/**' },
    { protocol: 'https', hostname: 'api.dev.mirubanksampah.id', pathname: '/objects/**' },
    { protocol: 'https', hostname: 'api.mirubanksampah.id', pathname: '/objects/**' },
  ]

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl)
      const protocol = parsed.protocol.replace(':', '') as 'http' | 'https'
      if (
        parsed.hostname &&
        !patterns.some((p) => p.hostname === parsed.hostname)
      ) {
        patterns.push({
          protocol,
          hostname: parsed.hostname,
          ...(parsed.port ? { port: parsed.port } : {}),
          pathname: '/objects/**',
        })
      }
    } catch {
      // URL build-time tidak valid — pola default di atas tetap dipakai
    }
  }

  return patterns
}

const nextConfig: NextConfig = {
  // Pin root so Turbopack finds next/ when multiple lockfiles confuse inference.
  // NB: next.config.ts di-load sebagai ES module, jadi __dirname tidak tersedia —
  // gunakan import.meta.dirname (Node 20.11+ / Bun).
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: remoteImagePatterns(),
  },
}

export default nextConfig

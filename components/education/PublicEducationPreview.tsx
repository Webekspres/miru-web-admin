'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRight, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { excerptMarkdown } from '@/lib/education'
import { resolvePublicMediaUrl } from '@/lib/media'
import type { KontenEdukasiPublic } from '@/types/models'

export function PublicEducationPreview() {
  const { data: items } = useSWR(
    ['public-edukasi', 'preview'],
    () =>
      api.get<KontenEdukasiPublic[]>(
        '/edukasi/',
        { page_size: '4' },
        { skipAuth: true },
      ),
    { revalidateOnFocus: false },
  )

  const list = items ?? []

  return (
    <section id="edukasi" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
              Modul edukasi sampah
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Panduan Pemilahan untuk Warga
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Artikel dan sosialisasi pemilahan sampah — terbuka untuk publik, dikelola
              dari panel administrasi.
            </p>
          </div>
          <Link
            href="/edukasi"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-500"
          >
            Semua artikel
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {list.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((item, idx) => {
              const image = resolvePublicMediaUrl(item.gambar_url)
              return (
                <Link
                  key={item.id}
                  href={`/edukasi/${item.id}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-[0_18px_50px_-32px_rgba(6,78,59,0.55)] ring-1 ring-emerald-900/5 transition hover:-translate-y-0.5 motion-safe:animate-fade-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-emerald-50">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt=""
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-emerald-700">
                        <BookOpen className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {item.kategori_terkait_nama ? (
                      <p className="text-[11px] font-bold tracking-wide text-emerald-700 uppercase">
                        {item.kategori_terkait_nama}
                      </p>
                    ) : null}
                    <h3 className="mt-1 line-clamp-2 text-sm font-extrabold text-foreground">
                      {item.judul}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {excerptMarkdown(item.isi, 90)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-xl bg-emerald-50 px-6 py-10 text-center">
            <BookOpen className="mx-auto size-8 text-emerald-700" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Artikel edukasi akan tampil di sini setelah diterbitkan.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sementara itu, pelajari alur setoran dan kategori sampah di halaman ini.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

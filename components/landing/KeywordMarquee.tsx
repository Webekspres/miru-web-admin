const KEYWORDS = [
  'Edukasi',
  'Pemilahan',
  'Daur Ulang',
  'Setoran Digital',
  'Penjemputan',
  'Penimbangan',
  'Tabungan Sampah',
  'Laporan Distrik',
] as const

export function KeywordMarquee() {
  const copies = [0, 1]

  return (
    <div className="overflow-hidden bg-emerald-950 py-3">
      <div className="flex w-max motion-safe:animate-marquee-x">
        {copies.map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-8 px-8"
            aria-hidden={copy === 1}
          >
            {KEYWORDS.map((word) => (
              <span
                key={`${copy}-${word}`}
                className="flex items-center gap-8 text-xs font-bold tracking-[0.22em] text-emerald-50/90 uppercase"
              >
                {word}
                <span className="size-1.5 rounded-full bg-emerald-400" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

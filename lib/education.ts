/** Potong Markdown menjadi cuplikan teks polos untuk kartu/daftar. */
export function excerptMarkdown(isi: string, max = 120): string {
  const plain = isi
    .replace(/[#*_`>~\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= max) return plain
  return `${plain.slice(0, max).trimEnd()}…`
}

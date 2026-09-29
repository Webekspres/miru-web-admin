/**
 * Sel CSV yang aman: dikutip, dan diawali `'` bila dimulai karakter rumus
 * (= + - @ tab CR) agar Excel/Sheets tidak mengeksekusinya (CSV injection).
 */
export function csvCell(value: unknown): string {
  if (value == null) return ''
  let text = String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(',')
}

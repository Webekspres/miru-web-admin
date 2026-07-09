export interface ModulePlaceholderProps {
  title: string
  description?: string
}

export function ModulePlaceholder({
  title,
  description = 'Halaman ini akan diimplementasikan pada fase berikutnya.',
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

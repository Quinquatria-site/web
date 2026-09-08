export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="border-b border-line px-5 pt-8 pb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
    </header>
  )
}

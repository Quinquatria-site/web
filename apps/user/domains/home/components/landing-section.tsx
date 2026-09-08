export function LandingSection() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Quinquatria</h1>
        <p className="text-sm leading-6 text-pretty text-ink-muted">
          에타와 인스타에 흩어진 축제 안내를
          <br />한 곳에 모았습니다.
        </p>
      </div>
      <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted">
        [축제 기간]
      </span>
    </div>
  )
}

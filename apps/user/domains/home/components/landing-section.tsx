import { LanguageSwitcher } from '@/components/language-switcher'

export function LandingSection() {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="relative flex h-full flex-col">
        {/* 히어로 문구 흐름을 밀지 않도록 띄워 둔다 */}
        <div
          className="absolute right-5 z-20"
          style={{ top: 'calc(16px + env(safe-area-inset-top))' }}
        >
          <LanguageSwitcher />
        </div>
        <div className="flex flex-col items-center px-8 pt-20 text-center text-ink">
          <p className="font-display text-[13px] leading-5 font-medium tracking-[0.24em]">
            2026 QUINQUATRIA
          </p>
          <h1 className="font-display mt-3 text-[52px] leading-[1.1] tracking-[0.08em]">
            TWILIGHT
          </h1>
          <p className="font-display mt-4 text-[17px] leading-[1.55] tracking-[0.06em]">
            WHERE LIGHT FADES,
            <br />
            LEGENDS RISE.
          </p>
          <p className="font-display mt-4 text-[15px] leading-5 tracking-[0.1em] text-ink-muted">
            10.05 - 10.06
          </p>
        </div>
      </div>
    </div>
  )
}

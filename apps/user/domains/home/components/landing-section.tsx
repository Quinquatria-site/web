import Image from 'next/image'
import { LanguageSwitcher } from '@/components/language-switcher'

export function LandingSection() {
  return (
    <div className="relative h-full overflow-hidden">
      <Image
        src="/back.png"
        alt=""
        fill
        priority
        sizes="430px"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--color-hero-shade) 62%, transparent) 0%, color-mix(in srgb, var(--color-hero-shade) 38%, transparent) 26%, transparent 52%)',
        }}
      />
      {/* 아래쪽을 눌러 하단 dock 버튼이 사진에 묻히지 않게 한다 */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-hero-shade) 34%, transparent) 44%, color-mix(in srgb, var(--color-hero-shade) 62%, transparent) 100%)',
        }}
      />
      <div className="relative flex h-full flex-col">
        {/* 히어로 문구 흐름을 밀지 않도록 띄워 둔다 */}
        <div
          className="absolute right-5 z-20"
          style={{ top: 'calc(16px + env(safe-area-inset-top))' }}
        >
          <LanguageSwitcher />
        </div>
        <div className="flex flex-col items-center px-8 pt-20 text-center text-hero-ink">
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
          <p className="font-display mt-4 text-[15px] leading-5 tracking-[0.1em] text-hero-ink-muted">
            10.05 - 10.06
          </p>
        </div>
      </div>
    </div>
  )
}

import Image from 'next/image'
import type { CSSProperties } from 'react'
import { cinzel } from '@/shared/fonts'
import logo from './images/logo.png'

/** 로고가 다 펼쳐지는 데 걸리는 초. landing-title.css 의 title-reveal 길이와 같다 */
export const TITLE_REVEAL_SECONDS = 2

/** 글자 양옆에 바깥으로 옅어지는 선을 단 한 줄. 크기는 부모의 --u(피그마 1px) 배수로 받는다 */
function RuledLine({
  text,
  className,
  lineClassName,
}: {
  text: string
  className: string
  lineClassName: string
}) {
  return (
    <p
      className={`flex items-center gap-[calc(8.545*var(--u))] leading-[normal] whitespace-nowrap ${className}`}
    >
      <span
        aria-hidden
        className={`h-[calc(1.068*var(--u))] bg-linear-to-r from-transparent ${lineClassName}`}
      />
      {text}
      <span
        aria-hidden
        className={`h-[calc(1.068*var(--u))] bg-linear-to-l from-transparent ${lineClassName}`}
      />
    </p>
  )
}

/** 랜딩 제목. lag 가 들어오면 그만큼 지난 시점부터 로고가 양 끝으로 드러나고 날짜가 뒤따른다 */
export function LandingTitle({ lag }: { lag: number | null }) {
  const shown = lag !== null
  // 로고는 미리 받아 두고 보이지만 않게 해야 펼쳐질 때 비어 있지 않다
  const reveal = shown
    ? 'motion-safe:animate-title-reveal motion-reduce:animate-title-fade'
    : 'invisible'
  const fade = shown
    ? 'animate-title-fade [--title-fade-delay:1.4s] motion-reduce:[--title-fade-delay:0s]'
    : 'invisible'

  return (
    // 기기 폭이 달라도 피그마 390 화면과 같은 비율로 보이도록 모든 치수를 앱 폭의 1/390 배수로 잡는다
    // 높이는 영상(720×1280, cover)이 깔린 배율 --img 로 그림 속 y 106 에 둔다. 폭 기준이면 낮은 화면에서 동상이 올라와 창끝에 겹친다
    <div
      className={`${cinzel.variable} absolute inset-x-0 top-[calc(50cqh-534*var(--img))] flex flex-col items-center font-cinzel [--img:max(100cqw/720,100cqh/1280)] [--u:calc(100cqw/390)]`}
      style={{ '--title-lag': `${lag ?? 0}s` } as CSSProperties}
    >
      <h1 className={`w-[calc(319.231*var(--u))] mask-title-reveal ${reveal}`}>
        <Image
          src={logo}
          alt="QUINQUATRIA Twilight"
          sizes="(max-width: 480px) 82vw, 393px"
          loading="eager"
          className="h-auto w-full"
        />
      </h1>
      {/* 낮은 기기에서 날짜가 날개·투구 위에 겹쳐도 읽히게 면 없이 글자·선 둘레만 갈색 후광을 여러 겹 쌓아 띄운다 */}
      <RuledLine
        text="10.07 - 10.08"
        className={`text-[calc(12.817*var(--u))] tracking-[calc(0.513*var(--u))] text-[#9a3700] [text-shadow:0_0_calc(2*var(--u))_var(--brick),0_0_calc(2*var(--u))_var(--brick),0_0_calc(2*var(--u))_var(--brick),0_0_calc(6*var(--u))_var(--brick),0_0_calc(6*var(--u))_var(--brick),0_0_calc(12*var(--u))_var(--brick),0_0_calc(12*var(--u))_var(--brick),0_0_calc(20*var(--u))_var(--brick)] ${fade}`}
        lineClassName="w-[calc(66.222*var(--u))] to-[#7e2d00] shadow-[0_0_calc(10*var(--u))_var(--brick),0_0_calc(5*var(--u))_var(--brick)]"
      />
    </div>
  )
}

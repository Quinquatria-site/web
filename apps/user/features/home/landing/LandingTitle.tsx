import Image from 'next/image'
import { cinzel } from '@/shared/fonts'
import logo from './images/logo.png'

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

/** 랜딩 제목. shown 이 켜지면 로고가 가운데에서 양 끝으로 드러나고 HUFS·날짜가 뒤따른다 */
export function LandingTitle({ shown }: { shown: boolean }) {
  // 로고는 미리 받아 두고 보이지만 않게 해야 펼쳐질 때 비어 있지 않다
  const reveal = shown
    ? 'motion-safe:animate-title-reveal motion-reduce:animate-title-fade'
    : 'invisible'
  const fade = shown
    ? 'animate-title-fade [--title-fade-delay:1.4s] motion-reduce:[--title-fade-delay:0s]'
    : 'invisible'

  return (
    // 기기 폭이 달라도 피그마 390 화면과 같은 비율로 보이도록 모든 치수를 앱 폭의 1/390 배수로 잡는다
    <div
      className={`${cinzel.variable} absolute inset-x-0 top-[calc(83*var(--u))] flex flex-col items-center font-cinzel [--u:calc(100cqw/390)]`}
    >
      <RuledLine
        text="HUFS"
        className={`text-[calc(17.089*var(--u))] text-[#812e00] ${fade}`}
        lineClassName="w-[calc(42.724*var(--u))] to-[#9a3700]"
      />
      <h1
        className={`mt-[calc(2.17*var(--u))] w-[calc(319.231*var(--u))] mask-title-reveal ${reveal}`}
      >
        <Image
          src={logo}
          alt="QUINQUATRIA Twilight"
          sizes="(max-width: 480px) 82vw, 393px"
          loading="eager"
          className="h-auto w-full"
        />
      </h1>
      <RuledLine
        text="10.07 - 10.08"
        className={`text-[calc(12.817*var(--u))] tracking-[calc(0.513*var(--u))] text-[#9a3700] ${fade}`}
        lineClassName="w-[calc(66.222*var(--u))] to-[#7e2d00]"
      />
    </div>
  )
}

import Image from 'next/image'
import glowDotMd from './images/glow-dot-md.svg'
import glowDotSm from './images/glow-dot-sm.svg'
import sparkleA from './images/sparkle-a.png'
import sparkleB from './images/sparkle-b.png'

// 피그마 image 46 별 두 장. b 는 번짐이 a 의 절반이다
const STARS = {
  a: { src: sparkleA, glow: 'drop-shadow-[0_0_4px_#ffae5c]' },
  b: { src: sparkleB, glow: 'drop-shadow-[0_0_2px_#ffae5c]' },
}

const DOTS = { sm: glowDotSm, md: glowDotMd }

/** 노을빛(#ffae5c)으로 칠한 반짝이 별. className 에 absolute 자리를 준다 */
export function GlowStar({ kind, className }: { kind: keyof typeof STARS; className: string }) {
  const { src, glow } = STARS[kind]
  return (
    // 모양 틀이 번짐까지 잘라 내니 번짐은 바깥 칸에 준다
    <i aria-hidden className={`h-[37px] w-9 ${glow} ${className}`}>
      <i
        className="block size-full bg-[#ffae5c] mask-size-[100%_100%] mask-no-repeat"
        style={{ maskImage: `url(${src.src})` }}
      />
    </i>
  )
}

/** 별 곁에 흩뿌리는 노을빛 점. SVG 가 번짐까지 담아 점보다 크니 번짐 칸의 모서리 자리를 준다 */
export function GlowDot({ size, className }: { size: keyof typeof DOTS; className: string }) {
  return <Image src={DOTS[size]} alt="" aria-hidden unoptimized className={className} />
}

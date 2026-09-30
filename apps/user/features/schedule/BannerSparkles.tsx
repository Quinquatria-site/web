import Image from 'next/image'
import glowDotMd from './images/glow-dot-md.svg'
import glowDotSm from './images/glow-dot-sm.svg'
import sparkleA from './images/sparkle-a.png'
import sparkleB from './images/sparkle-b.png'

// 피그마 꾸밈요소(856:3697)의 별 둘. 오른쪽 것은 번짐이 절반이다
const STARS = [
  { src: sparkleA, className: 'top-3.5 left-3.5 drop-shadow-[0_0_4px_#ffae5c]' },
  { src: sparkleB, className: 'right-[17px] bottom-3.5 drop-shadow-[0_0_2px_#ffae5c]' },
]

// 점 SVG 는 빛 번짐까지 담아 점보다 크니 번짐 칸의 모서리 자리를 적는다
const DOTS = [
  { src: glowDotSm, className: 'top-10 left-10' },
  { src: glowDotMd, className: 'top-[45px] left-[57px]' },
  { src: glowDotMd, className: 'top-[67px] left-[34px]' },
  { src: glowDotMd, className: 'top-[70px] right-[58px]' },
  { src: glowDotSm, className: 'top-[53px] right-[49px]' },
]

/** 알림 배너 양 끝의 반짝이 별과 빛 점. 별 그림을 모양 틀로 써서 노을빛(#ffae5c)으로 칠한다 */
export function BannerSparkles() {
  return (
    <span aria-hidden>
      {STARS.map(({ src, className }) => (
        // 모양 틀이 번짐까지 잘라 내니 번짐은 바깥 칸에 준다
        <i key={className} className={`absolute h-[37px] w-9 ${className}`}>
          <i
            className="block size-full bg-[#ffae5c] mask-size-[100%_100%] mask-no-repeat"
            style={{ maskImage: `url(${src.src})` }}
          />
        </i>
      ))}
      {DOTS.map(({ src, className }, i) => (
        <Image key={i} src={src} alt="" unoptimized className={`absolute ${className}`} />
      ))}
    </span>
  )
}

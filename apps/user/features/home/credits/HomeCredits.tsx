import Image from 'next/image'
import { cinzel } from '@/shared/fonts'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { paperlogy } from './fonts'
import { CreditGroup } from './CreditGroup'
import sunsetSky from './images/sunset-sky.jpg'

// 피그마에서 한 줄에 두 명씩, 사이에 점을 두고 마지막 한 명은 홀로 둔다
const MAKERS = [['Hwang Junho', 'Kim Jiyong'], ['Lim Jaejoon', 'Kim Taeheon'], ['Wi Soomin']]

// 직선 그라데이션은 중간에 탁한 띠가 남아 처음엔 빨리, 끝은 천천히 옅어지는 곡선으로 짚는다
const SKY_FADE = `linear-gradient(to bottom, ${[
  [100, 0],
  [73.8, 19],
  [54.1, 34],
  [38.2, 47],
  [27.8, 56.5],
  [19.4, 65],
  [12.6, 73],
  [7.5, 80.2],
  [4.2, 86.1],
  [2.1, 91],
  [0.8, 95.2],
  [0.2, 98.2],
  [0, 100],
]
  .map(([alpha, at]) => `color-mix(in srgb, var(--color-secondary) ${alpha}%, transparent) ${at}%`)
  .join(', ')})`

/** 홈 맨 아래 크레딧. 만든 사람과 함께한 총학생회를 노을 하늘 위에 둔다 */
export async function HomeCredits() {
  const { credits } = getMessages(await getLocale()).home
  return (
    // 크레딧 글꼴은 여기서만 쓰여 이 섹션에만 변수를 달아 다른 페이지가 미리 받지 않게 한다
    // main 의 도크 여백만큼 아래로 늘려 노을 하늘이 화면 끝까지 닿고 위로 가기 원이 그 위에 뜬다
    <footer
      className={`${cinzel.variable} ${paperlogy.variable} relative -mb-(--dock-space) h-[705px] overflow-hidden bg-[#232323] pt-[49px]`}
    >
      <Image
        src={sunsetSky}
        alt=""
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        className="object-cover opacity-30"
      />
      {/* 위 바로가기 면에서 하늘로 경계선 없이 이어지게 같은 색에서 옅어진다 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[80px]"
        style={{ backgroundImage: SKY_FADE }}
      />
      <div className="relative mx-auto flex w-[302px] flex-col items-center gap-[72px]">
        <CreditGroup
          title="Made by"
          organization={credits.likelion}
          instagram={{
            label: credits.likelionInstagram,
            href: 'https://www.instagram.com/likelion_hufs/',
          }}
        >
          <ul className="flex flex-col items-center gap-1 font-cinzel text-base leading-[normal]">
            {MAKERS.map((pair) => (
              <li key={pair.join()} className="flex items-center gap-4">
                {pair.map((name, i) => (
                  <span key={name} className="flex items-center gap-4">
                    {i > 0 && <span aria-hidden className="size-0.5 rounded-full bg-white/70" />}
                    {name}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </CreditGroup>
        <CreditGroup
          title="In Partnership With"
          organization={credits.council}
          instagram={{
            label: credits.councilInstagram,
            href: 'https://www.instagram.com/hufsstudent/',
          }}
        />
      </div>
    </footer>
  )
}

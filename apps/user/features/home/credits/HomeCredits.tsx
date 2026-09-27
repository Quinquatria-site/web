import Image from 'next/image'
import { cinzel, paperlogy } from './fonts'
import { CreditGroup } from './CreditGroup'
import sunsetSky from './images/sunset-sky.jpg'

// 피그마에서 한 줄에 두 명씩, 사이에 점을 두고 마지막 한 명은 홀로 둔다
const MAKERS = [['Hwang Junho', 'Kim Jiyong'], ['Lim Jaejoon', 'Kim Taeheon'], ['Wi Soomin']]

/** 홈 맨 아래 크레딧. 만든 사람과 함께한 총학생회를 노을 하늘 위에 둔다 */
export function HomeCredits() {
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
        className="object-cover"
      />
      <div className="relative mx-auto flex w-[302px] flex-col items-center gap-[72px]">
        <CreditGroup
          title="Made by"
          organization="한국외대(서울) 멋쟁이사자처럼"
          instagram={{
            label: '멋쟁이사자처럼 instagram →',
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
          organization="한국외대 서울캠퍼스 제60대 총학생회 ‘선명’"
          instagram={{
            label: '선명 instagram →',
            href: 'https://www.instagram.com/hufsstudent/',
          }}
        />
      </div>
    </footer>
  )
}

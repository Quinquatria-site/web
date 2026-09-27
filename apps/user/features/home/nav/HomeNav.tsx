import { HomeNavCard, type HomeNavItem } from './HomeNavCard'
import goods from './images/goods.png'
import lostItems from './images/lost-items.png'
import map from './images/map.png'
import notices from './images/notices.png'
import timetable from './images/timetable.png'

// 그림마다 피그마에서 크기와 오른쪽 여백이 조금씩 달라 카드별로 옮겨 둔다
const ITEMS: HomeNavItem[] = [
  {
    href: '/timeline',
    title: '축제 일정표',
    description: '축제 일정과 공연 시간을 확인해보세요!',
    image: timetable,
    imageBox: 'top-0 right-[11px] h-[76px] w-[91px]',
  },
  {
    href: '/map',
    title: '캠퍼스 지도',
    description: '다양한 부스와 편의시설 위치를 찾아보세요!',
    image: map,
    imageBox: 'top-[3px] right-[9.5px] h-[70px] w-[92.5px]',
  },
  {
    href: '/notices',
    title: '공지사항',
    description: '축제 관련 주요 소식을 알려드립니다.',
    image: notices,
    imageBox: 'top-1/2 right-[13.5px] h-[72px] w-[77.5px] -translate-y-1/2',
  },
  {
    href: '/lost-items',
    title: '분실물 찾기',
    description: '축제가 끝나면 분실물이 업로드됩니다.',
    image: lostItems,
    imageBox: 'top-1/2 right-[17px] h-[72px] w-[81px] -translate-y-1/2',
  },
  {
    href: '/goods',
    title: '퀸쿠아트리아 굿즈',
    description: '2026 퀸쿠아트리아 굿즈를 만나보세요!',
    image: goods,
    imageBox: 'top-1/2 right-[13.75px] h-[73px] w-[90.25px] -translate-y-1/2',
  },
]

/** 홈 랜딩 아래 바로가기 목록. 메인 탭 다섯 곳으로 가는 카드를 세로로 쌓는다 */
export function HomeNav() {
  return (
    <nav aria-label="바로가기" className="bg-secondary px-[22px] py-[22px]">
      <ul className="flex flex-col gap-4">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <HomeNavCard {...item} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

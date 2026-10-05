import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages, type Messages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { HomeNavCard, type HomeNavItem } from './HomeNavCard'
import goods from './images/goods.png'
import lostItems from './images/lost-items.png'
import map from './images/map.png'
import notices from './images/notices.png'
import online from './images/online.png'
import timetable from './images/timetable.png'

// 그림마다 피그마에서 크기와 오른쪽 여백이 조금씩 달라 카드별로 옮겨 둔다
const ITEMS: (Omit<HomeNavItem, 'title' | 'description'> & {
  key: keyof Messages['home']['nav']
})[] = [
  {
    key: 'schedule',
    href: '/schedule',
    image: timetable,
    imageBox: { right: 15, width: 83 },
  },
  {
    key: 'map',
    href: '/map',
    image: map,
    imageBox: { right: 14, width: 86 },
  },
  {
    key: 'notices',
    href: '/notices',
    image: notices,
    imageBox: { right: 5.3, width: 93.7 },
  },
  {
    key: 'lostItems',
    href: '/lost-items',
    image: lostItems,
    imageBox: { right: 19, width: 74 },
  },
  {
    key: 'goods',
    href: '/goods',
    image: goods,
    imageBox: { right: 13.3, width: 83.7 },
  },
  {
    key: 'online',
    href: '/online',
    image: online,
    imageBox: { right: 14, width: 79 },
  },
]

/** 홈 랜딩 아래 바로가기 목록. 메인 탭 다섯 곳과 온라인 콘텐츠로 가는 카드를 세로로 쌓는다 */
export async function HomeNav() {
  const locale = await getLocale()
  const { home } = getMessages(locale)
  return (
    <nav aria-label={home.navLabel} className="bg-secondary px-[22px] py-[22px]">
      <ul className="flex flex-col gap-4">
        {ITEMS.map(({ key, href, ...item }) => (
          <li key={key}>
            <HomeNavCard {...item} {...home.nav[key]} href={localePath(locale, href)} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

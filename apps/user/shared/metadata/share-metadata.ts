import type { Metadata, ResolvingMetadata } from 'next'
import { getMessages } from '@/shared/i18n/messages'
import type { Locale } from '@/shared/i18n/locales'
import { localePath } from '@/shared/i18n/paths'

/** 공유 카드에 실을 값. image 가 없으면 부모의 기본 OG 이미지를 그대로 쓴다 */
type ShareCard = {
  title: string
  description: string
  path: string
  image?: { url: string; alt: string }
}

/** 제목·설명을 문서와 공유 카드에 함께 싣는다. openGraph 는 통째로 덮이니 부모 값을 펼친다 */
export async function shareMetadata(
  parent: ResolvingMetadata,
  { title, description, path, image }: ShareCard,
): Promise<Metadata> {
  const { openGraph } = await parent
  return {
    title,
    description,
    openGraph: {
      ...openGraph,
      title,
      description,
      url: path,
      ...(image && { images: [image] }),
    },
  }
}

/** 목록 페이지 공유 카드. 제목은 페이지 이름, 설명은 홈 바로가기 카드 문구를 쓴다 */
export function listShareMetadata(
  parent: ResolvingMetadata,
  locale: Locale,
  page: 'schedule' | 'map' | 'notices' | 'lostItems' | 'goods' | 'online',
  path: `/${string}`,
) {
  const { pages, home, meta } = getMessages(locale)
  return shareMetadata(parent, {
    title: meta.pageTitle.replace('{page}', pages[page]),
    description: home.nav[page].description,
    path: localePath(locale, path),
  })
}

/** 공유 카드 제목에 `[공지]` 같은 머리말을 붙인다 */
export function taggedTitle(locale: Locale, label: string, title: string) {
  return getMessages(locale).meta.tagged.replace('{label}', label).replace('{title}', title)
}

// 카톡은 설명을 두 줄에서 자르지만 검색·다른 앱은 통째로 보여 주니 적당한 길이에서 끊는다
const DESCRIPTION_MAX = 120

/** 줄바꿈을 공백으로 펴고 길면 말줄임한다 */
export function oneLine(text: string) {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > DESCRIPTION_MAX ? `${flat.slice(0, DESCRIPTION_MAX).trimEnd()}…` : flat
}

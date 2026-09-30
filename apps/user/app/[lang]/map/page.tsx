import { getCategories } from '@/features/map/get-categories'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 지도 탭 */
export default async function MapPage() {
  const { pages } = getMessages(await getLocale())
  const categories = await getCategories()

  return (
    <>
      <h1>{pages.map}</h1>
      {/* 임시: 카테고리 연결 확인용 목록. 피그마 카테고리 칩으로 바꾼다 */}
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </>
  )
}

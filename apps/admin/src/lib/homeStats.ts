import { CATEGORIES } from '../mocks/categories'
import { LOST_ITEMS } from '../mocks/lostItems'
import { menusByPlace } from '../mocks/menus'
import { NOTICES } from '../mocks/notices'
import { PERFORMANCES } from '../mocks/performances'
import { PLACES } from '../mocks/places'
import { noticesByType, performancesByDate } from '../mocks/store'
import {
  FESTIVAL_DATES,
  findTranslation,
  hasMissingTranslations,
  type FestivalDate,
  type Notice,
  type Performance,
  type Place,
} from '../mocks/types'
import { isOpenAt } from './placeHours'

/**
 * 홈이 쓰는 셀렉터를 한곳에 모은다.
 *
 * 판정은 목록 화면들과 **같은 함수**를 쓴다 (hasMissingTranslations). 홈이 따로
 * 세면 홈의 숫자와 각 탭의 "번역 누락 N" 칩이 어긋나고, 그 순간 운영자는 둘 중
 * 어느 쪽도 믿지 않는다.
 *
 * 집계 엔드포인트는 명세에 없다 (§2.5 는 목록 컨테이너뿐이다). 그래서 카드 하나가
 * 목록 GET 하나에 대응하도록 기존 셀렉터 위에만 쌓는다 — 실 API(#10)가 붙을 때
 * 이 파일의 함수 하나가 fetch 하나로 바뀌면 된다.
 *
 * 메모하지 않는다. 목 배열은 스토어가 제자리에서 바꾸고 수십 건 계산은 렌더마다
 * 해도 싸다 — 목록 화면들과 같은 이유다.
 */

/** 카테고리 KO 이름. 없으면 코드를 그대로 쓴다 */
function categoryName(categoryId: number): string {
  const category = CATEGORIES.find((c) => c.id === categoryId)
  if (!category) return String(categoryId)
  return findTranslation(category.translations, 'KO')?.name ?? category.code
}

export interface MissingCounts {
  places: number
  performances: number
  notices: number
  lostItems: number
  total: number
}

/**
 * 번역이 빠진 항목 수. §2.4 상 이 숫자는 곧 "영어·중국어로 보는 학생에게는
 * 존재하지 않는 항목" 수다.
 *
 * 분실물도 센다. 분실물 목록에는 누락 필터가 없지만, 홈의 합계가 각 탭 칩
 * 숫자의 합과 달라지면 안 된다.
 */
export function missingByDomain(): MissingCounts {
  const places = PLACES.filter((p) => hasMissingTranslations(p.translations)).length
  const performances = PERFORMANCES.filter((p) => hasMissingTranslations(p.translations)).length
  const notices = NOTICES.filter((n) => hasMissingTranslations(n.translations)).length
  const lostItems = LOST_ITEMS.filter((i) => hasMissingTranslations(i.translations)).length
  return {
    places,
    performances,
    notices,
    lostItems,
    total: places + performances + notices + lostItems,
  }
}

/** 일차별 번역 누락 공연 수. 누락 카드가 어느 일차를 열어줄지 정하는 데 쓴다 */
export function missingPerformancesByDate(): { date: FestivalDate; count: number }[] {
  return FESTIVAL_DATES.map((date) => ({
    date,
    count: performancesByDate(date).filter((p) => hasMissingTranslations(p.translations)).length,
  }))
}

/**
 * 최신 일반 공지에 번역이 빠졌으면 그 공지. 아니면 undefined.
 *
 * 다른 누락은 그 항목 하나가 목록에서 사라지는 것이지만, 이것은 학생 앱의
 * "최신 공지" 자리가 그 언어에서 통째로 404 가 되는 것이라 무게가 다르다
 * (§3.5). NoticesRoute 의 latestBroken 과 같은 판정이다.
 */
export function latestGeneralBroken(): Notice | undefined {
  const latest = latestGeneralNotice()
  return latest && hasMissingTranslations(latest.translations) ? latest : undefined
}

/** 최신 일반 공지. noticesByType 이 created_at DESC 로 주므로 첫 건이다 */
export function latestGeneralNotice(): Notice | undefined {
  return noticesByType('GENERAL')[0]
}

/** 지금 공연 중인 것. 전체에서 최대 1건이다 (§5.6) */
export function liveNow(): Performance | undefined {
  return PERFORMANCES.find((p) => p.is_live)
}

/**
 * 같은 일차의 다음 순서 공연.
 *
 * 공연에는 시각이 없어 "몇 분 뒤" 는 만들 수 없지만(§5.6), seq 는 일차 안에서
 * 1부터 빈틈 없이 이어지므로 다음 **순서**는 시각 계산 없이 정확히 나온다.
 * 인수인계에서 실제로 묻는 값이다.
 */
export function nextInSeq(performance: Performance): Performance | undefined {
  return performancesByDate(performance.date).find((p) => p.seq === performance.seq + 1)
}

export interface CategoryOpenCount {
  categoryId: number
  name: string
  open: number
  total: number
}

/**
 * 카테고리별 운영 중 / 전체. 합계만으로는 어디를 순찰해야 할지 알 수 없어
 * 종류별로 쪼갠다.
 */
export function openPlacesByCategory(nowHhmm: string): CategoryOpenCount[] {
  return CATEGORIES.map((category) => {
    const rows = PLACES.filter((p) => p.category_id === category.id)
    return {
      categoryId: category.id,
      name: categoryName(category.id),
      open: rows.filter((p) => isOpenAt(p, nowHhmm)).length,
      total: rows.length,
    }
  }).filter((row) => row.total > 0)
}

/** 카테고리별 등록 수. 준비 모드의 콘텐츠 점검이 쓴다 */
export function placeCountByCategory(): { categoryId: number; name: string; total: number }[] {
  return CATEGORIES.map((category) => ({
    categoryId: category.id,
    name: categoryName(category.id),
    total: PLACES.filter((p) => p.category_id === category.id).length,
  })).filter((row) => row.total > 0)
}

/** 사진이 없는 장소. 학생 앱에서 빈 카드로 나간다 */
export function placesWithoutPhoto(): Place[] {
  return PLACES.filter((p) => p.place_image_uri === null || p.place_image_uri.length === 0)
}

/** 메뉴를 가질 수 있는 카테고리. 의무실·팔찌 수령소는 메뉴가 없는 것이 정상이다 */
function sellingCategoryIds(): number[] {
  return CATEGORIES.filter((c) => c.code === 'PUB' || c.code === 'BOOTH').map((c) => c.id)
}

/** 주점·부스 전체 수. "63곳 중 60곳" 처럼 분모로 쓴다 */
export function sellingPlaceCount(): number {
  const ids = sellingCategoryIds()
  return PLACES.filter((p) => ids.includes(p.category_id)).length
}

/** 메뉴가 하나도 없는 주점·부스. 파는 곳인데 살 것이 안 보이는 상태다 */
export function placesWithoutMenu(): Place[] {
  const ids = sellingCategoryIds()
  return PLACES.filter((p) => ids.includes(p.category_id) && menusByPlace(p.id).length === 0)
}

/** 일차별 공연 수. 0 인 일차가 곧 라인업 미배정이다 */
export function performanceCountByDate(): { date: FestivalDate; count: number }[] {
  return FESTIVAL_DATES.map((date) => ({ date, count: performancesByDate(date).length }))
}

export interface Progress {
  done: number
  total: number
}

/**
 * 세 언어가 모두 찬 항목 / 전체 항목. 준비 현황 막대가 쓴다.
 *
 * missingByDomain 과 같은 판정(hasMissingTranslations)을 쓴다 — 막대의 남은
 * 칸과 hero 의 누락 건수가 어긋나면 둘 다 못 믿게 된다.
 */
export function translationProgress(): Progress {
  const missing = missingByDomain()
  const total = PLACES.length + PERFORMANCES.length + NOTICES.length + LOST_ITEMS.length
  return { done: total - missing.total, total }
}

/** 사진이 있는 장소 / 전체 장소 */
export function photoProgress(): Progress {
  return { done: PLACES.length - placesWithoutPhoto().length, total: PLACES.length }
}

/** 메뉴가 있는 주점·부스 / 전체 주점·부스 */
export function menuProgress(): Progress {
  const total = sellingPlaceCount()
  return { done: total - placesWithoutMenu().length, total }
}

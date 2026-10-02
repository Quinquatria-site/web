/**
 * 서버 데이터 모델은 `@quen/schema` 에서 가져오고, 여기서는 Backoffice 응답 모양으로
 * **조립**만 한다 — 스키마는 엔티티를 `XxxBase`(언어 무관) · `XxxText`(번역) 조각으로
 * 두고 완성 이름은 앱이 짓는다 (packages/schema/CLAUDE.md). Backoffice 는 모든 언어의
 * 번역을 `translations[]` 로 받으므로 `WithTranslations<Base, Text, parent>` 다.
 *
 * 필드는 서버와 같은 snake_case 다. 이 타입이 곧 응답 형태라서, 실제 API 가 붙을 때
 * 화면 코드를 다시 짜지 않아도 된다. datetime 은 UTC offset 이 포함된 ISO 8601 이다 (§2.2).
 *
 * 아래에 남은 것은 스키마가 앱 몫으로 정한 것들이다 — 축제 날짜, 라벨 포맷,
 * 번역 찾기·누락 검사. 서버 enum 이나 번역 타입을 여기서 다시 정의하면 린트가 막는다.
 */

import type { Translation, WithTranslations } from '@quen/schema/common/localize'
import { LANGUAGE_CODES, type LanguageCode } from '@quen/schema/common/language'
import type { CategoryBase, CategoryText } from '@quen/schema/entities/category'
import type { LostItemBase, LostItemText } from '@quen/schema/entities/lost-item'
import type { MenuBase, MenuText } from '@quen/schema/entities/menu'
import type { NoticeBase, NoticeText } from '@quen/schema/entities/notice'
import type { PerformanceBase, PerformanceText } from '@quen/schema/entities/performance'
import type { PlaceBase, PlaceText } from '@quen/schema/entities/place'

export { LANGUAGE_CODES, type LanguageCode }
export { CATEGORY_CODES, type CategoryCode } from '@quen/schema/entities/category'
export { PERFORMANCE_TYPES, type PerformanceType } from '@quen/schema/entities/performance'
export { NOTICE_TYPES, type NoticeType } from '@quen/schema/entities/notice'
export type { Page } from '@quen/schema/common/page'

export type CategoryTranslation = Translation<CategoryText, 'category'>
export type Category = WithTranslations<CategoryBase, CategoryText, 'category'>

export type PlaceTranslation = Translation<PlaceText, 'place'>
/** 좌표는 배치 도면(390×329, 좌상단 원점). user 앱 목과 같은 좌표계다 (§8) */
export type Place = WithTranslations<PlaceBase, PlaceText, 'place'>

export type MenuTranslation = Translation<MenuText, 'menu'>
export type Menu = WithTranslations<MenuBase, MenuText, 'menu'>

/**
 * 축제 일차. PERFORMANCE.date 는 자유 입력이 아니라 이 중 하나를 고르는 것이다.
 * 명세는 YYYY-MM-DD 형식만 규정하지만(§5.6), 이틀짜리 축제라 화면에서는
 * 날짜 입력칸 대신 일차 선택으로 받는다.
 *
 * 축제는 **10/7(수)~10/8(목)** 로 확정됐다. 장소 목의 운영 시간도 10/7 기준이다.
 * 한때 10/6~10/7 로 적혀 있었는데 그것이 잘못 정해진 값이었다 (2026-09-24 정정).
 *
 * 문서는 아직 안 따라왔다 — PRD §0 은 "10/6~8 중 이틀 (화·수·목)" 이고 부록 A-6 은
 * "어느 이틀인지 미정", v0.4 §9 블로커의 "공연 라인업의 축제 일차 배정" 도 비어
 * 있다. 새 값도 그 사흘 창 안이라 계약은 그대로다. 문서를 고칠 때 이 값이 기준이다.
 *
 * 일정이 또 바뀌면 여기만 고치면 된다. API 는 임의의 YYYY-MM-DD 를 받으므로
 * 계약은 그대로고, 화면은 이 배열의 길이와 순서만 본다.
 */
export const FESTIVAL_DATES = ['2026-10-07', '2026-10-08'] as const
export type FestivalDate = (typeof FESTIVAL_DATES)[number]

/** "2026-10-07" → "10/7". 장소의 운영 일자처럼 날짜만 필요한 자리 */
export function festivalDateLabel(date: string): string {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
}

/**
 * "2026-10-07" → "1일차 (10/7)".
 *
 * PRD §5-2 는 공연 타임라인을 일차로 묶는다고 하고 운영자는 날짜로 생각한다.
 * 둘 다 보여준다. 장소의 "운영 일자" 는 날짜만 쓰므로 festivalDateLabel 이다.
 */
export function festivalDayLabel(date: string): string {
  const index = FESTIVAL_DATES.indexOf(date as FestivalDate)
  return index < 0 ? date : `${index + 1}일차 (${festivalDateLabel(date)})`
}

/**
 * ISO 8601 datetime → "9/14 18:30". 공지의 등록 시각처럼 날짜와 시각이 함께
 * 필요한 자리에 쓴다. offset 을 보지 않고 자르므로 값이 KST(+09:00)라고
 * 가정한다 — 장소 목록의 운영 시각과 같은 관례다 (#10 에서 확인할 것).
 */
export function dateTimeLabel(iso: string): string {
  return `${festivalDateLabel(iso)} ${iso.slice(11, 16)}`
}

export type PerformanceTranslation = Translation<PerformanceText, 'performance'>

/**
 * 공연 (§5.6). 시작·종료 시각이 없다 — 축제 일정 지연이 잦아 시각 기반
 * "현재 공연" 판별이 잘 깨지기 때문이다. 대신 일차(date) 안의 순서(seq)로
 * 타임라인을 만들고, 현재 공연은 운영자가 올리는 is_live 로만 판단한다.
 *
 * seq 와 is_live 는 POST·PATCH 본문에 넣으면 422 다. 서버가 정하거나
 * 전용 엔드포인트로만 바뀐다 — 화면에 입력칸을 만들지 않는다.
 */
export type Performance = WithTranslations<PerformanceBase, PerformanceText, 'performance'>

/**
 * 공지 본문(content)은 공연의 description 과 달리 **필수**다 (§5.7). 한 언어의 제목만
 * 채우고 본문을 비우는 것은 저장할 수 없는 상태라 편집 화면이 그 조합을 막는다 —
 * 여기 배열에 들어온 번역은 이미 둘 다 찬 것이다.
 */
export type NoticeTranslation = Translation<NoticeText, 'notice'>

/**
 * 공지 (§5.7). 운영자가 정하는 것은 type 과 번역뿐이고 나머지는 서버 몫이다.
 *
 * 공연과 달리 순서를 손댈 수단이 없다. 정렬 키가 created_at 하나뿐이라
 * (§5.1 created_at DESC, id DESC) 재정렬 엔드포인트 자체가 없다.
 *
 * type 을 잘못 고르면 학생 앱에서 **노출 위치가 바뀐다.** admin 은
 * /notices 하나에 type 쿼리를 걸지만 Customer API 는 /notices(GENERAL) 과
 * /notices/permanent 로 경로가 갈린다 (§3.5).
 */
export type Notice = WithTranslations<NoticeBase, NoticeText, 'notice'>

/** 번역 배열에서 특정 언어를 찾는다. Backoffice 응답은 language_code ASC 정렬(§5.1) */
export function findTranslation<T extends { language_code: LanguageCode }>(
  translations: T[],
  language: LanguageCode,
): T | undefined {
  return translations.find((t) => t.language_code === language)
}

/** 빠진 번역 언어 목록. Customer API 는 없는 언어의 항목을 목록에서 빼므로(§2.4) 경고에 쓴다 */
export function missingLanguages(translations: { language_code: LanguageCode }[]): LanguageCode[] {
  return LANGUAGE_CODES.filter((code) => !translations.some((t) => t.language_code === code))
}

/**
 * 번역이 빠진 언어가 하나라도 있는지. 목록의 "번역 누락만 보기" 필터가 쓴다.
 * 빠진 언어 사용자에게는 이 항목이 목록에서 아예 사라지므로(§2.4), 이 판정에
 * 걸린 것들이 곧 "지금 외국인에게 안 보이는 것" 목록이다.
 */
export function hasMissingTranslations(
  translations: { language_code: LanguageCode }[],
): boolean {
  return missingLanguages(translations).length > 0
}

/**
 * 분실물 (§5.8). 네 도메인 중 유일하게 **현장에서 즉시 만들어지는** 리소스다.
 * 장소·공연은 운영 본부에서 미리 채워 넣지만 분실물은 물건을 주운 사람이
 * 그 자리에서 폰으로 등록한다 — 화면 설계가 이 사실 하나에서 갈린다.
 *
 * 운영자가 정하는 것은 사진과 번역뿐이다. created_at 은 서버가 찍고
 * is_returned 는 목록의 반환 버튼으로만 바뀐다.
 *
 * 공지와 마찬가지로 순서를 손댈 수단이 없다. 정렬 키가 created_at 하나뿐이라
 * (§5.1 created_at DESC, id DESC) 재정렬 엔드포인트 자체가 없다.
 */
export type LostItemTranslation = Translation<LostItemText, 'lost_item'>

/**
 * image_url 은 타입상 nullable 이지만 이 도메인에서는 화면이 필수로 막는다 — 사진 없는
 * 분실물은 주인이 자기 물건인지 알아볼 수 없어서 목록에 있으나 마나다.
 *
 * is_returned 는 편집 화면이 아니라 **목록의 반환 버튼**으로만 바뀐다 — 주인이 물건을
 * 찾아가는 순간은 한 손이 물건에 가 있어서, 화면을 옮겨 저장까지 누르게 할 여유가 없다.
 * 공연의 is_live 와 달리 배타적이지 않다.
 */
export type LostItem = WithTranslations<LostItemBase, LostItemText, 'lost_item'>

import { CATEGORY_CODES, type Category, type CategoryCode } from './types'

/**
 * 카테고리 캐시. 서버 응답을 담아두는 자리다 — store.ts 의 loadCatalog 가 채운다.
 *
 * 화면의 순서(목록 칩·지도 범례·장소 편집 선택지)는 서버 응답 순서(`id ASC`)다.
 */
export const CATEGORIES: Category[] = []

export function categoryById(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

/**
 * 서버에 카테고리 5종(§2.3 CATEGORY.code) 중 빠진 것이 있다.
 *
 * 카테고리는 고정 5종이라 서버가 미리 넣어 두고, Backoffice API 에도 만드는 요청이 없다
 * (`POST /categories` 는 405). 그래서 admin 이 채울 수 없고, 장소는 존재하는 category_id
 * 가 있어야 생기므로 화면을 열기 전에 막는다. 문구는 그대로 오류 화면에 뜬다.
 */
export class MissingCategoriesError extends Error {
  readonly codes: CategoryCode[]

  constructor(codes: CategoryCode[]) {
    super(
      `서버에 카테고리 데이터가 없습니다 (${codes.join(', ')}). 백엔드 팀에 카테고리 등록을 요청해 주세요.`,
    )
    this.name = 'MissingCategoriesError'
    this.codes = codes
  }
}

/** 서버 목록에 빠진 코드가 있으면 MissingCategoriesError 를 던진다 */
export function assertAllCategories(categories: Category[]): void {
  const have = new Set(categories.map((c) => c.code))
  const missing = CATEGORY_CODES.filter((code) => !have.has(code))
  if (missing.length > 0) throw new MissingCategoriesError(missing)
}

import type { LanguageCode } from '@quen/schema/common/language'
import type { CategoryCode } from '@quen/schema/entities/category'
import { toKstIso } from '../lib/kst'
import type { Category, Menu, Place } from '../mocks/types'
import { request } from './client'
import { BACKOFFICE_BASE } from './config'
import { listAll } from './list'

/**
 * 카테고리·장소·메뉴 (§5.3–5.5) 요청.
 *
 * 요청 본문의 번역에는 응답에 붙는 `id`·부모 id 를 싣지 않는다 — 서버가 모르는 필드는
 * 422 다(`extra="forbid"`). 그래서 응답 타입을 재사용하지 않고 요청 모양을 따로 둔다.
 * 요청 모양은 앱 몫이라 스키마 패키지가 아니라 여기 있다 (공지와 같은 관례).
 */

// ── 카테고리 ──

export interface CategoryWrite {
  code: CategoryCode
  translations: { language_code: LanguageCode; name: string }[]
}

export async function fetchCategories(): Promise<Category[]> {
  return listAll<Category>('/categories')
}

export async function createCategory(body: CategoryWrite): Promise<Category> {
  return request<Category>(BACKOFFICE_BASE, '/categories', { method: 'POST', body })
}

// ── 장소 ──

export interface PlaceTextWrite {
  language_code: LanguageCode
  name: string
  host_college: string
  description: string
}

export interface PlaceWrite {
  category_id: number
  category_sequence: number
  x: number
  y: number
  start_hour: string
  end_hour: string
  place_image_uri: string[] | null
  translations: PlaceTextWrite[]
}

/**
 * 운영시간이 UTC(`Z`)로 온다. 화면은 문자열을 잘라 HH:mm·날짜를 읽으므로(`placeHours`,
 * `placeText`, 편집 화면의 운영 일자) 캐시에 넣기 전에 KST 로 바꾼다. 안 하면 9시간
 * 어긋나 "운영 중" 판정이 전부 틀린다.
 */
function toPlace(raw: Place): Place {
  return {
    ...raw,
    start_hour: raw.start_hour && toKstIso(raw.start_hour),
    end_hour: raw.end_hour && toKstIso(raw.end_hour),
  }
}

export async function fetchPlaces(): Promise<Place[]> {
  return (await listAll<Place>('/places')).map(toPlace)
}

export async function createPlace(body: PlaceWrite): Promise<Place> {
  return toPlace(await request<Place>(BACKOFFICE_BASE, '/places', { method: 'POST', body }))
}

/** 보낸 언어만 upsert, 안 보낸 언어는 유지 (§5.2) */
export async function updatePlace(id: number, body: Partial<PlaceWrite>): Promise<Place> {
  return toPlace(await request<Place>(BACKOFFICE_BASE, `/places/${id}`, { method: 'PATCH', body }))
}

/** 하위 메뉴까지 연쇄 영구 삭제 (§6) */
export async function deletePlace(id: number): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/places/${id}`, { method: 'DELETE' })
}

export async function deletePlaceTranslation(id: number, language: LanguageCode): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/places/${id}/translations/${language}`, {
    method: 'DELETE',
  })
}

// ── 메뉴 ──

export interface MenuTextWrite {
  language_code: LanguageCode
  name: string
  description: string
}

export interface MenuWrite {
  place_id: number
  image_url: string | null
  price: number
  translations: MenuTextWrite[]
}

export async function fetchMenus(): Promise<Menu[]> {
  return listAll<Menu>('/menus')
}

export async function createMenu(body: MenuWrite): Promise<Menu> {
  return request<Menu>(BACKOFFICE_BASE, '/menus', { method: 'POST', body })
}

export async function updateMenu(id: number, body: Partial<MenuWrite>): Promise<Menu> {
  return request<Menu>(BACKOFFICE_BASE, `/menus/${id}`, { method: 'PATCH', body })
}

export async function deleteMenu(id: number): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/menus/${id}`, { method: 'DELETE' })
}

export async function deleteMenuTranslation(id: number, language: LanguageCode): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/menus/${id}/translations/${language}`, {
    method: 'DELETE',
  })
}

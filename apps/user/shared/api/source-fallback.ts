import 'server-only'
import { getLocale } from '@/shared/i18n/get-locale'
import { SOURCE_LOCALE } from '@/shared/i18n/locales'
import { ApiError } from './server-api'

/** 번역이 빠진 항목을 원문으로 채운 목록. 번역 없는 항목은 목록에서 빠지거나 글자가 null 로 와서, 순서와 빠짐없는 목록은 원문을 따른다 */
export async function listWithSource<T extends { id: number; language_code: unknown }>(
  load: (source: boolean) => Promise<T[]>,
): Promise<T[]> {
  return (await pairWithSource(load)).map(({ item }) => item)
}

/** listWithSource 의 항목마다 한국어 원문을 짝지어 둔 목록. 원문을 그대로 쓴 항목은 item 과 source 가 같은 객체다 */
export async function pairWithSource<T extends { id: number; language_code: unknown }>(
  load: (source: boolean) => Promise<T[]>,
): Promise<{ item: T; source: T }[]> {
  if ((await getLocale()) === SOURCE_LOCALE) {
    return (await load(false)).map((item) => ({ item, source: item }))
  }
  const [translated, source] = await Promise.all([load(false), load(true)])
  // 장소는 번역이 없어도 목록에 오고 language_code 부터 글자까지 전부 null 이다
  const byId = new Map(
    translated.filter((item) => item.language_code).map((item) => [item.id, item]),
  )
  return source.map((item) => ({ item: byId.get(item.id) ?? item, source: item }))
}

/** 한 건을 페이지 언어로, 번역이 없어 404 면 원문으로 받는다. 원문도 없으면 null */
export async function oneWithSource<T>(load: (source: boolean) => Promise<T>): Promise<T | null> {
  const translated = await orNull(() => load(false))
  if (translated || (await getLocale()) === SOURCE_LOCALE) return translated
  return orNull(() => load(true))
}

// 지워졌거나 주소를 잘못 친 id 는 null 로 404 화면에 보내고, 그 밖의 실패는 그대로 던진다
async function orNull<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load()
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

import type { LanguageCode } from './language'

/** Customer 응답 모양: 요청한 한 언어의 번역 필드가 평평하게 붙는다 */
export type Localized<Base, Text> = Base & Text & { language_code: LanguageCode }

/** Customer 응답 중 번역이 없어도 오는 모양(장소): 번역이 없으면 번역 필드와 language_code 가 null */
export type MaybeLocalized<Base, Text> = Base & { [K in keyof Text]: Text[K] | null } & {
  language_code: LanguageCode | null
}

/** Backoffice 번역 한 건: 번역 필드 + 자기 id + 부모 id(`<parent>_id`) */
export type Translation<Text, Parent extends string> = Text & {
  id: number
  language_code: LanguageCode
} & Record<`${Parent}_id`, number>

/** Backoffice 응답 모양: 모든 언어의 번역이 translations 배열로 붙는다 */
export type WithTranslations<Base, Text, Parent extends string> = Base & {
  translations: Translation<Text, Parent>[]
}

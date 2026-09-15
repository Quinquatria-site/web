import { Badge } from '@seed-design/react'
import { missingLanguages, type LanguageCode } from '../../mocks/types'

export interface LangBadgeProps {
  /** 번역 배열. 장소·공연·분실물이 모두 같은 모양을 쓴다 (§5.1) */
  translations: { language_code: LanguageCode }[]
}

/** 번역 상태. 빠진 언어가 있으면 그 언어 사용자에게 이 항목이 안 보인다 (§2.4) */
export function LangBadge({ translations }: LangBadgeProps) {
  const missing = missingLanguages(translations)
  // weak — 목록처럼 같은 배지가 줄줄이 반복되는 자리에 solid 는 너무 시끄럽다
  if (missing.length === 0)
    return (
      <Badge tone="neutral" variant="weak">
        3개 언어
      </Badge>
    )
  return (
    <Badge tone="critical" variant="weak">
      {missing.join('·')} 없음
    </Badge>
  )
}

import { ScreenPlaceholder } from './ScreenPlaceholder'

/**
 * 공지 목록. 상시/일반 세그먼트로 나눈다.
 * 번역이 빠지면 그 언어 사용자에게 공지가 아예 안 보이므로(api.md §2.4)
 * 누락 경고를 가장 세게 주는 화면이다.
 */
export function NoticesRoute() {
  return (
    <ScreenPlaceholder
      title="공지"
      description="GET /api/v1/notices · 상시·일반 목록과 번역 누락 경고가 여기 붙습니다."
    />
  )
}

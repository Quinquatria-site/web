import { ScreenPlaceholder } from './ScreenPlaceholder'

/**
 * 공연 목록. 축제가 이틀이라 날짜가 목록의 1차 축이다.
 * 진행 중인 공연 강조는 API 가 계산해 주지 않으므로 start_at·end_at 을
 * 현재 시각과 클라이언트에서 비교한다.
 */
export function PerformancesRoute() {
  return (
    <ScreenPlaceholder
      title="공연"
      description="GET /api/v1/performances · 날짜별 목록과 진행 중 강조가 여기 붙습니다."
    />
  )
}

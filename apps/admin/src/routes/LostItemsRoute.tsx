import { ScreenPlaceholder } from './ScreenPlaceholder'

/**
 * 분실물 목록. 미반환/반환완료로 나누고 기본은 미반환이다.
 * 현장에서 물건을 든 채 한 손으로 등록하므로 등록 속도가 가장 중요하다.
 */
export function LostItemsRoute() {
  return (
    <ScreenPlaceholder
      title="분실물"
      description="GET /api/v1/lost-items · 미반환 목록과 빠른 등록이 여기 붙습니다."
    />
  )
}

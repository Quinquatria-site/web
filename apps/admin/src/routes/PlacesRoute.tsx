import { ScreenPlaceholder } from './ScreenPlaceholder'

/**
 * 장소 목록. CATEGORY 다섯 종(주점·부스·푸드트럭·의무실·팔찌 수령소)을 모두 다룬다.
 * 카테고리 필터는 칩 가로 스크롤로 둔다 — 430px 에서 세그먼트 다섯 개는 낀다.
 * 메뉴는 별도 탭을 두지 않고 장소 편집 화면 안에서 다룬다.
 */
export function PlacesRoute() {
  return (
    <ScreenPlaceholder
      title="장소"
      description="GET /api/v1/places · 카테고리 칩 필터와 목록이 여기 붙습니다."
    />
  )
}

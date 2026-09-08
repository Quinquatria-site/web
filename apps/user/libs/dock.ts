/** dock 을 화면 아래에서 띄운 높이. 위에 층을 쌓을 때 기준이 된다. */
export const DOCK_GAP = 20
/** dock 한 줄의 높이. 버튼 44 + 위아래 여백 6씩. */
export const DOCK_HEIGHT = 56
/** dock 과 그 위 층 사이 간격. */
export const DOCK_TIER_GAP = 10

export const DOCK_BOTTOM = `calc(${DOCK_GAP}px + env(safe-area-inset-bottom))`
export const DOCK_TIER_BOTTOM = `calc(${DOCK_GAP + DOCK_HEIGHT + DOCK_TIER_GAP}px + env(safe-area-inset-bottom))`

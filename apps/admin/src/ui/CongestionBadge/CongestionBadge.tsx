import { Badge } from '@seed-design/react'
import { CONGESTION_LABEL, type CongestionLevel } from '../../lib/trafficStats'

export interface CongestionBadgeProps {
  level: CongestionLevel
}

/**
 * 학생 앱 접속 혼잡도 배지. 홈 카드와 방문 통계 화면이 같은 모양을 쓴다.
 *
 * 색은 "지금 뭘 해야 하나" 의 크기만큼만 낸다. 한산은 알릴 것이 없어 중립,
 * 보통은 앱이 제대로 쓰이고 있다는 좋은 소식이라 brand, 집중만 warning 이다.
 * critical 은 쓰지 않는다 — 사람이 몰리는 것은 사고가 아니다. 집계 중(판정
 * 불가)은 배지를 그리지 않는다. 문구가 이미 그렇게 말한다.
 */
export function CongestionBadge({ level }: CongestionBadgeProps) {
  if (level === 'unknown') return null
  if (level === 'busy') {
    return (
      <Badge tone="warning" variant="solid">
        {CONGESTION_LABEL.busy}
      </Badge>
    )
  }
  return (
    <Badge tone={level === 'normal' ? 'brand' : 'neutral'} variant="weak">
      {CONGESTION_LABEL[level]}
    </Badge>
  )
}

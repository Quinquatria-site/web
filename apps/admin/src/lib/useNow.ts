import { useEffect, useState } from 'react'

/**
 * 홈의 값 중 일부는 시각에 걸려 있다 (운영 중인 장소, 자정을 넘기는 국면 전환).
 * 가장 촘촘한 경계가 운영 시간의 분 단위라 1분 틱이면 충분하다.
 *
 * frozenAt 이 있으면 틱을 돌리지 않고 그 시각에 고정한다 — QA 의 ?at 이 쓴다.
 * epoch ms 로 받는 이유는 Date 객체를 그대로 받으면 렌더마다 새 객체가 되어
 * effect 가 매번 다시 걸리기 때문이다.
 */
export function useNow(frozenAt: number | null, intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (frozenAt !== null) return
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [frozenAt, intervalMs])

  return frozenAt !== null ? new Date(frozenAt) : now
}

/**
 * "?at=2026-10-06T18:30" → 그 시각(KST). 날짜만 주면 자정으로 읽는다.
 *
 * 실제 날짜를 바꿀 수 없으니 세 국면을 확인할 수단이 필요하다. DEV 가드를
 * 걸지 않는 이유는 QA 를 프리뷰 배포(프로덕션 빌드)에서 하고 데이터가 전부
 * 인메모리 목이라 드러날 것이 없기 때문이다 — 실 API(#10)가 붙을 때 다시 볼 것.
 */
export function parseAtParam(raw: string | null): Date | null {
  if (!raw) return null
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(raw)
  if (!match) return null

  const [, date, hour = '00', minute = '00'] = match
  const parsed = new Date(`${date}T${hour}:${minute}:00+09:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

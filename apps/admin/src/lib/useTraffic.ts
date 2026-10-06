import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, fetchTraffic, type Traffic } from '../api'
import { FESTIVAL_DATES } from '../types'

/**
 * 축제 기간의 학생 앱 방문 통계. 홈의 "학생 앱 방문" 카드와 방문 통계 화면이 쓴다.
 *
 * 기간은 축제 전날 밤(PRE_OPEN_TIME)부터 마지막 날까지다. 전야에 미리 들어와 보는
 * 학생까지 세되, 그 전 며칠의 테스트·준비 조회는 섞지 않는다.
 * 날짜는 FESTIVAL_DATES 한 곳에서 가져와 함수에
 * 넘긴다 — 함수 쪽에 날짜를 또 적으면 두 벌이 되어 한쪽만 고쳐질 수 있다.
 *
 * 다시 불러오는 시점은 기본적으로 useHealth 와 같은 이유로 "화면에 돌아온 순간"
 * 이다. 홈은 그것으로 충분하다.
 *
 * 방문 통계 화면만 `poll` 을 준다. 그 화면은 혼잡도를 지켜보려고 켜 두는
 * 화면이라 돌아오기를 기다리면 숫자가 멈춰 있다. 그래도 보이는 동안만 쏜다.
 * 함수 응답이 CDN 에 1분 캐시되므로 1분보다 잦게 불러도 숫자는 안 바뀐다.
 *
 * 기준 시각은 따로 두지 않는다. `traffic.generatedAt` 이 함수가 Cloudflare 를
 * 부른 시각이라, 캐시된 응답이어도 그 숫자가 언제 것인지 정확히 말한다.
 */

export interface TrafficSnapshot {
  traffic: Traffic | null
  /** 마지막 시도가 실패했으면 그 오류. 이전 값(traffic)은 남겨 둔다 */
  error: ApiError | null
  refresh: () => void
}

const MIN_INTERVAL_MS = 30_000

/** 축제 전날 이 시각(KST)부터 센다 */
const PRE_OPEN_TIME = '21:00'

const DAY_MS = 24 * 60 * 60 * 1000
const FROM = new Date(Date.parse(`${FESTIVAL_DATES[0]}T00:00:00Z`) - DAY_MS)
  .toISOString()
  .slice(0, 10)
const TO = FESTIVAL_DATES[FESTIVAL_DATES.length - 1]

export interface TrafficOptions {
  /** 화면이 보이는 동안 이 간격(ms)으로 다시 부른다. 없으면 폴링하지 않는다 */
  poll?: number
}

export function useTraffic({ poll }: TrafficOptions = {}): TrafficSnapshot {
  const [traffic, setTraffic] = useState<Traffic | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  const lastRunAt = useRef(0)
  const mounted = useRef(true)

  const run = useCallback((force: boolean) => {
    const now = Date.now()
    if (!force && now - lastRunAt.current < MIN_INTERVAL_MS) return
    lastRunAt.current = now

    // setState 는 응답 콜백 안에서만 한다. effect 가 부르는 함수라 동기로 부르면 린트가 막는다
    fetchTraffic(FROM, TO, PRE_OPEN_TIME).then(
      (next) => {
        if (!mounted.current) return
        setTraffic(next)
        setError(null)
      },
      (caught: unknown) => {
        if (!(caught instanceof ApiError)) throw caught
        if (mounted.current) setError(caught)
      },
    )
  }, [])

  useEffect(() => {
    mounted.current = true
    // 강제로 쏘지 않는 이유는 useHealth 의 같은 자리 주석 (StrictMode 이중 effect)
    run(false)

    const onWake = () => {
      if (document.visibilityState === 'visible') run(false)
    }
    window.addEventListener('focus', onWake)
    document.addEventListener('visibilitychange', onWake)
    const timer = poll ? window.setInterval(onWake, poll) : undefined

    return () => {
      mounted.current = false
      window.clearInterval(timer)
      window.removeEventListener('focus', onWake)
      document.removeEventListener('visibilitychange', onWake)
    }
  }, [run, poll])

  const refresh = useCallback(() => run(true), [run])

  return { traffic, error, refresh }
}

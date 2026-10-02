import { useCallback, useEffect, useRef, useState } from 'react'
import { BACKOFFICE_BASE, CUSTOMER_BASE, pingHealth, type HealthResult } from '../api'

/**
 * 두 API 서버가 떠 있는지. 홈의 상태 줄이 쓴다.
 *
 * 폴링하지 않는다. 운영자가 화면을 열어둔 채 다른 일을 하는 시간이 길어서,
 * 주기적으로 쏘면 대부분의 요청이 아무도 안 보는 동안 나간다. 대신 **화면에
 * 돌아온 순간** 다시 확인한다 — 사람이 값을 보는 시점이 그때뿐이다.
 *
 * `focus` 와 `visibilitychange` 를 둘 다 듣는 이유는 둘이 다른 사건이기
 * 때문이다. 탭 전환은 visibilitychange 이고, 다른 창(편집기·터미널)에서
 * 브라우저로 돌아오는 것은 focus 다. 겹쳐 들어오는 것은 아래 간격 제한이 막는다.
 */

export interface HealthSnapshot {
  /** 아직 한 번도 확인하지 않았으면 null */
  backoffice: HealthResult | null
  customer: HealthResult | null
  checkedAt: Date | null
  checking: boolean
  /** 간격 제한을 무시하고 다시 확인한다. "다시 확인" 버튼이 쓴다 */
  refresh: () => void
}

/** 연달아 들어오는 포커스 사건을 한 번으로 묶는다 */
const MIN_INTERVAL_MS = 5_000

/** 주소가 없는 서버는 확인할 것이 없으니 처음부터 답이 정해져 있다 */
function initialResult(base: string | null): HealthResult | null {
  return base ? null : { state: 'unconfigured' }
}

export function useHealth(): HealthSnapshot {
  const [backoffice, setBackoffice] = useState(() => initialResult(BACKOFFICE_BASE))
  const [customer, setCustomer] = useState(() => initialResult(CUSTOMER_BASE))
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)
  const [checking, setChecking] = useState(false)

  const lastRunAt = useRef(0)
  const mounted = useRef(true)

  const run = useCallback(async (force: boolean) => {
    const now = Date.now()
    if (!force && now - lastRunAt.current < MIN_INTERVAL_MS) return
    lastRunAt.current = now

    setChecking(true)
    // 두 서버는 서로 독립이라 함께 보낸다. 하나가 느려도 다른 하나는 먼저 온다
    const [next, nextCustomer] = await Promise.all([
      pingHealth(BACKOFFICE_BASE),
      pingHealth(CUSTOMER_BASE),
    ])
    if (!mounted.current) return

    setBackoffice(next)
    setCustomer(nextCustomer)
    setCheckedAt(new Date())
    setChecking(false)
  }, [])

  useEffect(() => {
    mounted.current = true
    // 첫 확인도 간격 제한을 통과해서 나간다. StrictMode 는 개발에서 effect 를
    // 두 번 걸고(setup → cleanup → setup) 그때 ref 는 살아 있어서, 강제로
    // 쏘면 진입 때마다 요청이 두 번 나간다. 홈으로 잠깐 돌아온 경우도 같다
    void run(false)

    const onWake = () => {
      if (document.visibilityState === 'visible') void run(false)
    }
    window.addEventListener('focus', onWake)
    document.addEventListener('visibilitychange', onWake)

    return () => {
      mounted.current = false
      window.removeEventListener('focus', onWake)
      document.removeEventListener('visibilitychange', onWake)
    }
  }, [run])

  const refresh = useCallback(() => void run(true), [run])

  return { backoffice, customer, checkedAt, checking, refresh }
}

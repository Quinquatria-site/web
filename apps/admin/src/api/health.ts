import { request } from './client'
import { ApiError, ERROR_CODES } from './errors'

/**
 * 서버가 떠 있는지. `GET /api/v1/` 는 두 앱 모두 인증 없이 열려 있고
 * 헬스체크 용도라고 backoffice 라우터가 명시한다 (`PUBLIC_PATHS`).
 *
 * **확인 범위가 좁다.** 핸들러가 `{"message": "Hello World"}` 를 그대로
 * 돌려줄 뿐 DB 를 건드리지 않는다. 그래서 `ok` 는 "프로세스가 떠 있고 라우터가
 * 붙었다" 까지다 — DB 가 정상이라는 뜻이 아니다. 화면 문구도 그 이상을
 * 말하지 않아야 한다.
 */

export type HealthState =
  /** 주소가 설정되지 않았다. 요청을 보내지 않았다 */
  | 'unconfigured'
  | 'ok'
  /** 응답은 왔는데 2xx 가 아니다. 주소는 맞지만 경로나 서버가 잘못됐다 */
  | 'error'
  /** 응답 자체를 못 받았다. 연결 실패·타임아웃·CORS 차단 */
  | 'down'

export interface HealthResult {
  state: HealthState
  /** `error` 일 때의 HTTP 상태 */
  status?: number
  /** 요청에 걸린 시간. `ok` 와 `error` 에만 있다 */
  durationMs?: number
}

/** 사람이 기다려주는 시간. 이보다 느리면 떠 있어도 쓸 수 없다 */
const HEALTH_TIMEOUT_MS = 5_000

export async function pingHealth(base: string | null): Promise<HealthResult> {
  if (!base) return { state: 'unconfigured' }

  const startedAt = performance.now()
  try {
    await request<{ message: string }>(base, '/', { auth: false, timeoutMs: HEALTH_TIMEOUT_MS })
    return { state: 'ok', durationMs: Math.round(performance.now() - startedAt) }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    if (error.code === ERROR_CODES.NETWORK_ERROR) return { state: 'down' }
    return {
      state: 'error',
      status: error.status,
      durationMs: Math.round(performance.now() - startedAt),
    }
  }
}

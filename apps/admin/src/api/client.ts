import { recordApiError } from '../lib/errorLog'
import { apiUrl } from './config'
import { ApiError, isApiErrorBody, NETWORK_ERROR, type ApiErrorBody } from './errors'

/**
 * 모든 API 호출이 지나는 한 지점.
 *
 * 여기 모아두는 것은 세 가지다 — **Bearer 헤더를 붙이는 자리**, **오류 봉투를
 * ApiError 로 바꾸는 자리**, **토큰이 죽었을 때 알리는 자리**. 화면마다 fetch 를
 * 쓰기 시작하면 이 셋이 흩어지고, 그러면 401 처리가 화면마다 달라진다.
 *
 * 쿠키는 쓰지 않는다. 서버 CORS 가 credentials 를 켜지 않았고(§4.3 은 헤더
 * 인증이다) 인증 수단이 Authorization 헤더뿐이라, `credentials` 를 건드리면
 * preflight 만 까다로워진다.
 */

interface ClientHooks {
  /** 요청에 실을 access token. 없으면 null */
  authToken: () => string | null
  /** 401 INVALID_TOKEN 을 받았을 때. 토큰 만료가 유일한 경우다 */
  onUnauthorized: () => void
}

/**
 * 기본값은 "토큰 없음, 아무것도 안 함" 이다.
 *
 * AuthProvider 가 마운트될 때 `configureClient` 로 두 함수를 갈아끼운다.
 * 그 전(로그인 화면)에 나가는 요청은 토큰 없이 나간다 — auth/token 과 헬스체크뿐이다.
 */
const hooks: ClientHooks = {
  authToken: () => null,
  onUnauthorized: () => {},
}

export function configureClient(next: Partial<ClientHooks>): void {
  Object.assign(hooks, next)
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  /** JSON 으로 직렬화해 보낼 본문 */
  body?: unknown
  /** Authorization 헤더를 붙일지. Backoffice 는 auth/token 과 헬스체크만 예외다 */
  auth?: boolean
  /** 기본 10초. 헬스체크처럼 더 짧게 끊고 싶은 곳이 직접 준다 */
  timeoutMs?: number
  signal?: AbortSignal
  /**
   * 실패를 설정 화면의 오류 기록에 남길지. 기본 true.
   * 헬스체크는 끈다 — 서버가 죽어 있으면 창에 돌아올 때마다 한 줄씩 쌓여 기록이
   * 그것으로 가득 찬다. 상태는 홈 상태 줄이 이미 말한다.
   */
  log?: boolean
}

const DEFAULT_TIMEOUT_MS = 10_000

function timeoutSignal(timeoutMs: number, caller?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs)
  return caller ? AbortSignal.any([caller, timeout]) : timeout
}

/**
 * `path` 는 명세에 적힌 그대로 넘긴다 (`apiUrl` 주석 참고).
 *
 * 204 는 본문이 없다. 삭제가 전부 204 라(§5.1) 그때 JSON 파싱을 시도하면
 * 성공한 요청이 오류로 뒤집힌다.
 */
export async function request<T>(
  base: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    log = true,
  } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = hooks.authToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(apiUrl(base, path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: timeoutSignal(timeoutMs, signal),
    })
  } catch (cause) {
    // 연결 실패·타임아웃·CORS 차단이 모두 여기로 온다. 브라우저가 이유를
    // 알려주지 않으므로(보안상 의도된 것이다) 셋을 구분하지 않는다
    const errorBody: ApiErrorBody = {
      code: NETWORK_ERROR,
      message: cause instanceof Error ? cause.message : '요청을 보내지 못했습니다.',
      details: [],
    }
    // 호출부가 스스로 취소한 것(화면을 떠남)은 오류가 아니다
    if (log && !signal?.aborted) recordApiError(method, path, 0, errorBody)
    throw new ApiError(0, errorBody)
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response)
    if (log) recordApiError(method, path, response.status, errorBody)
    throw new ApiError(response.status, errorBody)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  const fallback: ApiErrorBody = {
    code: `HTTP_${response.status}`,
    message: response.statusText,
    details: [],
  }

  let parsed: unknown
  try {
    parsed = await response.json()
  } catch {
    // 서버가 아니라 그 앞단(프록시·게이트웨이)이 만든 응답이면 JSON 이 아니다
    return fallback
  }

  if (!isApiErrorBody(parsed)) return fallback

  const body: ApiErrorBody = {
    code: parsed.code,
    message: parsed.message,
    details: Array.isArray(parsed.details) ? parsed.details : [],
  }

  // 토큰 만료는 어느 화면에서 나든 같은 결말이다 — 로그인 화면으로 보낸다.
  // 발급 코드가 틀린 것(INVALID_CREDENTIALS)은 로그인 화면 자신의 오류라 제외한다
  if (response.status === 401 && body.code === 'INVALID_TOKEN') hooks.onUnauthorized()

  return body
}

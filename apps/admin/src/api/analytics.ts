import { ApiError, isApiErrorBody, NETWORK_ERROR } from './errors'

/**
 * 학생 앱 방문 통계. FastAPI 가 아니라 admin 과 같은 origin 의 Vercel 함수
 * (`api/analytics.ts`)를 부른다 — Cloudflare 토큰을 숨기려고 둔 프록시다.
 *
 * `request()` 를 쓰지 않는 이유: 그것은 외부 base 에 `/api/v1` 을 붙이고 Bearer
 * 토큰을 싣는 FastAPI 전용이다. 여기는 같은 origin 이고 인증도 없다. 실패는
 * 같은 `ApiError` 로 바꿔서 호출부가 한 방식으로 다루게 한다.
 *
 * 로컬 `pnpm dev:admin` 에서는 vite.config.ts 의 devApi 가 같은 함수를 대신
 * 실행한다. CF_* 는 `.env.local` 에서 읽는다.
 */

/** 로딩 시간 백분위(ms). 표본이 없으면 null */
export interface LoadQuantiles {
  p50: number | null
  p75: number | null
  samples: number
}

/**
 * api/analytics.ts 의 응답과 짝이다. tsconfig 가 달라 타입을 양쪽에 둔다.
 * 원자료에 가깝다 — 합계·혼잡도·페이지 이름은 src/lib/trafficStats.ts 가 만든다.
 */
export interface Traffic {
  /** 조회 기간 (KST). 보통 축제 이틀 */
  range: { from: string; to: string }
  /** 함수가 본 KST 오늘. 축제 밖이어도 "지금" 은 이 날 기준이다 */
  today: string
  /** 함수가 Cloudflare 를 부른 시각 (ISO). CDN 캐시 때문에 최대 1분 전일 수 있다 */
  generatedAt: string
  /** 15분 칸 (시작 시각 ISO, UTC). 조회 기간 + 오늘. 0 인 칸은 없다 */
  buckets: { start: string; pageViews: number; visits: number }[]
  /** 조회 기간 요청 경로별 조회. `/ko/notices/3` 처럼 원시 경로다 */
  paths: { path: string; pageViews: number }[]
  /** 조회 기간 외부 유입 host 별 방문. `''` 은 출처 없음 */
  referrers: { host: string; visits: number }[]
  performance: {
    today: LoadQuantiles
    /** 최근 30분 */
    recent: Omit<LoadQuantiles, 'p50'>
  }
}

/** Cloudflare 환경변수가 없을 때 함수가 주는 코드. 화면이 따로 안내한다 */
export const ANALYTICS_UNCONFIGURED = 'ANALYTICS_UNCONFIGURED'

const TIMEOUT_MS = 15_000

export async function fetchTraffic(from: string, to: string): Promise<Traffic> {
  const query = new URLSearchParams({ from, to })
  let res: Response
  try {
    res = await fetch(`/api/analytics?${query}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch {
    throw new ApiError(0, { code: NETWORK_ERROR, message: 'network error', details: [] })
  }

  const isJson = res.headers.get('content-type')?.includes('application/json') ?? false
  const body: unknown = isJson ? await res.json().catch(() => null) : null
  if (!res.ok) {
    throw new ApiError(
      res.status,
      isApiErrorBody(body)
        ? { ...body, details: body.details ?? [] }
        : { code: `HTTP_${res.status}`, message: res.statusText, details: [] },
    )
  }
  // 200 인데 통계가 아닌 경우를 여기서 끊는다. 함수가 안 돌고 다른 것이 대답하면
  // (vite 가 소스를 JS 로 내려줌, rewrite 가 index.html 을 줌) 상태는 200 이라
  // 위에서 걸리지 않는다. 그대로 넘기면 화면이 "불러오는 중" 에 멈춘다
  if (!isTraffic(body)) {
    throw new ApiError(res.status, {
      code: UNEXPECTED_RESPONSE,
      message: `not traffic JSON (${res.headers.get('content-type') ?? 'no content-type'})`,
      details: [],
    })
  }
  return body
}

/** 200 인데 본문이 통계가 아닐 때. 클라이언트가 만드는 코드다 */
const UNEXPECTED_RESPONSE = 'UNEXPECTED_RESPONSE'

function isTraffic(value: unknown): value is Traffic {
  if (typeof value !== 'object' || value === null) return false
  const traffic = value as Partial<Traffic>
  return (
    typeof traffic.today === 'string' &&
    Array.isArray(traffic.buckets) &&
    Array.isArray(traffic.paths) &&
    Array.isArray(traffic.referrers) &&
    typeof traffic.performance === 'object'
  )
}

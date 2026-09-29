/**
 * 학생 앱 방문 통계. Cloudflare Web Analytics 를 대신 불러 주는 얇은 프록시다.
 *
 * Vercel 이 `api/` 의 파일을 서버리스 함수로 배포해 `/api/analytics` 에 건다.
 * 여기 있는 이유는 하나다 — Cloudflare GraphQL API 는 비밀 토큰이 필요하고
 * 브라우저 호출(CORS)도 막혀 있어서, admin SPA 가 직접 부를 수 없다. 토큰은
 * 이 함수의 환경변수에만 있고 브라우저로는 집계 숫자만 나간다.
 *
 * DB·비즈니스 규칙은 없다. 그런 것은 FastAPI 몫이다 (CLAUDE.md "금지").
 * 이 함수도 판단하지 않는다 — 혼잡도·페이지 이름 같은 해석은 화면 쪽
 * (src/lib/trafficStats.ts)이 한다. 여기는 원자료를 모아 모양만 정리한다.
 *
 * **인증하지 않는다.** admin 로그인이 아직 목(src/auth/verifyPassword.ts)이라
 * 확인할 토큰이 없다. 주소를 알면 누구나 부를 수 있지만 내보내는 것이
 * 페이지뷰·방문 집계뿐이라 받아들인다. 실제 인증이 붙으면 여기서도 확인한다.
 *
 * 응답 모양은 src/api/analytics.ts 의 `Traffic` 과 짝이다. tsconfig 가 달라
 * (여기는 Node, 저기는 브라우저) 타입을 공유하지 않고 양쪽에 둔다.
 */

const GRAPHQL_URL = 'https://api.cloudflare.com/client/v4/graphql'

/** 한 번에 볼 수 있는 기간. 15분 칸이 하루 96개라 이보다 길면 행이 너무 많다 */
const MAX_DAYS = 31

/** 페이지는 화면이 이름으로 묶으므로 넉넉히 받는다. 공지·분실물 상세가 id 마다 따로 온다 */
const PATH_LIMIT = 200
const REFERRER_LIMIT = 50

/** "지금" 로딩 속도를 볼 창. 15분 칸 둘 — 하나만 보면 표본이 너무 적다 */
const RECENT_PERF_MS = 30 * 60 * 1000

/** 날짜는 KST 로 자른다. Cloudflare 의 date 는 UTC 라 그대로 쓰면 자정~오전 9시가 전날로 간다 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

interface Quantiles {
  p50: number | null
  p75: number | null
  samples: number
}

interface Traffic {
  range: { from: string; to: string }
  today: string
  generatedAt: string
  buckets: { start: string; pageViews: number; visits: number }[]
  paths: { path: string; pageViews: number }[]
  referrers: { host: string; visits: number }[]
  performance: { today: Quantiles; recent: Omit<Quantiles, 'p50'> }
}

interface BucketRow {
  count: number
  sum: { visits: number }
  dimensions: { datetimeFifteenMinutes: string }
}

interface PerfRow {
  count: number
  quantiles: { pageLoadTimeP50: number | null; pageLoadTimeP75: number | null }
}

interface GraphQLResponse {
  data?: {
    viewer?: {
      accounts?: {
        rangeBuckets: BucketRow[]
        todayBuckets: BucketRow[]
        paths: { count: number; dimensions: { requestPath: string } }[]
        referrers: {
          sum: { visits: number }
          dimensions: { refererHost: string; requestHost: string }
        }[]
        perfToday: PerfRow[]
        perfRecent: PerfRow[]
      }[]
    }
  }
  errors?: unknown[] | null
}

// 15분 칸으로 받는다. 혼잡도는 15분 단위로 판단하고, 일별 합계도 여기서 KST 로 다시 묶는다.
// 축제 기간과 오늘을 따로 받는 이유: 축제 전·후에도 "지금" 을 보여야 하는데, 둘을 한
// 구간으로 이으면 사이의 날들까지 불필요하게 받는다
const QUERY = `
query (
  $accountTag: string!, $siteTag: string!,
  $rangeStart: Time!, $rangeEnd: Time!,
  $todayStart: Time!, $todayEnd: Time!,
  $recentStart: Time!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      rangeBuckets: rumPageloadEventsAdaptiveGroups(
        limit: 5000
        filter: { siteTag: $siteTag, datetime_geq: $rangeStart, datetime_lt: $rangeEnd }
      ) { count sum { visits } dimensions { datetimeFifteenMinutes } }
      todayBuckets: rumPageloadEventsAdaptiveGroups(
        limit: 100
        filter: { siteTag: $siteTag, datetime_geq: $todayStart, datetime_lt: $todayEnd }
      ) { count sum { visits } dimensions { datetimeFifteenMinutes } }
      paths: rumPageloadEventsAdaptiveGroups(
        limit: ${PATH_LIMIT}
        filter: { siteTag: $siteTag, datetime_geq: $rangeStart, datetime_lt: $rangeEnd }
        orderBy: [count_DESC]
      ) { count dimensions { requestPath } }
      referrers: rumPageloadEventsAdaptiveGroups(
        limit: ${REFERRER_LIMIT}
        filter: { siteTag: $siteTag, datetime_geq: $rangeStart, datetime_lt: $rangeEnd }
        orderBy: [sum_visits_DESC]
      ) { sum { visits } dimensions { refererHost requestHost } }
      perfToday: rumPerformanceEventsAdaptiveGroups(
        limit: 1
        filter: { siteTag: $siteTag, datetime_geq: $todayStart, datetime_lt: $todayEnd }
      ) { count quantiles { pageLoadTimeP50 pageLoadTimeP75 } }
      perfRecent: rumPerformanceEventsAdaptiveGroups(
        limit: 1
        filter: { siteTag: $siteTag, datetime_geq: $recentStart, datetime_lt: $todayEnd }
      ) { count quantiles { pageLoadTimeP50 pageLoadTimeP75 } }
    }
  }
}`

/** admin 의 ApiError 봉투(§2.6)와 같은 모양으로 돌려준다. 호출부가 한 방식으로 다루게 */
function fail(status: number, code: string, message: string): Response {
  return Response.json(
    { code, message, details: [] },
    { status, headers: { 'Cache-Control': 'no-store' } },
  )
}

/** "2026-10-07" 의 KST 자정을 UTC 밀리초로 */
function kstMidnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) - KST_OFFSET_MS
}

function kstDate(ms: number): string {
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 10)
}

const iso = (ms: number) => new Date(ms).toISOString()

/** 표본이 없으면 Cloudflare 는 행을 주지 않거나 0 을 준다. 둘 다 "모름" 으로 */
function quantiles(rows: PerfRow[]): Quantiles {
  const row = rows[0]
  if (!row || row.count === 0) return { p50: null, p75: null, samples: 0 }
  return {
    p50: row.quantiles.pageLoadTimeP50,
    p75: row.quantiles.pageLoadTimeP75,
    samples: row.count,
  }
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''

  if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
    return fail(400, 'INVALID_PARAMETER', 'from, to 는 YYYY-MM-DD 여야 합니다.')
  }
  const rangeStart = kstMidnight(from)
  const rangeEnd = kstMidnight(to) + DAY_MS
  const days = (rangeEnd - rangeStart) / DAY_MS
  if (Number.isNaN(days) || days < 1 || days > MAX_DAYS) {
    return fail(400, 'INVALID_PARAMETER', `from <= to, 최대 ${MAX_DAYS}일이어야 합니다.`)
  }

  const token = process.env.CF_API_TOKEN
  const accountTag = process.env.CF_ACCOUNT_ID
  const siteTag = process.env.CF_SITE_TAG
  if (!token || !accountTag || !siteTag) {
    return fail(503, 'ANALYTICS_UNCONFIGURED', 'Cloudflare 환경변수가 설정되지 않았습니다.')
  }

  const now = Date.now()
  const today = kstDate(now)
  const todayStart = kstMidnight(today)

  let body: GraphQLResponse | undefined
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          accountTag,
          siteTag,
          rangeStart: iso(rangeStart),
          rangeEnd: iso(rangeEnd),
          todayStart: iso(todayStart),
          todayEnd: iso(todayStart + DAY_MS),
          recentStart: iso(now - RECENT_PERF_MS),
        },
      }),
      signal: AbortSignal.timeout(10_000),
    })
    body = (await res.json()) as GraphQLResponse
    if (!res.ok || body.errors?.length) throw new Error(`upstream ${res.status}`)
  } catch (error) {
    // 원문은 로그에만 남긴다. 토큰·계정 정보가 섞일 수 있어 응답에 싣지 않는다
    console.error('[analytics]', error, body?.errors ?? null)
    return fail(502, 'ANALYTICS_UPSTREAM', 'Cloudflare 응답을 받지 못했습니다.')
  }

  const account = body?.data?.viewer?.accounts?.[0]

  // 오늘이 축제 기간 안이면 두 목록이 같은 칸을 갖는다. 시작 시각으로 한 번만 센다
  const buckets = new Map<string, Traffic['buckets'][number]>()
  for (const row of [...(account?.rangeBuckets ?? []), ...(account?.todayBuckets ?? [])]) {
    const start = row.dimensions.datetimeFifteenMinutes
    if (row.count === 0 || buckets.has(start)) continue
    buckets.set(start, { start, pageViews: row.count, visits: row.sum.visits })
  }

  // 앱 안에서 페이지를 옮긴 것은 유입이 아니다. 출처가 자기 자신인 행은 버린다
  const referrers = (account?.referrers ?? [])
    .filter(
      (row) => row.sum.visits > 0 && row.dimensions.refererHost !== row.dimensions.requestHost,
    )
    .map((row) => ({ host: row.dimensions.refererHost, visits: row.sum.visits }))

  const recent = quantiles(account?.perfRecent ?? [])
  const traffic: Traffic = {
    range: { from, to },
    today,
    generatedAt: iso(now),
    buckets: [...buckets.values()].sort((a, b) => a.start.localeCompare(b.start)),
    paths: (account?.paths ?? []).map((row) => ({
      path: row.dimensions.requestPath,
      pageViews: row.count,
    })),
    referrers,
    performance: {
      today: quantiles(account?.perfToday ?? []),
      recent: { p75: recent.p75, samples: recent.samples },
    },
  }

  // 운영진 여럿이 열어도 Cloudflare 호출은 CDN 캐시로 분당 한 번 수준에 그친다
  return Response.json(traffic, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  })
}

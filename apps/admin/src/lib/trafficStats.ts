import { ANALYTICS_UNCONFIGURED, type ApiError, type Traffic, type VitalRating } from '../api'
import { kstDateString } from './festivalTime'
import {
  describeStudentPath,
  OTHER_PAGE,
  STUDENT_LOCALES,
  type StudentLocale,
} from './studentPages'

/**
 * 방문 통계 원자료(`Traffic`)를 화면이 쓰는 숫자로 바꾼다. React 없이 순수 함수만.
 *
 * 해석은 전부 여기 있다. 서버 함수(api/analytics.ts)는 Cloudflare 에서 받은
 * 것을 모양만 정리하고, "몰린다" 의 기준이나 페이지 이름 같은 판단은 하지 않는다.
 * 기준을 바꿀 일이 생기면 이 파일의 상수만 보면 된다.
 */

type Bucket = Traffic['buckets'][number]

const SLOT_MS = 15 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
export const SLOTS_PER_DAY = 96
const KST_OFFSET_MS = 9 * 60 * 60 * 1000

// ── 일별 ───────────────────────────────────────────────────────────────

export interface DailyTotal {
  date: string
  pageViews: number
  visits: number
}

/**
 * 날짜별 합계 (KST). 방문이 없는 날도 0 으로 한 줄 세운다 — 화면이 일차마다 같은 자리를 갖게.
 *
 * since(ISO)를 주면 그보다 이른 칸은 뺀다. 칸에는 조회 기간 말고도 "오늘" 하루 전체가
 * 섞여 오므로, 첫날을 밤부터 세는 기간이면 이것 없이는 첫날 낮 조회까지 더해진다.
 */
export function dailyTotals(
  buckets: Bucket[],
  dates: readonly string[],
  since?: string,
): DailyTotal[] {
  const totals = new Map(dates.map((date) => [date, { date, pageViews: 0, visits: 0 }]))
  const sinceMs = since ? Date.parse(since) : -Infinity
  for (const bucket of buckets) {
    if (Date.parse(bucket.start) < sinceMs) continue
    const total = totals.get(kstDateString(new Date(bucket.start)))
    if (!total) continue
    total.pageViews += bucket.pageViews
    total.visits += bucket.visits
  }
  return [...totals.values()]
}

/** from~to (YYYY-MM-DD, 양 끝 포함)의 날짜 목록. 조회 기간의 날마다 한 줄씩 세우는 데 쓴다 */
export function rangeDates(from: string, to: string): string[] {
  const dates: string[] = []
  for (
    let ms = Date.parse(`${from}T00:00:00Z`);
    ms <= Date.parse(`${to}T00:00:00Z`);
    ms += DAY_MS
  ) {
    dates.push(new Date(ms).toISOString().slice(0, 10))
  }
  return dates
}

/** KST 하루를 15분 칸 96개로. 칸 i 는 00:00 + 15분 × i */
export function daySeries(buckets: Bucket[], date: string): number[] {
  const series = new Array<number>(SLOTS_PER_DAY).fill(0)
  const dayStart = Date.parse(`${date}T00:00:00Z`) - KST_OFFSET_MS
  for (const bucket of buckets) {
    const slot = Math.floor((Date.parse(bucket.start) - dayStart) / SLOT_MS)
    if (slot >= 0 && slot < SLOTS_PER_DAY) series[slot] += bucket.pageViews
  }
  return series
}

// ── 혼잡도 ─────────────────────────────────────────────────────────────

/**
 * Cloudflare 집계가 늦게 들어오는 만큼 기다린다. 막 끝난 칸은 아직 덜 찬
 * 상태라 그대로 보면 늘 "한산" 으로 떨어진다. 끝난 지 이만큼 지난 칸을 "지금" 으로 본다.
 */
const REPORTING_LAG_MS = 5 * 60 * 1000

/**
 * 최고치가 이보다 작으면 판정하지 않는다. 첫 방문이 들어온 칸은 그 자체로
 * 최고치라 비율이 100% — 조회 3회에 "집중" 을 띄우게 된다.
 */
const MIN_PEAK = 20

/**
 * 기준은 절대 숫자가 아니라 **지금까지의 최고 15분** 대비 비율이다. 축제에
 * 몇 명이 올지 미리 알 수 없어서 "몇 회부터 혼잡" 을 정할 근거가 없다. 최고치와
 * 비교하면 기준이 스스로 맞춰지고, 이틀째에는 첫날 피크와도 비교된다.
 */
const BUSY_RATIO = 0.7
const NORMAL_RATIO = 0.3

export type CongestionLevel = 'quiet' | 'normal' | 'busy' | 'unknown'

export const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  quiet: '한산',
  normal: '보통',
  busy: '집중',
  unknown: '집계 중',
}

export interface Congestion {
  level: CongestionLevel
  /** 판정에 쓴 칸의 조회수 */
  recent: number
  /** 그 칸의 시작 시각 */
  recentAt: Date
  /** 응답 전체(조회 기간 + 오늘)에서 가장 많았던 15분 */
  peak: number
  peakAt: Date | null
  /** recent / peak. 판정하지 않으면 null */
  ratio: number | null
}

export function congestion(buckets: Bucket[], now: Date): Congestion {
  const lastEnd = Math.floor((now.getTime() - REPORTING_LAG_MS) / SLOT_MS) * SLOT_MS
  const recentStart = lastEnd - SLOT_MS

  let recent = 0
  let peak = 0
  let peakAt: Date | null = null
  for (const bucket of buckets) {
    const start = Date.parse(bucket.start)
    if (start === recentStart) recent = bucket.pageViews
    if (bucket.pageViews > peak) {
      peak = bucket.pageViews
      peakAt = new Date(start)
    }
  }

  const base = { recent, recentAt: new Date(recentStart), peak, peakAt }
  if (peak < MIN_PEAK) return { ...base, level: 'unknown', ratio: null }

  const ratio = recent / peak
  const level = ratio >= BUSY_RATIO ? 'busy' : ratio >= NORMAL_RATIO ? 'normal' : 'quiet'
  return { ...base, level, ratio }
}

// ── 체감 속도 (Web Vitals) ──────────────────────────────────────────────

/** 최근 30분 표본이 이보다 적으면 몇 명의 느린 폰이 전체를 대표하게 된다 */
const MIN_RECENT_SAMPLES = 10
/** Google 이 LCP "나쁨" 으로 보는 선. 평소보다 느려도 이보다 빠르면 말하지 않는다 */
const SLOW_LCP_MS = 4_000
/** 오늘 전체 대비 이만큼 느려야 "평소보다" 라고 할 수 있다 */
const SLOW_FACTOR = 1.5

/**
 * 현장 접속이 느린가. 학생 앱은 정적 CDN 이라 서버가 버거워질 일은 거의 없고,
 * 실제로 막히는 것은 사람이 몰린 곳의 모바일 망이다. 그 신호가 화면이 뜨는 시간(LCP)이다.
 */
export function slowLoading(vitals: Traffic['vitals']): boolean {
  const { recent, today } = vitals
  if (recent.samples < MIN_RECENT_SAMPLES || recent.lcp === null || today.lcp === null) return false
  return recent.lcp >= SLOW_LCP_MS && recent.lcp >= today.lcp * SLOW_FACTOR
}

export type VitalGrade = 'good' | 'needsImprovement' | 'poor'

export const VITAL_GRADE_LABEL: Record<VitalGrade, string> = {
  good: '좋음',
  needsImprovement: '개선 필요',
  poor: '나쁨',
}

/** Google Core Web Vitals 기준. [좋음 상한, 개선 필요 상한] — Cloudflare 의 good·poor 건수와 같은 선이다 */
const VITAL_LIMITS = {
  lcp: [2_500, 4_000],
  inp: [200, 500],
  cls: [0.1, 0.25],
} as const

export function vitalGrade(metric: keyof typeof VITAL_LIMITS, value: number): VitalGrade {
  const [good, poor] = VITAL_LIMITS[metric]
  return value <= good ? 'good' : value <= poor ? 'needsImprovement' : 'poor'
}

const ratingTotal = (rating: VitalRating) => rating.good + rating.needsImprovement + rating.poor

/** 페이지별 판정은 표본이 이보다 적으면 보여 주지 않는다. 한두 명의 폰이 비율을 정해 버린다 */
const MIN_PAGE_SAMPLES = 10

export interface PageSpeed {
  name: string
  samples: number
  /** 0~1 */
  goodShare: number
  poorShare: number
}

/**
 * 페이지 이름별 LCP 판정 비율. P75 는 경로끼리 더할 수 없어 건수로 묶는다.
 * 나쁨이 많은 순 — 고칠 곳이 위로 오게. 표본이 적은 페이지와 "기타" 는 뺀다
 */
export function pageSpeeds(pages: Traffic['vitals']['pages']): PageSpeed[] {
  const ratings = new Map<string, VitalRating>()
  for (const row of pages) {
    const { page } = describeStudentPath(row.path)
    if (page === OTHER_PAGE) continue
    const sum = ratings.get(page) ?? { good: 0, needsImprovement: 0, poor: 0 }
    sum.good += row.lcpRating.good
    sum.needsImprovement += row.lcpRating.needsImprovement
    sum.poor += row.lcpRating.poor
    ratings.set(page, sum)
  }
  return [...ratings]
    .map(([name, rating]) => {
      const samples = ratingTotal(rating)
      return {
        name,
        samples,
        goodShare: samples > 0 ? rating.good / samples : 0,
        poorShare: samples > 0 ? rating.poor / samples : 0,
      }
    })
    .filter((row) => row.samples >= MIN_PAGE_SAMPLES)
    .sort((a, b) => b.poorShare - a.poorShare || b.samples - a.samples)
}

// ── 페이지 · 언어 ───────────────────────────────────────────────────────

export interface NamedCount {
  name: string
  count: number
}

function sortedCounts(map: Map<string, number>): NamedCount[] {
  return [...map].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

/** 페이지 이름별 조회. 언어와 글 번호를 지워 "공지 상세" 하나로 묶는다. "기타" 는 맨 뒤 */
export function pageGroups(paths: Traffic['paths']): NamedCount[] {
  const counts = new Map<string, number>()
  for (const row of paths) {
    const { page } = describeStudentPath(row.path)
    counts.set(page, (counts.get(page) ?? 0) + row.pageViews)
  }
  const sorted = sortedCounts(counts)
  return [
    ...sorted.filter((row) => row.name !== OTHER_PAGE),
    ...sorted.filter((row) => row.name === OTHER_PAGE),
  ]
}

export interface LocaleShare {
  locale: StudentLocale
  pageViews: number
  /** 0~1. 조회가 없으면 0 */
  share: number
}

/** 언어별 조회 비율. 순서는 학생 앱 LOCALES 순서 그대로 — 많은 순으로 섞지 않는다 */
export function localeShares(paths: Traffic['paths']): LocaleShare[] {
  const counts = new Map<StudentLocale, number>(STUDENT_LOCALES.map((code) => [code, 0]))
  for (const row of paths) {
    const { locale } = describeStudentPath(row.path)
    counts.set(locale, (counts.get(locale) ?? 0) + row.pageViews)
  }
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
  return STUDENT_LOCALES.map((locale) => {
    const pageViews = counts.get(locale) ?? 0
    return { locale, pageViews, share: total > 0 ? pageViews / total : 0 }
  })
}

/** 처음 들어온 페이지 중 따로 보여 줄 개수. 나머지는 "기타" 로 합친다 */
const TOP_LANDINGS = 8

/**
 * 처음 들어온 페이지별 방문. 언어는 지우고 상세 번호는 남긴다 — 부스 QR 이
 * `/map/12` 를 가리키면 "장소 상세 12" 한 줄이 그 QR 로 들어온 사람 수다.
 * 모달·앱 안 이동은 방문이 아니라 여기에 섞이지 않는다
 */
export function landingGroups(landings: Traffic['landings']): NamedCount[] {
  const counts = new Map<string, number>()
  for (const row of landings) {
    const { page, id } = describeStudentPath(row.path)
    const name = id ? `${page} ${id}` : page
    counts.set(name, (counts.get(name) ?? 0) + row.visits)
  }
  const sorted = sortedCounts(counts)
  const named = sorted.filter((row) => row.name !== OTHER_PAGE)
  const other = sorted.find((row) => row.name === OTHER_PAGE)?.count ?? 0
  const rest = named.slice(TOP_LANDINGS).reduce((sum, row) => sum + row.count, other)
  return [...named.slice(0, TOP_LANDINGS), ...(rest > 0 ? [{ name: OTHER_PAGE, count: rest }] : [])]
}

// ── 유입 경로 ───────────────────────────────────────────────────────────

/**
 * QR 을 찍거나 주소를 직접 치면 출처가 비고, 인스타그램 같은 인앱 브라우저도
 * 출처를 지우는 일이 많다. 그래서 이 줄이 가장 크게 나오는 것이 정상이다.
 */
export const DIRECT_REFERRER = '직접 접속'

/** host 끝부분 → 이름. 위에서부터 처음 맞는 것 */
const REFERRER_NAMES: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, '인스타그램'],
  [/(^|\.)hufs\.ac\.kr$/, '학교 홈페이지'],
  [/(^|\.)(kakao\.com|kakao\.co\.kr|daum\.net)$/, '카카오·다음'],
  [/(^|\.)naver\.(com|net)$/, '네이버'],
  [/(^|\.)google\.[a-z.]+$/, '구글'],
  [/(^|\.)(facebook\.com|fb\.com)$/, '페이스북'],
  [/(^|\.)(x\.com|t\.co|twitter\.com)$/, 'X'],
]

const TOP_REFERRERS = 6
export const OTHER_REFERRER = '기타'

function referrerName(host: string): string {
  if (!host) return DIRECT_REFERRER
  return REFERRER_NAMES.find(([pattern]) => pattern.test(host))?.[1] ?? host
}

/** 유입 경로별 방문. 같은 이름(l.instagram.com, instagram.com)은 합치고 상위 6 + 기타 */
export function referrerGroups(referrers: Traffic['referrers']): NamedCount[] {
  const counts = new Map<string, number>()
  for (const row of referrers) {
    const name = referrerName(row.host)
    counts.set(name, (counts.get(name) ?? 0) + row.visits)
  }
  const sorted = sortedCounts(counts)
  if (sorted.length <= TOP_REFERRERS + 1) return sorted
  const rest = sorted.slice(TOP_REFERRERS).reduce((sum, row) => sum + row.count, 0)
  return [...sorted.slice(0, TOP_REFERRERS), { name: OTHER_REFERRER, count: rest }]
}

// ── 표시 ───────────────────────────────────────────────────────────────

export const formatCount = (value: number) => value.toLocaleString('ko-KR')

/** 1234 → "1.2초". 표본이 없으면 "—" */
export function formatSeconds(ms: number | null): string {
  return ms === null ? '—' : `${(ms / 1000).toFixed(1)}초`
}

/** 0.4 → "40%" */
export const formatShare = (share: number) => `${Math.round(share * 100)}%`

/**
 * 숫자가 없을 때 카드가 할 말. 홈과 방문 통계 화면이 같은 문장을 쓴다.
 * 미설정은 운영진이 아니라 개발자가 고칠 일이라 어디를 봐야 하는지까지 적는다.
 */
export function trafficUnavailableText(error: ApiError | null): string {
  if (!error) return '불러오는 중…'
  if (error.code === ANALYTICS_UNCONFIGURED) {
    return 'Cloudflare 환경변수가 설정되지 않았습니다 (Vercel admin 프로젝트).'
  }
  return '방문 통계를 불러오지 못했습니다.'
}

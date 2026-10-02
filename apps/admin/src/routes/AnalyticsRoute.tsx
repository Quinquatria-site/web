import type { ReactNode } from 'react'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { ListHeader } from 'seed-design/ui/list-header'
import { kstDateString, kstTimeString } from '../lib/festivalTime'
import { STUDENT_LOCALE_LABEL } from '../lib/studentPages'
import {
  CONGESTION_LABEL,
  congestion,
  dailyTotals,
  daySeries,
  DIRECT_REFERRER,
  formatCount,
  formatSeconds,
  formatShare,
  landingGroups,
  localeShares,
  pageGroups,
  pageSpeeds,
  rangeDates,
  referrerGroups,
  slowLoading,
  SLOTS_PER_DAY,
  trafficUnavailableText,
  VITAL_GRADE_LABEL,
  vitalGrade,
} from '../lib/trafficStats'
import { useTraffic } from '../lib/useTraffic'
import { festivalDateLabel, festivalDayLabel, FESTIVAL_DATES } from '../mocks/types'
import { CongestionBadge, Meter, MeterGroup, TimeChart } from '../ui'
import styles from './AnalyticsRoute.module.css'

/** 함수 응답이 CDN 에 1분 캐시되므로 그보다 잦게 불러도 숫자가 안 바뀐다 */
const POLL_MS = 60_000

const SLOT_MINUTES = 15
/** 눈금은 3시간마다. 폰 폭에 00·03·…·24 아홉 개가 겹치지 않고 들어간다 */
const TICK_EVERY = (3 * 60) / SLOT_MINUTES

/**
 * 학생 앱 방문 통계. 홈의 "학생 앱 방문" 줄을 누르면 온다.
 *
 * 위에서부터 "지금" → "오늘" → "조회 기간 전체" 순이다. 운영 중에 이 화면을
 * 여는 이유는 대부분 첫 카드(지금 몰리나) 하나라 그것을 맨 위에 둔다. 나머지는
 * 축제가 끝난 뒤 돌아볼 때 쓰는 숫자다.
 *
 * 켜 두고 지켜보는 화면이라 보이는 동안 1분마다 다시 부른다 (useTraffic 주석).
 *
 * 숫자의 출처는 Cloudflare Web Analytics 다. 서버 부하가 아니라 학생 폰에서
 * 페이지가 열린 횟수이고, 몇 분 늦게 들어온다. 화면 문구도 그 이상을 말하지 않는다.
 * 기준값(한산·보통·집중, 느림)은 src/lib/trafficStats.ts 에 이유와 함께 있다.
 */
export function AnalyticsRoute() {
  const { traffic, error, refresh } = useTraffic({ poll: POLL_MS })

  if (!traffic) {
    return (
      <div className={styles.screen}>
        <section className={styles.section}>
          <p className={styles.empty}>{trafficUnavailableText(error)}</p>
        </section>
      </div>
    )
  }

  const now = new Date(traffic.generatedAt)
  const current = congestion(traffic.buckets, now)
  const slow = slowLoading(traffic.vitals)

  const series = daySeries(traffic.buckets, traffic.today)
  const todayPeak = Math.max(...series)
  const todayPeakSlot = series.indexOf(todayPeak)
  const nowSlot = slotOf(now)

  // 조회 기간은 useTraffic 이 정한다 (지금은 축제 전 며칠을 임시로 포함)
  const days = dailyTotals(traffic.buckets, rangeDates(traffic.range.from, traffic.range.to))
  const maxDayVisits = Math.max(0, ...days.map((day) => day.visits))
  const pages = pageGroups(traffic.paths)
  const locales = localeShares(traffic.paths)
  const landings = landingGroups(traffic.landings)
  const referrers = referrerGroups(traffic.referrers)
  const { today: vitalsToday, recent: vitalsRecent } = traffic.vitals
  const speeds = pageSpeeds(traffic.vitals.pages)

  return (
    <div className={styles.screen}>
      <Card title="지금 혼잡도">
        <div className={styles.now}>
          <span className={styles.level}>{CONGESTION_LABEL[current.level]}</span>
          <CongestionBadge level={current.level} />
        </div>
        <p className={styles.line}>{`최근 15분 조회 ${formatCount(current.recent)}회`}</p>
        <p className={styles.line}>{peakLine(current, traffic.today)}</p>
        {slow && (
          <div className={styles.callout}>
            <Callout
              tone="warning"
              title="현장에서 페이지가 평소보다 느리게 열립니다."
              description={`최근 30분 화면 표시 P75 ${formatSeconds(vitalsRecent.lcp)} · 오늘 평소 ${formatSeconds(vitalsToday.lcp)}`}
            />
          </div>
        )}
        <p className={styles.note}>
          학생 폰에서 페이지가 열린 횟수입니다. 서버 부하가 아니며, 5~10분 늦게 반영됩니다.
        </p>
      </Card>

      <Card title="오늘 15분 흐름" count={`조회 ${formatCount(sum(series))}`}>
        <TimeChart
          values={series}
          futureFrom={nowSlot + 1}
          timeOf={slotTime}
          tickEvery={TICK_EVERY}
          tickLabel={(slot) => String((slot * SLOT_MINUTES) / 60).padStart(2, '0')}
          valueName="조회"
          summary={
            todayPeak > 0
              ? `오늘 15분마다의 조회. 가장 붐빈 시간 ${slotTime(todayPeakSlot)}, ${formatCount(todayPeak)}회`
              : '오늘은 아직 조회가 없습니다.'
          }
        />
        {todayPeak === 0 && <p className={styles.line}>오늘은 아직 조회가 없습니다.</p>}
      </Card>

      <Card
        title="날짜별 방문"
        count={`${festivalDateLabel(traffic.range.from)} ~ ${festivalDateLabel(traffic.range.to)}`}
      >
        <MeterGroup>
          {days.map((day) => (
            <Meter
              key={day.date}
              label={dayLabel(day.date)}
              value={day.visits}
              max={maxDayVisits}
              valueLabel={`방문 ${formatCount(day.visits)} · 조회 ${formatCount(day.pageViews)}`}
            />
          ))}
        </MeterGroup>
      </Card>

      <Card title="페이지별 조회">
        {pages.length === 0 ? (
          <p className={styles.empty}>이 기간 조회가 아직 없습니다.</p>
        ) : (
          <MeterGroup>
            {pages.map((page) => (
              <Meter
                key={page.name}
                label={page.name}
                value={page.count}
                max={pages[0].count}
                valueLabel={formatCount(page.count)}
              />
            ))}
          </MeterGroup>
        )}
      </Card>

      <Card title="처음 들어온 페이지">
        {landings.length === 0 ? (
          <p className={styles.empty}>이 기간 방문이 아직 없습니다.</p>
        ) : (
          <MeterGroup>
            {landings.map((row) => (
              <Meter
                key={row.name}
                label={row.name}
                value={row.count}
                max={Math.max(...landings.map((landing) => landing.count))}
                valueLabel={`방문 ${formatCount(row.count)}`}
              />
            ))}
          </MeterGroup>
        )}
        <p className={styles.note}>
          밖(QR·링크·검색)에서 들어와 처음 연 페이지입니다. 앱 안 이동·상세 열기는 세지 않습니다.
        </p>
      </Card>

      <Card title="언어">
        <MeterGroup>
          {locales.map((row) => (
            <Meter
              key={row.locale}
              label={STUDENT_LOCALE_LABEL[row.locale]}
              value={row.share}
              max={1}
              valueLabel={`${Math.round(row.share * 100)}% · ${formatCount(row.pageViews)}`}
            />
          ))}
        </MeterGroup>
      </Card>

      <Card title="유입 경로">
        {referrers.length === 0 ? (
          <p className={styles.empty}>이 기간 방문이 아직 없습니다.</p>
        ) : (
          <MeterGroup>
            {referrers.map((row) => (
              <Meter
                key={row.name}
                label={row.name}
                value={row.count}
                max={referrers[0].count}
                valueLabel={`방문 ${formatCount(row.count)}`}
              />
            ))}
          </MeterGroup>
        )}
        <p className={styles.note}>
          QR·주소 입력·인앱 브라우저는 출처가 비어 “{DIRECT_REFERRER}”으로 잡힙니다.
        </p>
      </Card>

      <Card title="체감 속도" count={`오늘 표본 ${formatCount(vitalsToday.samples)}`}>
        <dl className={styles.facts}>
          <Fact label="화면이 뜨기까지 (LCP)" value={vitalText('lcp', vitalsToday.lcp)} />
          <Fact label="누른 뒤 반응까지 (INP)" value={vitalText('inp', vitalsToday.inp)} />
          <Fact label="화면 밀림 (CLS)" value={vitalText('cls', vitalsToday.cls)} />
          <Fact
            label="최근 30분 화면 표시"
            value={`${formatSeconds(vitalsRecent.lcp)} · 표본 ${formatCount(vitalsRecent.samples)}`}
          />
        </dl>
        <p className={styles.note}>
          오늘 느린 쪽 25% 기준(P75)입니다. 좋음·개선 필요·나쁨은 Google Core Web Vitals 기준입니다.
        </p>
      </Card>

      <Card title="페이지별 화면 표시">
        {speeds.length === 0 ? (
          <p className={styles.empty}>페이지별로 판정할 만큼 표본이 아직 없습니다.</p>
        ) : (
          <MeterGroup>
            {speeds.map((row) => (
              <Meter
                key={row.name}
                label={row.name}
                value={row.goodShare}
                max={1}
                valueLabel={`좋음 ${formatShare(row.goodShare)} · 나쁨 ${formatShare(row.poorShare)} · 표본 ${formatCount(row.samples)}`}
              />
            ))}
          </MeterGroup>
        )}
        <p className={styles.note}>
          화면이 2.5초 안에 뜨면 좋음, 4초를 넘으면 나쁨입니다. 나쁨이 많은 페이지가 위에 옵니다.
        </p>
      </Card>

      <footer className={styles.footer}>
        <span>{`${kstDateString(now)} ${kstTimeString(now)} 기준`}</span>
        <ActionButton size="small" variant="neutralWeak" onClick={refresh}>
          다시 불러오기
        </ActionButton>
      </footer>
    </div>
  )
}

function Card({ title, count, children }: { title: string; count?: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      {/* 홈 카드와 같은 머리 — boldSolid 제목에 오른쪽 요약 */}
      <ListHeader as="h2" variant="boldSolid">
        <span>{title}</span>
        {count && <span className={styles.count}>{count}</span>}
      </ListHeader>
      {children}
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

/** "2.1초 · 좋음". 표본이 없으면 "—" */
function vitalText(metric: 'lcp' | 'inp' | 'cls', value: number | null): string {
  if (value === null) return '—'
  const shown =
    metric === 'lcp' ? formatSeconds(value) : metric === 'inp' ? `${value}ms` : value.toFixed(2)
  return `${shown} · ${VITAL_GRADE_LABEL[vitalGrade(metric, value)]}`
}

/**
 * 혼잡도 판정의 기준이 된 최고치 한 줄. 판정은 최근 15분이 이 최고치의 몇 % 인가로 하지만,
 * 비율은 운영자가 바로 읽기 어려워 기준 값만 보여 준다. 기준이 아직 없으면 그렇다고만 말한다
 */
function peakLine(current: ReturnType<typeof congestion>, today: string): string {
  if (current.level === 'unknown' || !current.peakAt) return '조회가 더 쌓이면 판정합니다'
  const peakDate = kstDateString(current.peakAt)
  const peakDay = peakDate === today ? '오늘' : dayLabel(peakDate)
  return `가장 붐볐던 때 ${peakDay} ${kstTimeString(current.peakAt)} · ${formatCount(current.peak)}회`
}

/** 축제일은 "1일차 (10/7)", 그 밖의 날은 "9/30" */
function dayLabel(date: string): string {
  return FESTIVAL_DATES.some((day) => day === date)
    ? festivalDayLabel(date)
    : festivalDateLabel(date)
}

/** KST 하루 안에서 몇 번째 15분 칸인가 */
function slotOf(date: Date): number {
  const [hours, minutes] = kstTimeString(date).split(':').map(Number)
  return Math.min(SLOTS_PER_DAY - 1, Math.floor((hours * 60 + minutes) / SLOT_MINUTES))
}

function slotTime(slot: number): string {
  const minutes = slot * SLOT_MINUTES
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

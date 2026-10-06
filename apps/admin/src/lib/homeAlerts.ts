import { noticesByType } from '../store'
import { FESTIVAL_DATES, festivalDayLabel, findTranslation, type Performance } from '../types'
import { kstDateString } from './festivalTime'
import { latestGeneralBroken, liveNow, performanceCountByDate } from './homeStats'

/**
 * 홈 칩과 /alerts 가 함께 쓰는 오류·경고 목록.
 *
 * 둘이 **같은 함수**를 쓴다. 따로 세면 칩의 "오류 1 · 경고 2" 와 목록의 건수가
 * 어긋나고, 그 순간 운영자는 둘 중 어느 쪽도 믿지 않는다 — homeStats 머리 주석과
 * 같은 이유다.
 *
 * 한때 홈이 이것들을 Callout 으로 카드보다 먼저 쌓았다. 많을 때는 다섯 개가
 * 인수인계 타일을 화면 밖으로 밀어내서, 홈에는 칩 하나만 남기고 전부는 여기서 본다.
 *
 * 판정에 "오늘" 이 들어가므로 now 를 받는다. ?at 테스트 시각에서도 칩과 목록이
 * 같은 답을 내려면 둘 다 같은 시각으로 불러야 한다.
 *
 * 서버 연결 상태는 넣지 않는다. 데이터가 틀린 것이 아니라 화면에서 고칠 수 없는
 * 일이라 StatusStrip 이 따로 말한다.
 */

export type AlertTone = 'critical' | 'warning'

export interface HomeAlert {
  key: string
  tone: AlertTone
  title: string
  description: string
  /** 누르면 고치러 가는 곳 */
  to: string
}

export interface AlertCounts {
  critical: number
  warning: number
}

function performanceTitle(performance: Performance): string {
  return findTranslation(performance.translations, 'KO')?.title ?? `공연 ${performance.id}`
}

/** 오류 먼저, 같은 심각도 안에서는 아래에서 넣은 순서 그대로 */
export function homeAlerts(now: Date): HomeAlert[] {
  const today = kstDateString(now)
  const lastDay = FESTIVAL_DATES[FESTIVAL_DATES.length - 1]
  const alerts: HomeAlert[] = []

  const broken = latestGeneralBroken()
  if (broken) {
    alerts.push({
      key: 'latest-notice-broken',
      tone: 'critical',
      title: '가장 최근 일반 공지가 영어·중국어로 열리지 않습니다.',
      description: '이전 공지로 대체되지 않고 오류가 납니다.',
      to: `/notices/${broken.id}`,
    })
  }

  // 오늘 일차가 아닌 공연이 켜져 있으면 실수다. 축제 전·다른 일차·축제 후가
  // 모두 같은 사고라 한 규칙으로 잡고 문구만 시점에 맞춘다
  const live = liveNow()
  if (live && live.date !== today) {
    alerts.push({
      key: 'live-misplaced',
      tone: 'critical',
      title:
        today < FESTIVAL_DATES[0]
          ? '아직 축제 전인데 공연 중 표시가 켜져 있습니다.'
          : today > lastDay
            ? '축제가 끝났는데 공연 중 표시가 켜져 있습니다.'
            : `${festivalDayLabel(live.date)} 공연이 켜져 있습니다.`,
      description: `${performanceTitle(live)} — 학생 앱에 지금 공연으로 나갑니다.`,
      to: `/performances?date=${live.date}`,
    })
  }

  // 이미 지나간 일차를 비었다고 말해봐야 할 수 있는 일이 없다
  for (const row of performanceCountByDate()) {
    if (row.count !== 0 || row.date < today) continue
    alerts.push({
      key: `no-performance-${row.date}`,
      tone: 'warning',
      title: `${festivalDayLabel(row.date)} 공연이 아직 없습니다.`,
      description: '라인업이 정해지면 일차별로 넣어주세요.',
      to: `/performances?date=${row.date}`,
    })
  }

  if (noticesByType('PERMANENT').length === 0 && today <= lastDay) {
    alerts.push({
      key: 'no-permanent-notice',
      tone: 'warning',
      title: '상시 공지가 없습니다.',
      description: '안전 수칙처럼 축제 내내 걸어둘 안내를 올려주세요.',
      to: '/notices',
    })
  }

  // sort 는 안정 정렬이라 같은 심각도 안의 순서는 그대로 남는다
  return alerts.sort((a, b) => Number(b.tone === 'critical') - Number(a.tone === 'critical'))
}

export function countAlerts(alerts: HomeAlert[]): AlertCounts {
  const critical = alerts.filter((alert) => alert.tone === 'critical').length
  return { critical, warning: alerts.length - critical }
}

/** "오류 1 · 경고 2". 0 인 쪽은 빼서 말한다 */
export function alertSummary(counts: AlertCounts): string {
  return [
    counts.critical > 0 ? `오류 ${counts.critical}` : null,
    counts.warning > 0 ? `경고 ${counts.warning}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

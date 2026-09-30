import { Fragment, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  IconBoxFlapLine,
  IconChevronRightLine,
  IconExclamationmarkCircleFill,
  IconMegaphoneLine,
} from '@karrotmarket/react-monochrome-icon'
import { Badge } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { Chip } from 'seed-design/ui/chip'
import { List, ListButtonItem, ListDivider } from 'seed-design/ui/list'
import { ListHeader } from 'seed-design/ui/list-header'
import {
  currentFestivalDate,
  daysUntilFestival,
  festivalPreviewAt,
  kstDateString,
  kstTimeString,
} from '../lib/festivalTime'
import { alertSummary, countAlerts, homeAlerts, type HomeAlert } from '../lib/homeAlerts'
import {
  latestGeneralNotice,
  liveNow,
  missingByDomain,
  nextInSeq,
  openPlacesByCategory,
  performanceCountByDate,
} from '../lib/homeStats'
import { parseAtParam, useNow } from '../lib/useNow'
import {
  CONGESTION_LABEL,
  congestion,
  dailyTotals,
  formatCount,
  slowLoading,
  trafficUnavailableText,
} from '../lib/trafficStats'
import { useTraffic } from '../lib/useTraffic'
import { lostItemsByReturned, performancesByDate, useStoreVersion } from '../mocks/store'
import {
  dateTimeLabel,
  festivalDayLabel,
  FESTIVAL_DATES,
  findTranslation,
  type LostItem,
  type Notice,
  type Performance,
} from '../mocks/types'
import {
  CongestionBadge,
  QuickAction,
  QuickActions,
  StatTile,
  StatTileGrid,
  StatusStrip,
} from '../ui'
import styles from './HomeRoute.module.css'

/**
 * 교대 인수인계용 현황판. "지금 뭐가 돌아가나" 를 한 화면에 보여주고
 * 편집은 각 탭으로 보낸다 — 여기서는 아무것도 고치지 않는다.
 *
 * **화면은 하나다.** 섹션의 존재·순서·제목은 어느 날에도 같고, 시점에 따라
 * 바뀌는 것은 섹션 안의 문장과 숫자뿐이다. 한때 준비·당일·종료 세 화면으로
 * 갈랐지만, 국면마다 화면 지도가 통째로 바뀌어 운영자가 매번 다시 익혀야
 * 했다. 축제 이틀을 위해 화면을 셋으로 쪼갠 것은 과한 설계였다.
 *
 * 그래서 값이 죽어 있는 자리도 숨기지 않는다. 축제 전의 "지금 공연" 은 사라지지
 * 않고 "아직 축제 전입니다" 라고 말한다 — 목록 화면들이 빈 상태를 다루는 방식과
 * 같다.
 *
 * 올리는 것은 현재 API 로 계산할 수 있는 것뿐이다. 보존된 와이어프레임의
 * "부스 마감 토글" 과 "긴급 공지" 는 여전히 만들 수 없다 — PLACE 에 마감 여부
 * 필드가 없고, 긴급 공지는 API 명세 범위 밖이다.
 *
 * 공연의 "다음" 은 시각이 아니라 같은 일차의 seq+1 이다. 공연에 시각이 없는
 * 것은 일정 지연 때문에 의도적으로 그렇게 둔 것이라(§5.6) 화면이 시각을
 * 지어내지 않는다.
 *
 * 큰 숫자는 넷이다. 한때 "화면당 hero 하나" 로 번역 누락 건수를 48px 로
 * 세웠는데, 운영 현황판에서 가장 큰 글자가 문제 건수라 시선이 "지금 뭐가
 * 돌아가나" 에서 벗어났다. 공연·장소·분실물·번역 네 숫자를 동급 타일로 놓으면
 * 인수인계 질문에 한눈에 답하고, 어느 것도 다른 것보다 크게 말하지 않는다.
 *
 * 바로가기 셋은 "여기서 아무것도 고치지 않는다" 를 어기지 않는다 — 편집 화면으로
 * 이동만 하고 이 화면에서는 아무것도 바뀌지 않는다.
 *
 * 학생 화면 새로고침은 두지 않는다. 학생 앱의 /api/revalidate 는 백엔드만 아는 비밀
 * 키를 요구하는데, admin 은 정적 SPA 라 그 키를 넣으면 번들에 그대로 드러난다.
 * 자동 재검증은 백엔드가 저장 뒤 직접 보낸다.
 *
 * 오류·경고는 칩 하나로 접었다. 한때 Callout 으로 카드보다 먼저 쌓았는데, 많을 때는
 * 다섯 개가 네 타일을 화면 밖으로 밀어내 인수인계 질문이 뒤로 밀렸다. 칩은 건수만
 * 말하고, 무엇이 왜 문제인지는 누르면 가는 /alerts 가 맡는다 (lib/homeAlerts).
 *
 * 맨 아래 "학생 앱 방문" 은 인수인계 질문이 아니라 "학생들이 지금 얼마나
 * 몰려 있나" 에 대한 답이라 네 타일에 끼우지 않고 다른 카드와 같은 한 줄로 둔다.
 * 자세한 것(15분 흐름·페이지·유입 경로)은 누르면 가는 방문 통계 화면이 맡는다.
 * 축제 전에도 줄은 그대로 있다 — 위의 "화면은 하나다" 와 같은 이유.
 */
export function HomeRoute() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // QA 용 시각 고정. 실제 날짜를 바꿀 수 없으면 축제 당일의 홈을 볼 수 없다
  const at = parseAtParam(searchParams.get('at'))
  const now = useNow(at?.getTime() ?? null)

  // 다른 탭에서 고치고 돌아왔을 때 숫자가 그대로면 화면을 믿지 않는다
  useStoreVersion()

  const today = kstDateString(now)
  const festivalDay = currentFestivalDate(now)
  const nowHhmm = kstTimeString(now)

  const live = liveNow()
  const byDate = performanceCountByDate()
  const missing = missingByDomain()
  const pending = lostItemsByReturned(false)
  const latestNotice = latestGeneralNotice()
  const performanceTotal = byDate.reduce((sum, row) => sum + row.count, 0)
  const lastDay = FESTIVAL_DATES[FESTIVAL_DATES.length - 1]

  const alerts = homeAlerts(now)
  // "지금 공연" 타일 배지 색에 쓴다. 판정은 homeAlerts 의 live-misplaced 와 같다
  const liveMisplaced = live !== undefined && live.date !== today

  const todayRows = festivalDay ? performancesByDate(festivalDay) : []
  const next = live ? nextInSeq(live) : undefined

  const byCategory = openPlacesByCategory(nowHhmm)
  const openTotal = byCategory.reduce((sum, row) => sum + row.open, 0)
  const placeTotal = byCategory.reduce((sum, row) => sum + row.total, 0)

  return (
    <div className={styles.screen}>
      <Header
        now={now}
        frozen={at !== null}
        onPreview={() => setSearchParams({ at: festivalPreviewAt() }, { replace: true })}
        onReset={() => setSearchParams({}, { replace: true })}
      />

      {/* 데이터가 아니라 연결의 상태라 경고 묶음 밖에 둔다. StatusStrip 주석 참고 */}
      <StatusStrip />

      {/* 오류·경고는 칩 하나로 접는다. 전부는 누르면 가는 /alerts 가 보여준다 */}
      <AlertsChip
        alerts={alerts}
        onClick={() =>
          // ?at 을 넘긴다 — 안 넘기면 테스트 시각의 칩과 실제 시각의 목록이 다른 답을 낸다
          navigate({ pathname: '/alerts', search: at ? `?${searchParams.toString()}` : '' })
        }
      />

      {/* 인수인계의 네 질문 — 지금 공연, 몇 곳이 열려 있나, 못 돌려준 물건,
          학생에게 안 보이는 항목. 넷 다 전 기간 정의된다 */}
      <StatTileGrid>
        <StatTile
          label="지금 공연"
          valueVariant="text"
          value={liveRowTitle(live, festivalDay, today, lastDay)}
          detail={liveRowDetail(live, festivalDay, today, lastDay, todayRows.length, next, {
            performanceTotal,
            byDate,
          })}
          badge={
            live && festivalDay ? (
              <Badge tone={liveMisplaced ? 'critical' : 'brand'} variant="solid">
                공연 중
              </Badge>
            ) : undefined
          }
          to={`/performances?date=${festivalDay ?? live?.date ?? FESTIVAL_DATES[0]}`}
        />
        <StatTile
          label="운영 중인 장소"
          value={festivalDay ? openTotal : placeTotal}
          unit={festivalDay ? ` / ${placeTotal}` : '곳'}
          detail={festivalDay ? `${nowHhmm} 기준` : '운영 집계는 축제 당일에'}
          to="/places"
        />
        <StatTile
          label="미반환 분실물"
          value={pending.length}
          unit="건"
          detail={
            pending[0] ? `최근: ${lostItemTitle(pending[0])}` : '주인을 기다리는 물건이 없습니다'
          }
          to="/lost-items"
        />
        {/* 링크가 없다. 갈 곳이 넷(장소·공연·공지·분실물)이라 타일 하나가 고를 수
            없다. 세부는 각 탭의 "번역 누락" 필터 칩이 맡는다 */}
        <StatTile
          label="번역 누락"
          value={missing.total}
          unit="건"
          detail={missing.total === 0 ? '세 언어 모두 채워짐' : '각 탭의 번역 누락 필터에서'}
        />
      </StatTileGrid>

      <QuickActions>
        <QuickAction
          icon={<IconBoxFlapLine width={24} height={24} />}
          label="분실물 등록"
          to="/lost-items/new"
        />
        <QuickAction
          icon={<IconMegaphoneLine width={24} height={24} />}
          label="공지 작성"
          to="/notices/new"
        />
      </QuickActions>

      {/* "마지막으로 학생들에게 뭐라고 알렸나" 는 인수인계의 필수 문장이다 */}
      <Card
        title="마지막 공지"
        rows={[
          {
            key: 'latest-notice',
            title: latestNotice ? noticeTitle(latestNotice) : '올린 일반 공지가 없습니다',
            detail: latestNotice ? dateTimeLabel(latestNotice.created_at) : undefined,
            to: '/notices',
          },
        ]}
      />

      <TrafficCard />
    </div>
  )
}

function performanceTitle(performance: Performance): string {
  return findTranslation(performance.translations, 'KO')?.title ?? `공연 ${performance.id}`
}

function noticeTitle(notice: Notice): string {
  return findTranslation(notice.translations, 'KO')?.title ?? `공지 ${notice.id}`
}

function lostItemTitle(item: LostItem): string {
  return findTranslation(item.translations, 'KO')?.title ?? `분실물 ${item.id}`
}

/** 지금 공연 행의 제목. 축제 밖이라고 카드를 숨기지 않고 그 사실을 말한다 */
function liveRowTitle(
  live: Performance | undefined,
  festivalDay: string | null,
  today: string,
  lastDay: string,
): string {
  // 축제 밖에서는 live 가 켜져 있어도 카드가 그것을 제목으로 세우지 않는다.
  // 잔류 플래그는 위 오류·경고 칩이 이미 말했고, 이 카드가 답할 질문은
  // "지금 공연이 뭔가" 다 — 축제 전에는 없는 게 맞는 답이다
  if (!festivalDay) return today > lastDay ? '공연 일정이 끝났습니다' : '아직 축제 전입니다'
  if (live) return performanceTitle(live)
  return '현재 공연이 설정되어 있지 않습니다'
}

function liveRowDetail(
  live: Performance | undefined,
  festivalDay: string | null,
  today: string,
  lastDay: string,
  todayCount: number,
  next: Performance | undefined,
  totals: { performanceTotal: number; byDate: { date: string; count: number }[] },
): string {
  const lineup = totals.byDate
    .map((row) => `${festivalDayLabel(row.date)} ${row.count}건`)
    .join(' · ')

  if (!festivalDay) return today > lastDay ? `전체 ${totals.performanceTotal}건` : `${lineup} 등록`
  if (live && live.date !== today) return `${festivalDayLabel(live.date)} 공연이 켜져 있습니다`
  if (live) {
    return `오늘 ${live.seq}/${todayCount}번째 · ${next ? `다음: ${performanceTitle(next)}` : '오늘 마지막 순서'}`
  }
  return todayCount === 0
    ? '오늘 등록된 공연이 없습니다'
    : '학생 앱의 "지금 공연" 자리가 비어 있습니다'
}

/**
 * 지금이 언제이고 몇 시 기준인지. 화면의 모든 숫자에 프레임을 씌우는 줄이라
 * 항상 맨 위에 둔다 — 기준 시각이 없으면 "운영 중 13곳" 이 언제의 13곳인지
 * 알 수 없다. 화면을 고르는 판정이 아니라 문구만 고른다.
 */
function Header({
  now,
  frozen,
  onPreview,
  onReset,
}: {
  now: Date
  frozen: boolean
  onPreview: () => void
  onReset: () => void
}) {
  const today = currentFestivalDate(now)
  const lastDay = FESTIVAL_DATES[FESTIVAL_DATES.length - 1]
  const remaining = daysUntilFestival(now)

  const headline = today
    ? festivalDayLabel(today)
    : remaining > 0
      ? `축제까지 D-${remaining}`
      : '축제가 끝났습니다'

  const detail = today
    ? `${kstTimeString(now)} 기준`
    : remaining > 0
      ? FESTIVAL_DATES.map(festivalDayLabel).join(' · ')
      : `${festivalDayLabel(lastDay)} 종료`

  return (
    <header className={styles.header}>
      <div className={styles.headerLine}>
        <h2 className={styles.headline}>{headline}</h2>
        {/* 오른쪽 슬롯은 하나고 상태만 둘이다. 축제가 오기 전에 당일 화면을 볼
            수단이 필요한데, 시점별 목록을 따로 두면 그게 또 "날마다 다른 화면"
            이 된다. 보는 자리에서 바로 켜고 끈다.

            둘 다 setSearchParams 다 — navigate 로 나가면 전체 새로고침이라 목
            스토어가 초기화돼, 미리보기 직전에 고쳐둔 것이 사라진다 */}
        {frozen ? (
          <>
            {/* 이 배지가 없으면 QA 화면과 실제 운영 화면을 구분할 수 없다 */}
            <Badge tone="warning" variant="weak">
              테스트 시각
            </Badge>
            <div className={styles.headerAction}>
              <ActionButton size="xsmall" variant="neutralOutline" onClick={onReset}>
                실제 시각으로
              </ActionButton>
            </div>
          </>
        ) : (
          <div className={styles.headerAction}>
            <ActionButton size="xsmall" variant="neutralOutline" onClick={onPreview}>
              축제 당일 보기
            </ActionButton>
          </div>
        )}
      </div>
      <p className={styles.headerDetail}>
        {frozen ? `${kstDateString(now)} ${kstTimeString(now)} 기준` : detail}
      </p>
    </header>
  )
}

/**
 * 오류·경고 요약 칩. 필터가 아니라 다른 화면으로 가는 것이라 Chip.Toggle 이 아니라
 * Chip.Button 이다.
 *
 * 0 건이면 아무것도 그리지 않는다. 문제가 없을 때 늘 켜진 "이상 없음" 은 며칠 지나면
 * 아무도 안 읽고, 정작 문제가 생겼을 때 칩이 나타나는 변화가 신호가 된다.
 *
 * SEED Chip 에는 tone 이 없어 심각도는 앞 아이콘 색으로만 준다. 글자가 이미
 * "오류/경고" 를 말하므로 색이 유일한 신호는 아니다.
 */
function AlertsChip({ alerts, onClick }: { alerts: HomeAlert[]; onClick: () => void }) {
  if (alerts.length === 0) return null
  const counts = countAlerts(alerts)
  return (
    <div className={styles.alerts}>
      <Chip.Button variant="outlineStrong" size="medium" onClick={onClick}>
        <Chip.PrefixIcon
          className={counts.critical > 0 ? styles.alertsCritical : styles.alertsWarning}
        >
          <IconExclamationmarkCircleFill />
        </Chip.PrefixIcon>
        <Chip.Label>{alertSummary(counts)}</Chip.Label>
        <Chip.SuffixIcon>
          <IconChevronRightLine />
        </Chip.SuffixIcon>
      </Chip.Button>
    </div>
  )
}

interface Row {
  key: string
  title: string
  detail?: string
  suffix?: ReactNode
  to: string
}

/**
 * 홈의 모든 카드는 "요약 한 줄 + 그 자리로 가기" 라 행 모양이 같다.
 * 구분선 관례도 목록 화면들과 맞춘다 — ListDivider 는 li 라 ul 안에 넣어도 되고,
 * 행 사이에만 넣는다 (마지막 행 뒤의 선은 목록이 끊긴 것처럼 보인다).
 *
 * 셰브런은 SEED 리스트 레시피상 suffix 라 버튼 밖에 선다. 그래서 장식(aria-hidden)
 * 이고, 누르는 것은 행 전체다.
 */
function RowList({ rows }: { rows: Row[] }) {
  const navigate = useNavigate()
  return (
    <List>
      {rows.map((row, index) => (
        <Fragment key={row.key}>
          {index > 0 && <ListDivider inset />}
          <ListButtonItem
            title={row.title}
            detail={row.detail}
            suffix={
              <>
                {row.suffix}
                <span className={styles.chevron} aria-hidden="true">
                  <IconChevronRightLine width={20} height={20} />
                </span>
              </>
            }
            onClick={() => navigate(row.to)}
          />
        </Fragment>
      ))}
    </List>
  )
}

function Card({
  title,
  count,
  emptyText,
  rows,
}: {
  title: string
  count?: ReactNode
  emptyText?: string
  rows: Row[]
}) {
  return (
    <section className={styles.section}>
      {/* boldSolid 와 우측 건수는 공지 목록의 섹션 헤더와 같은 관례다 */}
      <ListHeader as="h2" variant="boldSolid">
        <span>{title}</span>
        {count !== undefined && <span className={styles.count}>{count}</span>}
      </ListHeader>
      {rows.length === 0 && emptyText ? (
        <p className={styles.sectionEmpty}>{emptyText}</p>
      ) : (
        <RowList rows={rows} />
      )}
    </section>
  )
}

/**
 * 학생 앱 접속 요약 한 줄. 다른 카드처럼 "요약 + 그 자리로 가기" 라 RowList 를
 * 그대로 쓰고, 누르면 방문 통계 화면으로 간다.
 *
 * 불러오기에 실패해도 줄은 남기고 그 사실을 제목으로 말한다. 이전 값이 있으면
 * 그것을 계속 보여준다 — 잠깐의 네트워크 실패로 숫자가 사라지면 오히려 불안하다.
 */
function TrafficCard() {
  const { traffic, error } = useTraffic()

  if (!traffic) {
    return (
      <Card
        title="학생 앱 방문"
        rows={[{ key: 'traffic', title: trafficUnavailableText(error), to: '/analytics' }]}
      />
    )
  }

  const now = new Date(traffic.generatedAt)
  const current = congestion(traffic.buckets, now)
  const [today] = dailyTotals(traffic.buckets, [traffic.today])
  const detail = [
    `${kstTimeString(current.recentAt)}부터 15분 조회 ${formatCount(current.recent)}`,
    `${kstTimeString(now)} 기준`,
    slowLoading(traffic.performance) ? '현장 로딩 느림' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card
      title="학생 앱 방문"
      rows={[
        {
          key: 'traffic',
          title: `지금 ${CONGESTION_LABEL[current.level]} · 오늘 방문 ${formatCount(today.visits)}`,
          detail,
          suffix: <CongestionBadge level={current.level} />,
          to: '/analytics',
        },
      ]}
    />
  )
}

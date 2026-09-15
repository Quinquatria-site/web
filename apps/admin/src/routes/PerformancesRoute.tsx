import {
  IconArrowUpArrowDownLine,
  IconChevronDownLine,
  IconChevronUpLine,
  IconPlusLine,
} from '@karrotmarket/react-monochrome-icon'
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Badge, Icon } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { Chip } from 'seed-design/ui/chip'
import { ChipTabsList, ChipTabsRoot, ChipTabsTrigger } from 'seed-design/ui/chip-tabs'
import { FloatingActionButton } from 'seed-design/ui/floating-action-button'
import { List, ListButtonItem, ListItem } from 'seed-design/ui/list'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { Switch } from 'seed-design/ui/switch'
import { performancesByDate, reorderPerformances, setLive, useStoreVersion } from '../mocks/store'
import {
  FESTIVAL_DATES,
  festivalDayLabel,
  findTranslation,
  hasMissingTranslations,
  missingLanguages,
  PERFORMANCE_TYPES,
  type Performance,
  type PerformanceType,
} from '../mocks/types'
import styles from './PerformancesRoute.module.css'

/** ERD 의 enum 은 세 값뿐이다. 응원제·가요제는 SPECIAL 로 받는다 (PRD §12 열린 질문 3) */
const TYPE_LABELS: Record<PerformanceType, string> = {
  ARTIST: '연예인',
  STUDENT: '학생',
  SPECIAL: '특별 무대',
}

function titleOf(performance: Performance): string {
  return findTranslation(performance.translations, 'KO')?.title ?? `공연 ${performance.id}`
}

/** 번역 상태. 빠진 언어가 있으면 그 언어 사용자에게 이 공연이 안 보인다 (§2.4) */
function LangBadge({ performance }: { performance: Performance }) {
  const missing = missingLanguages(performance.translations)
  // weak — 목록처럼 같은 배지가 줄줄이 반복되는 자리에 solid 는 너무 시끄럽다
  if (missing.length === 0)
    return (
      <Badge tone="neutral" variant="weak">
        3개 언어
      </Badge>
    )
  return (
    <Badge tone="critical" variant="weak">
      {missing.join('·')} 없음
    </Badge>
  )
}

/**
 * 빈 목록. 막다른 길을 만들지 않으려고 나갈 문을 같이 둔다.
 * 번역 누락 필터가 0건인 것은 나쁜 소식이 아니라 좋은 소식이라 따로 말한다.
 */
function Empty({
  filtered,
  missingOnly,
  date,
  onReset,
}: {
  filtered: boolean
  missingOnly: boolean
  date: string
  onReset: () => void
}) {
  const navigate = useNavigate()
  const title = missingOnly
    ? '번역이 빠진 공연이 없습니다'
    : filtered
      ? '이 유형에는 아직 공연이 없습니다'
      : '이 일차에는 아직 공연이 없습니다'
  const description = missingOnly
    ? '이 일차는 세 언어가 모두 채워져 있습니다.'
    : filtered
      ? '다른 유형을 보거나, 여기에 새 공연을 추가하세요.'
      : '오른쪽 아래 공연 추가 버튼을 눌러 시작하세요.'

  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDescription}>{description}</p>
      {filtered || missingOnly ? (
        <ActionButton size="medium" variant="neutralWeak" onClick={onReset}>
          전체 보기
        </ActionButton>
      ) : (
        <ActionButton size="medium" onClick={() => navigate(`/performances/new?date=${date}`)}>
          공연 추가
        </ActionButton>
      )}
    </div>
  )
}

/**
 * 공연 목록. 축제가 이틀이라 일차가 목록의 1차 축이다 (§5.1 date ASC, seq ASC, id ASC).
 *
 * 이 화면이 축제 당일 가장 자주 쓰이는 이유는 두 가지다.
 * - 현재 공연 토글. 시각으로 계산하지 않고 운영자가 올린 is_live 를 그대로 쓴다.
 *   전체에서 최대 1건이라 다른 공연을 켜면 이전 것이 즉시 내려간다 (§5.6).
 * - 순서 재정렬. 지연·취소로 순서가 자주 바뀌는데 seq 는 서버가 정하므로
 *   화면에서 고치는 수단은 일차를 통째로 보내는 재정렬뿐이다.
 */
export function PerformancesRoute() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()

  // 보고 있던 일차를 URL 에 싣는다. 편집하고 돌아왔을 때 1일차로 튕기지 않는다
  const [searchParams, setSearchParams] = useSearchParams()
  const param = searchParams.get('date')
  const date = FESTIVAL_DATES.some((value) => value === param)
    ? (param as string)
    : FESTIVAL_DATES[0]

  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [missingOnly, setMissingOnly] = useState(false)
  /** null 이 아니면 순서 편집 중. 확정 전까지는 이 배열만 움직인다 */
  const [order, setOrder] = useState<number[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 저장·삭제·실행취소·live 토글이 이 목록에 바로 반영되게 한다
  useStoreVersion()

  // 메모하지 않는다. PERFORMANCES 는 목 스토어가 제자리에서 바꾸는 배열이라
  // 의존성으로 적을 것이 없고, 한 일차 수십 건 정렬은 렌더마다 해도 싸다
  const rows = performancesByDate(date)

  const reordering = order !== null
  // 유형과 번역 누락은 다른 축이라 AND 로 건다 — "학생 공연 중 번역 누락"이 보여야 한다
  const byType = rows.filter((p) => typeFilter === 'all' || p.type === typeFilter)
  const missingCount = byType.filter((p) => hasMissingTranslations(p.translations)).length
  // 유형을 옮겨 누락이 0 이 되면 켜둔 토글이 빈 화면만 남긴다. 그때는 푼다
  const showMissingOnly = missingOnly && missingCount > 0
  const listed = reordering
    ? order.map((id) => rows.find((p) => p.id === id)).filter((p): p is Performance => Boolean(p))
    : showMissingOnly
      ? byType.filter((p) => hasMissingTranslations(p.translations))
      : byType

  const move = (index: number, delta: number) => {
    if (!order) return
    const next = [...order]
    const swap = index + delta
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setOrder(next)
  }

  const saveOrder = () => {
    if (!order) return
    const rejected = reorderPerformances(date, order)
    if (rejected) {
      // 이 422 는 동시 수정 감지다 (§5.6). 내가 든 배열이 이미 틀렸으므로
      // 붙들고 있어봐야 계속 거부된다 — 편집을 닫고 최신 목록을 보여준다.
      setError(rejected)
      setOrder(null)
      return
    }
    setOrder(null)
    setError(null)
    snackbar.create({ timeout: 3000, render: () => <Snackbar message="순서를 저장했습니다" /> })
  }

  const toggleLive = (performance: Performance, next: boolean) => {
    setLive(performance.id, next)
    snackbar.create({
      timeout: 3000,
      render: () => (
        <Snackbar message={next ? `지금 공연: ${titleOf(performance)}` : '현재 공연을 내렸습니다'} />
      ),
    })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.days}>
        <SegmentedControl
          aria-label="축제 일차"
          value={date}
          onValueChange={(value) => {
            setSearchParams({ date: String(value) }, { replace: true })
            setOrder(null)
            setError(null)
            setMissingOnly(false)
          }}
        >
          {FESTIVAL_DATES.map((value) => (
            <SegmentedControlItem key={value} value={value}>
              {festivalDayLabel(value)}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      {/* 재정렬은 일차 전체를 보내야 해서 (§5.6) 걸러진 목록 위에서는 할 수 없다.
          그래서 순서 편집 중에는 유형 필터와 진입 버튼을 감춘다 */}
      {!reordering && (
        <>
          {/* 단순 선택이 아니라 목록을 갈아끼우는 필터라 Chip 이 아니라 ChipTabs 다 */}
          <ChipTabsRoot className={styles.filters} value={typeFilter} onValueChange={setTypeFilter}>
            <ChipTabsList>
              <ChipTabsTrigger value="all">전체</ChipTabsTrigger>
              {PERFORMANCE_TYPES.map((type) => (
                <ChipTabsTrigger key={type} value={type}>
                  {TYPE_LABELS[type]}
                </ChipTabsTrigger>
              ))}
            </ChipTabsList>
          </ChipTabsRoot>

          <div className={styles.actions}>
            {/* 유형 탭과 다른 축이라 그 줄에 넣지 않는다. 넣으면 유형 선택이 풀려
                "학생 공연 중 번역 누락"을 볼 수 없다. 개수가 곧 남은 작업량이다 */}
            <Chip.Toggle
              checked={showMissingOnly}
              disabled={missingCount === 0}
              onCheckedChange={setMissingOnly}
            >
              <Chip.Label>번역 누락 {missingCount}</Chip.Label>
            </Chip.Toggle>

            {/* 칩과 같은 알약 모양이면 또 하나의 필터처럼 읽힌다. 외곽선으로 갈라놓는다 */}
            <ActionButton
              size="small"
              variant="neutralOutline"
              disabled={rows.length < 2}
              onClick={() => {
                // 재정렬은 그 일차 전체 ID 배열을 보내야 해서 (§5.6)
                // 걸러진 목록 위에서는 할 수 없다. 두 필터를 모두 푼다
                setTypeFilter('all')
                setMissingOnly(false)
                setOrder(rows.map((p) => p.id))
              }}
            >
              <Icon svg={<IconArrowUpArrowDownLine />} />
              순서 바꾸기
            </ActionButton>
          </div>
        </>
      )}

      <div className={styles.list}>
        {listed.length === 0 ? (
          <Empty
            filtered={typeFilter !== 'all'}
            missingOnly={showMissingOnly}
            date={date}
            onReset={() => {
              setTypeFilter('all')
              setMissingOnly(false)
            }}
          />
        ) : (
          <List>
            {listed.map((performance, index) => {
              const seq = (
                <span className={styles.seq}>{reordering ? index + 1 : performance.seq}</span>
              )
              const title = (
                <span className={styles.title}>
                  {titleOf(performance)}
                  {performance.is_live && (
                    <Badge tone="brand" variant="solid">
                      공연 중
                    </Badge>
                  )}
                </span>
              )
              const detail = (
                <span className={styles.detail}>
                  {/* enum 에 네 번째 값이 생길 수 있다 (PRD §12 열린 질문 3).
                      모르는 값이면 빈칸 대신 원래 값을 보여준다 */}
                  {TYPE_LABELS[performance.type] ?? performance.type}
                  <LangBadge performance={performance} />
                </span>
              )
              const rowClass = clsx(
                performance.type === 'SPECIAL' && styles.special,
                performance.is_live && styles.liveRow,
              )

              // 순서 편집 중에는 행을 누를 수 없게 ListItem 으로 바꾼다.
              // 편집을 확정하지 않은 채 다른 화면으로 나가면 옮긴 순서가 사라진다.
              return reordering ? (
                <ListItem
                  key={performance.id}
                  className={rowClass}
                  prefix={seq}
                  title={title}
                  detail={detail}
                  suffix={
                    <div className={styles.moves}>
                      <button
                        type="button"
                        className={styles.moveButton}
                        aria-label={`${titleOf(performance)} 위로`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <IconChevronUpLine width={20} height={20} />
                      </button>
                      <button
                        type="button"
                        className={styles.moveButton}
                        aria-label={`${titleOf(performance)} 아래로`}
                        disabled={index === listed.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <IconChevronDownLine width={20} height={20} />
                      </button>
                    </div>
                  }
                />
              ) : (
                <ListButtonItem
                  key={performance.id}
                  rootProps={{ className: rowClass }}
                  prefix={seq}
                  title={title}
                  detail={detail}
                  suffix={
                    <Switch
                      checked={performance.is_live}
                      onCheckedChange={(next) => toggleLive(performance, next)}
                      inputProps={{ 'aria-label': `${titleOf(performance)} 공연 중` }}
                    />
                  }
                  onClick={() => navigate(`/performances/${performance.id}`)}
                />
              )
            })}
          </List>
        )}
      </div>

      {/* 한 손 엄지가 닿는 우하단. 목록을 끝까지 내려도 자리를 지킨다.
          재정렬 중에는 하단 바가 그 자리를 쓰므로 감춘다 */}
      {!reordering && (
        <FloatingActionButton
          className={styles.fab}
          icon={<IconPlusLine />}
          label="공연 추가"
          onClick={() => navigate(`/performances/new?date=${date}`)}
        />
      )}

      {/* 편집 화면의 저장 바와 같은 자리·같은 이유. 긴 라인업을 끝까지 내려도 닿는다.
          재정렬을 닫은 뒤에도 거부 사유는 남겨 왜 안 됐는지 보이게 한다 */}
      {(reordering || error) && (
        <div className={styles.footer}>
          {error && <Callout tone="critical" description={error} />}
          {reordering && (
            <div className={styles.footerRow}>
              <ActionButton size="large" onClick={saveOrder}>
                순서 저장
              </ActionButton>
              <ActionButton
                size="large"
                variant="neutralWeak"
                onClick={() => {
                  setOrder(null)
                  setError(null)
                }}
              >
                취소
              </ActionButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

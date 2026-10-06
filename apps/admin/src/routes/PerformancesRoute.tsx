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
import { ActionableCallout, Callout } from 'seed-design/ui/callout'
import { Chip } from 'seed-design/ui/chip'
import { ChipTabsList, ChipTabsRoot, ChipTabsTrigger } from 'seed-design/ui/chip-tabs'
import { FloatingActionButton } from 'seed-design/ui/floating-action-button'
import { List, ListButtonItem, ListItem } from 'seed-design/ui/list'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, SnackbarAvoidOverlap, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { Switch } from 'seed-design/ui/switch'
import { apiErrorText } from '../lib/apiErrorText'
import {
  canSwapWithinGroup,
  groupByScheduleType,
  type PerformanceGroup,
} from '../lib/performanceGroups'
import {
  loadPerformances,
  performancesByDate,
  performancesOutsideFestival,
  reorderPerformances,
  setPerformanceLive,
  useStoreVersion,
} from '../store'
import { isApiError } from '../api'
import {
  FESTIVAL_DATES,
  festivalDateLabel,
  festivalDayLabel,
  findTranslation,
  hasMissingTranslations,
  PERFORMANCE_TYPES,
  type Performance,
  type PerformanceType,
} from '../types'
import { LangBadge } from '../ui'
import styles from './PerformancesRoute.module.css'

/** ERD 의 enum 은 세 값뿐이다. 응원제·가요제는 SPECIAL 로 받는다 (PRD §12 열린 질문 3) */
const TYPE_LABELS: Record<PerformanceType, string> = {
  ARTIST: '연예인',
  STUDENT: '학생',
  SPECIAL: '특별 무대',
}

/** 묶음 머리. 학생 앱이 그 종류를 펼치는 시각을 같이 적어 어느 칸에 나가는지 보이게 한다 */
function groupTitle(group: PerformanceGroup): string {
  return group.type === null ? '기타' : `${TYPE_LABELS[group.type]} · ${group.time}`
}

function titleOf(performance: Performance): string {
  return findTranslation(performance.translations, 'KO')?.title ?? `공연 ${performance.id}`
}

/**
 * 유형 필터로 걸러 0건인 목록. 막다른 길을 만들지 않으려고 나갈 문을 같이 둔다.
 * 필터가 없으면 이 화면 대신 빈 묶음 머리가 보이고, 번역 누락 필터는 0건이면
 * 스스로 풀려서 여기까지 오지 않는다.
 */
function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>이 유형에는 아직 공연이 없습니다</p>
      <p className={styles.emptyDescription}>다른 유형을 보거나, 여기에 새 공연을 추가하세요.</p>
      <ActionButton size="medium" variant="neutralWeak" onClick={onReset}>
        전체 보기
      </ActionButton>
    </div>
  )
}

/**
 * 공연 목록. 축제가 이틀이라 일차가 목록의 1차 축이다 (§5.1 date ASC, seq ASC, id ASC).
 * 일차 안은 학생 앱 일정표와 같은 종류별 묶음으로 나눈다 — 학생 앱은 종류마다 고정 칸에
 * 공연을 펼치므로 seq 는 같은 종류 안에서만 순서가 된다 (lib/performanceGroups).
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

  // 누락 필터도 URL 에 싣는다. 홈의 "번역 누락 · 공연 N일차" 가 일차와 필터를
  // 함께 걸어 이 화면을 열어야 해서다. date 를 같이 써야 일차가 풀리지 않는다
  const missingOnly = searchParams.get('missing') === '1'
  const setMissingOnly = (next: boolean) =>
    setSearchParams(next ? { date, missing: '1' } : { date }, { replace: true })
  /** null 이 아니면 순서 편집 중. 확정 전까지는 이 배열만 움직인다 */
  const [order, setOrder] = useState<number[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // 순서 저장을 서버에 보내는 중. 두 번 누르면 같은 순서가 두 번 간다
  const [savingOrder, setSavingOrder] = useState(false)
  /** live 요청이 가는 중인 공연. 끝날 때까지 그 스위치를 잠근다 */
  const [liveBusy, setLiveBusy] = useState<number | null>(null)

  // 저장·삭제·실행취소·live 토글이 이 목록에 바로 반영되게 한다
  useStoreVersion()

  // 메모하지 않는다. PERFORMANCES 는 스토어가 제자리에서 바꾸는 캐시 배열이라
  // 의존성으로 적을 것이 없고, 한 일차 수십 건 정렬은 렌더마다 해도 싸다
  const rows = performancesByDate(date)
  // 일차 탭 어디에도 안 보이는 공연. 따로 알리지 않으면 있는지도 모른다
  const outside = performancesOutsideFestival()

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
  // 걸러 보는 중이 아니면 빈 묶음 머리도 띄운다. 공연이 없어도 학생 앱 칸 순서가 보여야 한다.
  // 걸러 보는 중에 빈 머리를 늘어놓으면 필터가 안 먹은 것처럼 보여 해당 묶음만 둔다
  const unfiltered = reordering || (typeFilter === 'all' && !showMissingOnly)
  // 순서 편집 중의 order 는 이미 묶음 순서로 이어 붙인 배열이라 다시 묶어도 순서가 같다
  const groups = groupByScheduleType(listed, { keepEmpty: unfiltered })

  /** 같은 묶음 안의 이웃과만 자리를 바꾼다 */
  const canMove = (index: number, delta: number) => canSwapWithinGroup(listed, index, delta)

  const move = (index: number, delta: number) => {
    if (!order || !canMove(index, delta)) return
    const next = [...order]
    const swap = index + delta
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setOrder(next)
  }

  const saveOrder = async () => {
    if (!order || savingOrder) return
    setSavingOrder(true)
    try {
      await reorderPerformances(date, order)
      setOrder(null)
      setError(null)
      snackbar.create({ timeout: 3000, render: () => <Snackbar message="순서를 저장했습니다" /> })
    } catch (saveError) {
      // 422 는 동시 수정 감지다 (§5.6). 내가 든 배열과 캐시가 이미 틀렸으므로 붙들고
      // 있어봐야 계속 거부된다 — 편집을 닫고 서버에서 최신 목록을 다시 받는다
      if (isApiError(saveError) && saveError.status === 422) {
        setOrder(null)
        setError('그 사이 이 일차의 공연이 바뀌어 최신 목록을 불러왔습니다. 다시 옮겨주세요.')
        await loadPerformances().catch(() => {})
      } else {
        // 네트워크 등 다른 실패는 옮긴 순서를 그대로 두고 다시 누를 수 있게 한다
        setError(apiErrorText(saveError))
      }
    } finally {
      setSavingOrder(false)
    }
  }

  /**
   * 요청이 끝난 뒤에 스위치가 바뀐다. 켜진 척했는데 서버에는 안 켜진 상태가 축제 당일
   * 가장 나쁜 실패라, 낙관적으로 먼저 켜지 않는다.
   */
  const toggleLive = async (performance: Performance, next: boolean) => {
    if (liveBusy !== null) return
    setLiveBusy(performance.id)
    try {
      await setPerformanceLive(performance.id, next)
      snackbar.create({
        timeout: 3000,
        render: () => (
          <Snackbar
            message={next ? `지금 공연: ${titleOf(performance)}` : '현재 공연을 내렸습니다'}
          />
        ),
      })
    } catch (liveError) {
      const message = apiErrorText(liveError)
      snackbar.create({
        timeout: 4000,
        render: () => <Snackbar variant="critical" message={message} />,
      })
    } finally {
      setLiveBusy(null)
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.days}>
        <SegmentedControl
          aria-label="축제 일차"
          value={date}
          onValueChange={(value) => {
            // date 만 남기므로 누락 필터는 여기서 함께 풀린다. 다른 일차의
            // 누락이 0 건이면 켜둔 필터가 빈 화면만 남기기 때문이다
            setSearchParams({ date: String(value) }, { replace: true })
            setOrder(null)
            setError(null)
          }}
        >
          {FESTIVAL_DATES.map((value) => (
            <SegmentedControlItem key={value} value={value}>
              {festivalDayLabel(value)}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      {/* 서버는 아무 날짜나 받으므로 축제 일차 밖의 공연이 있을 수 있다. 탭 어디에도
          안 보이니 여기서 알리고, 눌러서 편집 화면에서 일차를 옮기게 한다.
          여러 건이면 앞에서부터 하나씩 연다 — 옮기면 건수가 준다 */}
      {!reordering && outside.length > 0 && (
        <div className={styles.outside}>
          <ActionableCallout
            tone="warning"
            title={`축제 일차가 아닌 공연 ${outside.length}건`}
            description={`${titleOf(outside[0])} (${festivalDateLabel(outside[0].date)}) — 눌러서 일차를 옮기세요.`}
            onClick={() => navigate(`/performances/${outside[0].id}`)}
          />
        </div>
      )}

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
                // 묶음 순서로 이어 붙여 둔다. 그대로 저장되므로 서버 seq 도 학생 앱 칸 순서와
                // 맞게 다시 매겨진다 — 종류를 섞어 올린 일차는 옮기지 않고 저장만 해도 맞춰진다
                setOrder(
                  groupByScheduleType(rows).flatMap((group) => group.performances.map((p) => p.id)),
                )
              }}
            >
              <Icon svg={<IconArrowUpArrowDownLine />} />
              순서 바꾸기
            </ActionButton>
          </div>
        </>
      )}

      <div className={styles.list}>
        {groups.length === 0 ? (
          <Empty
            onReset={() => {
              setTypeFilter('all')
              setMissingOnly(false)
            }}
          />
        ) : (
          groups.map((group) => (
            <section key={group.type ?? 'other'} aria-label={groupTitle(group)}>
              <h2 className={styles.groupTitle}>{groupTitle(group)}</h2>
              {group.performances.length === 0 && <p className={styles.groupEmpty}>아직 없음</p>}
              <List>
                {group.performances.map((performance) => {
                  const index = listed.indexOf(performance)
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
                      <LangBadge translations={performance.translations} />
                    </span>
                  )
                  const rowClass = clsx(performance.is_live && styles.liveRow)

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
                            disabled={!canMove(index, -1)}
                            onClick={() => move(index, -1)}
                          >
                            <IconChevronUpLine width={20} height={20} />
                          </button>
                          <button
                            type="button"
                            className={styles.moveButton}
                            aria-label={`${titleOf(performance)} 아래로`}
                            disabled={!canMove(index, 1)}
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
                          disabled={liveBusy !== null}
                          onCheckedChange={(next) => void toggleLive(performance, next)}
                          inputProps={{ 'aria-label': `${titleOf(performance)} 공연 중` }}
                        />
                      }
                      onClick={() => navigate(`/performances/${performance.id}`)}
                    />
                  )
                })}
              </List>
            </section>
          ))
        )}
      </div>

      {/* 한 손 엄지가 닿는 우하단. 목록을 끝까지 내려도 자리를 지킨다.
          재정렬 중에는 하단 바가 그 자리를 쓰므로 감춘다 */}
      {!reordering && (
        // 스낵바가 이 버튼을 덮지 않고 그 위로 뜨게 감싼다 (AppLayout 의 탭바와 같은 이유)
        <SnackbarAvoidOverlap>
          <FloatingActionButton
            className={styles.fab}
            icon={<IconPlusLine />}
            label="공연 추가"
            onClick={() => navigate(`/performances/new?date=${date}`)}
          />
        </SnackbarAvoidOverlap>
      )}

      {/* 편집 화면의 저장 바와 같은 자리·같은 이유. 긴 라인업을 끝까지 내려도 닿는다.
          재정렬을 닫은 뒤에도 거부 사유는 남겨 왜 안 됐는지 보이게 한다 */}
      {(reordering || error) && (
        <div className={styles.footer}>
          {error && <Callout tone="critical" description={error} />}
          {reordering && (
            <div className={styles.footerRow}>
              <ActionButton size="large" loading={savingOrder} onClick={() => void saveOrder()}>
                순서 저장
              </ActionButton>
              <ActionButton
                size="large"
                variant="neutralWeak"
                disabled={savingOrder}
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

import { IconChevronDownLine, IconChevronUpLine } from '@karrotmarket/react-monochrome-icon'
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Chip } from 'seed-design/ui/chip'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { Switch } from 'seed-design/ui/switch'
import { performancesByDate, reorderPerformances, setLive } from '../mocks/store'
import {
  FESTIVAL_DATES,
  festivalDayLabel,
  findTranslation,
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
  const [rows, setRows] = useState<Performance[]>(() => performancesByDate(date))
  /** null 이 아니면 순서 편집 중. 확정 전까지는 이 배열만 움직인다 */
  const [order, setOrder] = useState<number[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 목을 직접 고치는 구조라 저장 뒤에는 다시 읽어야 화면이 따라온다.
  // 실제 API(#10)가 붙으면 이 자리가 재조회다.
  const reload = (target: string = date) => setRows(performancesByDate(target))

  const reordering = order !== null
  const listed = reordering
    ? order.map((id) => rows.find((p) => p.id === id)).filter((p): p is Performance => Boolean(p))
    : rows.filter((p) => typeFilter === 'all' || p.type === typeFilter)

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
      // 붙들고 있어봐야 계속 거부된다 — 최신 상태를 다시 읽고 편집을 닫는다.
      setError(rejected)
      setOrder(null)
      reload()
      return
    }
    setOrder(null)
    setError(null)
    reload()
    snackbar.create({ timeout: 3000, render: () => <Snackbar message="순서를 저장했습니다" /> })
  }

  const toggleLive = (performance: Performance, next: boolean) => {
    setLive(performance.id, next)
    reload()
    snackbar.create({
      timeout: 3000,
      render: () => (
        <Snackbar
          message={next ? `지금 공연: ${titleOf(performance)}` : '현재 공연을 내렸습니다'}
        />
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
            const next = String(value)
            setSearchParams({ date: next }, { replace: true })
            reload(next)
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

      {/* 재정렬은 일차 전체를 보내야 해서 (§5.6) 걸러진 목록 위에서는 할 수 없다.
          그래서 순서 편집 중에는 유형 필터를 감춘다 */}
      {!reordering && (
        <div className={styles.chips}>
          <Chip.RadioRoot
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(String(value))}
          >
            <Chip.RadioItem value="all">
              <Chip.Label>전체</Chip.Label>
            </Chip.RadioItem>
            {PERFORMANCE_TYPES.map((type) => (
              <Chip.RadioItem key={type} value={type}>
                <Chip.Label>{TYPE_LABELS[type]}</Chip.Label>
              </Chip.RadioItem>
            ))}
          </Chip.RadioRoot>
        </div>
      )}

      <div className={styles.actions}>
        {reordering ? (
          <>
            <ActionButton size="small" onClick={saveOrder}>
              순서 저장
            </ActionButton>
            <ActionButton
              size="small"
              variant="neutralWeak"
              onClick={() => {
                setOrder(null)
                setError(null)
              }}
            >
              취소
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              size="small"
              variant="neutralWeak"
              disabled={rows.length < 2}
              onClick={() => {
                setTypeFilter('all')
                setOrder(rows.map((p) => p.id))
              }}
            >
              순서 바꾸기
            </ActionButton>
            {/* 보고 있던 일차를 넘겨준다. 추가 화면이 그 일차로 열린다 */}
            <ActionButton size="small" onClick={() => navigate(`/performances/new?date=${date}`)}>
              공연 추가
            </ActionButton>
          </>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.list}>
        {listed.length === 0 ? (
          <p className={styles.empty}>이 일차에는 아직 공연이 없습니다.</p>
        ) : (
          <ul className={styles.rows}>
            {listed.map((performance, index) => {
              const missing = missingLanguages(performance.translations)
              return (
                <li
                  key={performance.id}
                  className={clsx(
                    styles.row,
                    performance.type === 'SPECIAL' && styles.special,
                    performance.is_live && styles.liveRow,
                  )}
                >
                  <button
                    type="button"
                    className={styles.rowMain}
                    disabled={reordering}
                    onClick={() => navigate(`/performances/${performance.id}`)}
                  >
                    <span className={styles.seq}>{reordering ? index + 1 : performance.seq}</span>
                    <span className={styles.rowText}>
                      <span className={styles.title}>
                        {titleOf(performance)}
                        {performance.is_live && <span className={styles.liveTag}>공연 중</span>}
                      </span>
                      <span className={styles.detail}>
                        {/* enum 에 네 번째 값이 생길 수 있다 (PRD §12 열린 질문 3).
                            모르는 값이면 빈칸 대신 원래 값을 보여준다 */}
                        {TYPE_LABELS[performance.type] ?? performance.type}
                        {missing.length > 0 && (
                          <span className={styles.langWarn}>{missing.join('·')} 없음</span>
                        )}
                      </span>
                    </span>
                  </button>

                  <div className={styles.rowAction}>
                    {reordering ? (
                      <>
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
                      </>
                    ) : (
                      <Switch
                        checked={performance.is_live}
                        onCheckedChange={(next) => toggleLive(performance, next)}
                        inputProps={{ 'aria-label': `${titleOf(performance)} 공연 중` }}
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

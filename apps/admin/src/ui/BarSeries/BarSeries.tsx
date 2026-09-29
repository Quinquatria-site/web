import clsx from 'clsx'
import styles from './BarSeries.module.css'

export interface BarSeriesProps {
  /** 칸마다의 값. 왼쪽부터 시간 순 */
  values: number[]
  /** 이 간격(칸 수)마다 아래에 눈금 글자를 단다 */
  tickEvery: number
  tickLabel: (index: number) => string
  /** 강조할 칸 (지금 판정에 쓴 칸 등). 없으면 강조하지 않는다 */
  highlight?: number
  /** 이 칸부터는 아직 오지 않은 시간이라 트랙만 옅게 그린다 */
  futureFrom?: number
}

/**
 * 세로 막대 여러 개로 시간 흐름을 보여준다. 방문 통계의 "오늘 15분 흐름" 이 쓴다.
 *
 * 차트 라이브러리를 들이지 않는다. 필요한 것이 막대 높이 하나라 CSS 로 충분하고,
 * admin 에 차트가 이것 하나뿐이다.
 *
 * Meter 와 같은 규칙을 따른다 — 채움은 brand 한 가지, 트랙은 brand-weak, 값에
 * 따라 경고색으로 바꾸지 않는다. 막대는 장식이라 aria-hidden 이고, 읽어야 할
 * 숫자(가장 붐빈 시간 등)는 부르는 쪽이 문장으로 옆에 둔다.
 */
export function BarSeries({ values, tickEvery, tickLabel, highlight, futureFrom }: BarSeriesProps) {
  const max = Math.max(0, ...values)

  return (
    <div className={styles.root}>
      <div className={styles.bars} aria-hidden="true">
        {values.map((value, index) => (
          <div
            key={index}
            className={clsx(
              styles.slot,
              futureFrom !== undefined && index >= futureFrom && styles.future,
              index === highlight && styles.highlight,
            )}
          >
            <div
              className={styles.fill}
              style={{ blockSize: `${max > 0 ? (value / max) * 100 : 0}%` }}
            />
          </div>
        ))}
      </div>
      <div className={styles.ticks} aria-hidden="true">
        {values.map((_, index) =>
          index % tickEvery === 0 ? (
            <span
              key={index}
              className={styles.tick}
              style={{ insetInlineStart: `${(index / values.length) * 100}%` }}
            >
              {tickLabel(index)}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}

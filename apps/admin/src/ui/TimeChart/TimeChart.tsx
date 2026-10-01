import { useEffect, useRef, useState, type PointerEvent } from 'react'
import styles from './TimeChart.module.css'

export interface TimeChartProps {
  /** 칸마다의 값. 왼쪽부터 시간 순, 하루를 고르게 나눈 칸이다 */
  values: number[]
  /** 이 칸부터는 아직 오지 않은 시간이라 선을 그리지 않는다 */
  futureFrom?: number
  /** 칸 번호 → "14:15" 같은 시각 */
  timeOf: (index: number) => string
  /** 이 칸 수마다 x 축 눈금을 단다 */
  tickEvery: number
  /** 눈금 글자. 칸 번호를 받는다 */
  tickLabel: (index: number) => string
  /** 툴팁의 값 앞말. 예: "조회" */
  valueName: string
  /** 스크린리더가 읽을 한 줄 요약 */
  summary: string
}

const HEIGHT = 168
const PAD = { top: 20, right: 12, bottom: 22, left: 36 }

/** y 축 맨 위 값을 1·2·5 단위로 올림한다. 눈금 4칸이 깔끔한 수가 되게 */
function niceMax(max: number): number {
  if (max <= 4) return 4
  const step = 10 ** Math.floor(Math.log10(max / 4))
  for (const unit of [1, 2, 5, 10]) {
    if (unit * step * 4 >= max) return unit * step * 4
  }
  return max
}

/**
 * 하루 시간 흐름 선 그래프. x 축 시각, y 축 값이다. 방문 통계의 "오늘 15분 흐름" 이 쓴다.
 *
 * 차트 라이브러리를 들이지 않는다. 선 하나·눈금·마우스 위치 표시가 전부라 SVG 로 충분하다.
 * 선은 brand 한 가지, 격자·축은 옅게 둔다. 가장 높은 칸에만 값을 바로 적고, 나머지는
 * 마우스·손가락을 올리면 세로선과 함께 시각·값을 띄운다.
 */
export function TimeChart({
  values,
  futureFrom = values.length,
  timeOf,
  tickEvery,
  tickLabel,
  valueName,
  summary,
}: TimeChartProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  // 카드 폭을 따라 다시 그린다. 폰을 돌리거나 창을 줄여도 가로 스크롤이 생기지 않게
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const last = Math.min(futureFrom, values.length) - 1
  const shown = values.slice(0, last + 1)
  const top = niceMax(Math.max(0, ...shown))
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const x = (index: number) => PAD.left + (index / values.length) * innerW
  const y = (value: number) => PAD.top + innerH - (value / top) * innerH

  const line = shown.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join('')
  const area = last >= 0 ? `${line}L${x(last)},${y(0)}L${x(0)},${y(0)}Z` : ''
  const peak = shown.length ? shown.indexOf(Math.max(...shown)) : -1
  const yTicks = [0, 1, 2, 3, 4].map((step) => (top / 4) * step)
  const xTicks = Array.from({ length: values.length / tickEvery + 1 }, (_, i) => i * tickEvery)

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    if (last < 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const index = Math.round(((event.clientX - rect.left - PAD.left) / innerW) * values.length)
    setHover(Math.min(last, Math.max(0, index)))
  }

  return (
    <div ref={boxRef} className={styles.root}>
      {width > 0 && (
        <svg
          className={styles.svg}
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={summary}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => setHover(null)}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                className={styles.grid}
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                className={styles.axis}
                x={PAD.left - 6}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {tick.toLocaleString('ko-KR')}
              </text>
            </g>
          ))}
          {xTicks.map((index) => (
            <text
              key={index}
              className={styles.axis}
              x={x(index)}
              y={HEIGHT - 6}
              textAnchor="middle"
            >
              {tickLabel(index)}
            </text>
          ))}
          {last >= 0 && (
            <>
              <path className={styles.area} d={area} />
              <path className={styles.line} d={line} />
            </>
          )}
          {peak >= 0 && shown[peak] > 0 && (
            <g>
              <circle className={styles.dot} cx={x(peak)} cy={y(shown[peak])} r={4} />
              {hover === null && (
                <text
                  className={styles.peak}
                  x={x(peak)}
                  y={y(shown[peak]) - 8}
                  textAnchor={
                    x(peak) > width - 60 ? 'end' : x(peak) < PAD.left + 40 ? 'start' : 'middle'
                  }
                >
                  {`${timeOf(peak)} · ${shown[peak].toLocaleString('ko-KR')}`}
                </text>
              )}
            </g>
          )}
          {hover !== null && (
            <g>
              <line
                className={styles.crosshair}
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={y(0)}
              />
              <circle className={styles.dot} cx={x(hover)} cy={y(shown[hover])} r={4} />
            </g>
          )}
        </svg>
      )}
      {hover !== null && (
        <div
          className={styles.tooltip}
          style={{ left: Math.min(Math.max(x(hover), 56), width - 56) }}
          aria-hidden="true"
        >
          <span>{timeOf(hover)}</span>
          <strong>{`${valueName} ${shown[hover].toLocaleString('ko-KR')}`}</strong>
        </div>
      )}
    </div>
  )
}

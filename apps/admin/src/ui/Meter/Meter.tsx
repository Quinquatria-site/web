import type { ReactNode } from 'react'
import styles from './Meter.module.css'

export interface MeterGroupProps {
  children: ReactNode
}

/**
 * Meter 여럿을 한 격자에 담는다. 각 Meter 가 제 격자를 가지면 라벨 길이에 따라
 * 막대 시작점이 줄마다 어긋나 서로 비교가 안 된다. 여기 한 격자에 넣고 Meter 는
 * display: contents 로 칸만 채운다.
 */
export function MeterGroup({ children }: MeterGroupProps) {
  return <div className={styles.group}>{children}</div>
}

export interface MeterProps {
  label: string
  value: number
  max: number
  /** 막대 옆에 붙는 수치. 생략하면 "value/max" */
  valueLabel?: string
}

/**
 * 한계 대비 비율 하나를 보여주는 막대. 준비 현황(번역·사진·메뉴)과 당일의
 * 카테고리별 운영 현황이 쓴다. MeterGroup 안에 넣어야 한다.
 *
 * 채움은 언제나 brand 한 가지다. 비율에 따라 경고색으로 바꾸지 않는다 —
 * 준비 초반에는 대부분의 막대가 비어 있는 것이 정상이라, 거기 빨강을 칠하면
 * 경고가 늑대소년이 된다. 막대가 비어 있다는 사실 자체가 이미 신호다.
 * 트랙은 같은 색의 옅은 단계(brand-weak)라 채움과 한 램프로 읽힌다.
 *
 * 수치는 늘 막대 **밖**에 글자로 붙는다. 막대 안에 넣으면 값이 작을 때 잘린다.
 * 그래서 막대 자체는 장식이고 aria-hidden 이다 — role="meter" 를 달면 옆에 이미
 * 보이는 라벨과 수치를 한 번 더 읽게 된다.
 */
export function Meter({ label, value, max, valueLabel }: MeterProps) {
  // max 가 0 인 줄은 애초에 넣지 않지만 0 나눗셈은 막아둔다
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ inlineSize: `${ratio * 100}%` }} />
      </div>
      <span className={styles.value}>{valueLabel ?? `${value}/${max}`}</span>
    </div>
  )
}

import type { CSSProperties } from 'react'

// 크레딧 칸은 폭 302 로 고정돼 줄바꿈이 없어서, 첫 선부터 '선명' 줄까지 어느 폰에서든 490px 이다
const LIGHT_SPEED = 490 / 5

/** 크레딧 칸 맨 위에서 y px 아래에 빛이 닿는 시각을 --credit-delay 로 준다 */
export function lightAt(y: number) {
  return { '--credit-delay': `${(y / LIGHT_SPEED).toFixed(2)}s` } as CSSProperties
}

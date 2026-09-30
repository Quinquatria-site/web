import type { TargetAndTransition } from 'motion/react'

/** 카드가 넘어갈 때 나가는 효과. 넘길 때마다 이 중 하나를 무작위로 고른다 */
export const EXIT_EFFECTS = ['tear', 'fling', 'burn', 'crumple', 'flip', 'dust', 'drop'] as const
/** 나가는 효과 이름 */
export type ExitEffect = (typeof EXIT_EFFECTS)[number]

/** 나가는 카드에 전하는 값. 넘긴 방향(1 다음, -1 이전)과 고른 효과 */
export type ExitPlan = { effect: ExitEffect; direction: 1 | -1; reduced: boolean }

/** 직전과 다른 효과를 무작위로 고른다. 같은 효과가 연달아 나오면 무작위처럼 느껴지지 않는다 */
export function pickExitEffect(previous: ExitEffect | null): ExitEffect {
  const pool = EXIT_EFFECTS.filter((effect) => effect !== previous)
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 찢어진 두 조각의 경계. 왼쪽 조각은 이 선의 왼쪽, 오른쪽 조각은 오른쪽을 잘라 그린다 */
const TEAR_SEAM = '52% 0, 47% 12%, 54% 25%, 46% 38%, 53% 50%, 45% 63%, 52% 76%, 46% 88%, 51% 100%'

/** 찢어진 왼쪽 조각의 clip-path */
export const TEAR_LEFT = `polygon(0 0, ${TEAR_SEAM}, 0 100%)`

/** 찢어진 오른쪽 조각의 clip-path. 경계를 거꾸로 따라 돈다 */
export const TEAR_RIGHT = `polygon(${TEAR_SEAM.split(', ').reverse().join(', ')}, 100% 100%, 100% 0)`

/** 찢어진 두 조각이 벌어지며 떨어지는 값. side 는 카드가 빠지는 쪽(-1 왼쪽, 1 오른쪽) */
export function tearPiece(piece: 'left' | 'right', side: number): TargetAndTransition {
  const apart = piece === 'left' ? -1 : 1
  return {
    x: side * 70 + apart * 60,
    y: piece === 'left' ? 170 : 210,
    rotate: apart * 16,
    opacity: 0,
    transition: { duration: 0.7, ease: [0.5, 0, 0.9, 0.6] },
  }
}

/** 타 들어가는 선의 시작 값. 선이 여기(-20%)에서 120% 까지 오르며 그 아래를 지운다 */
export const BURN_START = '-20%'

/** 효과마다 나가는 카드 전체가 움직이는 값. 찢어짐은 조각이 움직여 카드는 끝에 사라지기만 한다 */
export function exitTarget({ effect, direction, reduced }: ExitPlan): TargetAndTransition {
  // 다음으로 넘기면(1) 카드는 왼쪽(-1)으로 빠진다
  const side = -direction
  if (reduced) return { opacity: 0, transition: { duration: 0.2 } }
  switch (effect) {
    case 'tear':
      return { opacity: [1, 1, 0], transition: { duration: 0.7, times: [0, 0.9, 1] } }
    case 'fling':
      return {
        x: side * 520,
        y: -260,
        rotate: side * 70,
        opacity: 0,
        transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
      }
    case 'burn':
      return {
        '--burn': '120%',
        filter: 'sepia(0.6) saturate(1.4) brightness(0.85)',
        transition: { duration: 0.9, ease: 'easeIn' },
      }
    case 'crumple':
      return {
        scale: 0.12,
        rotate: side * 220,
        skewX: side * 18,
        x: side * 110,
        y: 230,
        opacity: 0,
        transition: { duration: 0.6, ease: 'easeIn' },
      }
    case 'flip':
      return {
        rotateY: side * 110,
        x: side * 90,
        opacity: 0,
        transformPerspective: 900,
        transition: { duration: 0.5, ease: 'easeIn' },
      }
    case 'dust':
      return {
        filter: 'blur(14px)',
        scale: 1.18,
        y: -70,
        x: side * 30,
        opacity: 0,
        transition: { duration: 0.65, ease: 'easeOut' },
      }
    case 'drop':
      return {
        y: 720,
        x: side * 50,
        rotate: side * 28,
        transition: { duration: 0.6, ease: [0.55, 0, 1, 0.45] },
      }
  }
}

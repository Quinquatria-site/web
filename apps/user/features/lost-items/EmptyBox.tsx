'use client'

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from 'motion/react'
import { useEffect, useState } from 'react'

type Point = readonly [number, number]

// 피그마 원본 그림(1588×991)의 좌표를 그대로 쓰고, 208×146 틀에 들어오는 부분만 viewBox 로 자른다
const VIEW_BOX = '185 71 1244 873'

const BLOB =
  'M600 248C800 220 1050 330 1180 440C1300 540 1330 700 1230 770C1120 840 820 815 600 780C420 750 290 660 290 550C290 430 450 290 600 248Z'

// 윗면 마름모의 네 꼭짓점과 가운데. 뚜껑 날개는 앞쪽 두 모서리(L-F, F-R)에 달려 있다
const L: Point = [535, 375]
const B: Point = [790, 283]
const R: Point = [1040, 368]
const F: Point = [792, 470]
const C: Point = [791, 376]

// 닫히면 날개가 윗면 절반씩을 덮고, 열리면 바깥 아래로 젖혀진다. 꼭짓점 순서가 같아야 사이를 이을 수 있다
const LEFT_FLAP = { closed: [L, F, C, B], open: [L, F, [718, 585], [460, 492]] } as const
const RIGHT_FLAP = { closed: [F, R, B, C], open: [F, R, [1118, 488], [866, 585]] } as const

const COLOR = {
  blob: '#fdefe4',
  innerLeft: '#deac93',
  innerRight: '#ebbfa6',
  frontLeft: '#f5d4be',
  frontRight: '#ecc2aa',
  flapLeft: '#f9e7d7',
  flapRight: '#f7ddcd',
}

/** 닫힌 채 잠깐 두었다가 튀어 오르기 시작하는 시각(초) */
const HOP_DELAY = 0.4

// 웅크렸다가 튀어 오르고, 내려앉으며 한 번 더 눌린다
const HOP = {
  y: [0, 0, -70, 0, 0],
  scaleX: [1, 1.06, 0.96, 1.04, 1],
  scaleY: [1, 0.9, 1.05, 0.94, 1],
}
const HOP_TRANSITION: Transition = {
  duration: 0.6,
  times: [0, 0.2, 0.5, 0.8, 1],
  ease: 'easeInOut',
  delay: HOP_DELAY,
}

// 꼭대기에서 날개가 열리고, 낮은 damping 으로 한참 출렁인다
const FLAP_SPRING: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 11,
  delay: HOP_DELAY + 0.25,
}

// 상자 입구에서 궤도 시작점까지의 거리(px). 궤도 경로는 empty-box.css 와 맞춘다
const BUTTERFLY_FROM = { x: -72, y: 15 }
const BUTTERFLY_SPRING: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 12,
  delay: HOP_DELAY + 0.45,
}

const toPath = (points: readonly Point[]) => `M${points.map(([x, y]) => `${x} ${y}`).join('L')}Z`

// 1 을 넘는 값도 그대로 이어 그려서 스프링이 지나쳐 젖혀지는 모습이 나온다
const flapPath = (flap: typeof LEFT_FLAP | typeof RIGHT_FLAP, t: number) =>
  toPath(
    flap.closed.map(([x, y], i) => {
      const [ox, oy] = flap.open[i]
      return [x + (ox - x) * t, y + (oy - y) * t] as const
    }),
  )

// 같은 색 굵은 테두리로 모서리를 둥글린다
const face = (fill: string) => ({
  fill,
  stroke: fill,
  strokeWidth: 16,
  strokeLinejoin: 'round' as const,
})

/** 빈 분실물 화면 그림. 닫힌 상자가 튀어 오르며 열리고, 나온 나비가 상자 둘레를 계속 돈다 */
export function EmptyBox() {
  const reduce = useReducedMotion()
  const open = useMotionValue(0)
  const leftFlap = useTransform(open, (t) => flapPath(LEFT_FLAP, t))
  const rightFlap = useTransform(open, (t) => flapPath(RIGHT_FLAP, t))
  const [orbiting, setOrbiting] = useState(false)

  useEffect(() => {
    if (reduce) {
      open.jump(1)
      return
    }
    const controls = animate(open, 1, FLAP_SPRING)
    return () => controls.stop()
  }, [open, reduce])

  return (
    <div aria-hidden className="relative h-[146px] w-[208px]">
      <svg viewBox={VIEW_BOX} className="absolute inset-0 size-full overflow-visible">
        <path d={BLOB} fill={COLOR.blob} />
        {/* 아래 모서리를 기준으로 눌려야 바닥에 닿는 느낌이 난다 */}
        <motion.g
          style={{ originX: 0.5, originY: 1 }}
          animate={reduce ? undefined : HOP}
          transition={HOP_TRANSITION}
        >
          <path d={toPath([L, B, F])} {...face(COLOR.innerLeft)} />
          <path d={toPath([B, R, F])} {...face(COLOR.innerRight)} />
          <path d={toPath([[530, 377], F, [792, 765], [530, 668]])} {...face(COLOR.frontLeft)} />
          <path d={toPath([F, [1048, 372], [1048, 665], [792, 765]])} {...face(COLOR.frontRight)} />
          <motion.path d={leftFlap} {...face(COLOR.flapLeft)} />
          <motion.path d={rightFlap} {...face(COLOR.flapRight)} />
        </motion.g>
      </svg>
      {/* 궤도 시작점에 서 있다가, 나비가 다 나오면 그 자리부터 궤도를 따라 돈다 */}
      <div
        className={`butterfly-orbit absolute top-0 left-0 ${orbiting ? 'motion-safe:animate-butterfly-orbit' : ''}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0, ...BUTTERFLY_FROM }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={reduce ? { duration: 0 } : BUTTERFLY_SPRING}
          onAnimationComplete={() => setOrbiting(!reduce)}
        >
          <Butterfly />
        </motion.div>
      </div>
    </div>
  )
}

function Butterfly() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[22px] motion-safe:animate-butterfly-flutter"
      fill="none"
      stroke="#c9846f"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 12C10 11 5 10 4.5 6.5C4 3.5 7.5 2.5 9.5 4.5C11 6 11.5 9 12 12" />
      <path d="M12 12C13 10.5 16 8 19 8C22 8 22.5 11.5 20 12.5C18 13.3 14 12.8 12 12" />
      <path d="M12 12C10.5 12.5 8 13 7 14.5C6.2 15.8 7.8 16.5 9 15.8C10.5 15 11.5 13.5 12 12" />
      <path d="M12 12C12.2 14 13 16.5 14.5 17.3C16 18 16.8 16.5 15.8 15.3C14.8 14 13.5 12.8 12 12" />
    </svg>
  )
}

'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { SparkleOrnament } from '@/shared/ornament/SparkleOrnament'
import { NODES } from './scene'

// 빌드와 브라우저가 같은 하늘을 그려야 hydration 이 어긋나지 않아 고정 씨앗으로 뽑는다
function seeded(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647
}
const random = seeded(7)
const STARS = Array.from({ length: 60 }, () => ({
  left: random() * 100,
  top: random() * 100,
  delay: random() * 3,
  peak: 0.3 + random() * 0.7,
}))

// 장식 별 → Made by → 단체명 → 점·선·이름을 차례로. 점 하나에 0.55초씩
const NODE_START = 1.6
const NODE_GAP = 0.55
const CUE_AT = NODE_START + NODE_GAP * NODES.length + 1.2

const GLOW = 'drop-shadow-[0_0_8px_rgb(253_235_184/0.9)] drop-shadow-[0_0_20px_rgb(249_163_66/0.6)]'

/** 들어오자마자 그려지는 별자리 인트로. 스크롤해 카드로 넘어가면 선·이름이 지워지고 점은 카드에 자리를 내준다 */
export function Constellation({
  names,
  positions,
  organization,
  size,
  enter,
  reduce,
}: {
  names: string[]
  positions: string[]
  organization: string
  size: { width: number; height: number }
  enter: MotionValue<number>
  reduce: boolean
}) {
  const textOpacity = useTransform(enter, (e) => 1 - e * 2.5)
  const dotOpacity = useTransform(enter, (e) => (e > 0.15 ? 0 : 1))
  const skyOpacity = useTransform(enter, (e) => 1 - e * 0.5)
  const cueOpacity = useTransform(enter, (e) => 1 - e * 20)
  const points = NODES.map((node) => [size.width / 2 + node.x, node.y * size.height])
  // 움직임 줄이기를 켜면 흐림·튕김 없이 바로 보이게 한다
  const delayed = (delay: number) => (reduce ? { duration: 0 } : { delay, duration: 0.8 })

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute top-[30%] left-1/2 size-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(249_163_66/0.22),transparent_65%)] blur-[10px]"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={delayed(0)}
      />
      <motion.div className="absolute inset-0" style={{ opacity: skyOpacity }}>
        {STARS.map((star) => (
          <motion.span
            key={`${star.left}-${star.top}`}
            className="absolute size-0.5 rounded-full bg-white"
            style={{ left: `${star.left}%`, top: `${star.top}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [star.peak, 0.15, star.peak] }}
            transition={{ duration: 3, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-x-0 top-6 flex flex-col items-center gap-2 text-center text-base"
        style={{ opacity: textOpacity }}
      >
        <motion.div
          className={GLOW}
          initial={{ opacity: 0, scale: 0, rotate: -270 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 110, damping: 12 }}
        >
          <SparkleOrnament />
        </motion.div>
        <p className="font-cinzel tracking-[0.12em]">
          {[...'Made by'].map((char, i) => (
            <motion.span
              key={i}
              className="inline-block whitespace-pre"
              initial={{ opacity: 0, y: reduce ? 0 : 10, filter: reduce ? 'none' : 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={delayed(0.45 + i * 0.07)}
            >
              {char}
            </motion.span>
          ))}
        </p>
        <motion.p
          className="font-paperlogy font-light tracking-[0.04em]"
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={delayed(1.1)}
        >
          {organization}
        </motion.p>
      </motion.div>

      {size.width > 0 && (
        <motion.svg
          className="absolute inset-0 size-full overflow-visible"
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ opacity: textOpacity }}
        >
          {points.slice(1).map(([x, y], i) => (
            <motion.path
              key={i}
              d={`M${points[i][0]} ${points[i][1]} L${x} ${y}`}
              fill="none"
              stroke="rgb(253 235 184 / 0.55)"
              strokeWidth={1}
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { delay: NODE_START + (i + 1) * NODE_GAP - 0.4, duration: 0.45 }
              }
            />
          ))}
        </motion.svg>
      )}

      {NODES.map((node, i) => {
        const at = NODE_START + i * NODE_GAP
        return (
          <motion.div
            key={names[i]}
            className="absolute"
            style={{ left: `calc(50% + ${node.x}px)`, top: `${node.y * 100}%` }}
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ delay: at + 1, duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div style={{ opacity: dotOpacity }}>
              <motion.span
                className="absolute -top-2.5 -left-2.5 size-5 rounded-full border border-(--beige-yellow)"
                initial={{ opacity: 0 }}
                animate={reduce ? undefined : { opacity: [0.9, 0], scale: [1, 3.2] }}
                transition={{ delay: at, duration: 1 }}
              />
              <motion.span
                className="absolute -top-[5px] -left-[5px] size-2.5 rounded-full bg-(--beige-yellow) shadow-[0_0_10px_3px_rgb(249_163_66/0.8),0_0_30px_8px_rgb(249_163_66/0.35)]"
                initial={{ scale: reduce ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 12, delay: at }
                }
              />
            </motion.div>
            <motion.div
              className={`absolute -top-3 font-cinzel text-[17px] tracking-[0.06em] whitespace-nowrap [text-shadow:0_0_12px_rgb(249_163_66/0.6)] ${node.side === 'right' ? 'left-4' : 'right-4 text-right'}`}
              style={{ opacity: textOpacity }}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  x: reduce ? 0 : node.side === 'right' ? -10 : 10,
                  filter: reduce ? 'none' : 'blur(10px)',
                }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={delayed(at + 0.1)}
              >
                {names[i]}
                <small className="block font-sans text-[11px] tracking-[0.08em] opacity-60 [text-shadow:none]">
                  {positions[i]}
                </small>
              </motion.div>
            </motion.div>
          </motion.div>
        )
      })}

      <motion.p
        className="absolute inset-x-0 text-center font-cinzel text-[11px] tracking-[0.3em]"
        // 바닥이 아닌 마지막 별 아래에 붙여 폰 높이가 달라도 이름과의 간격이 같다
        style={{ top: `calc(${NODES[NODES.length - 1].y * 100}% + 56px)`, opacity: cueOpacity }}
      >
        <motion.span
          className="inline-block"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.7 } : { opacity: 0.7, y: [0, 6, 0] }}
          transition={{
            opacity: { delay: reduce ? 0 : CUE_AT, duration: 0.6 },
            y: { delay: CUE_AT, duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          SCROLL ↓
        </motion.span>
      </motion.p>
    </div>
  )
}

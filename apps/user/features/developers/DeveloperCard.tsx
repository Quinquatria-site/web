'use client'

import { motion, useTransform, type MotionValue, type Variants } from 'motion/react'
import Image from 'next/image'
import type { Member } from './members'
import { CARD_STEP, NODES, clamp01 } from './scene'
import { SnsLinks } from './SnsLinks'

// 노을 팔레트를 카드마다 돌려 써서 옆 카드와 색이 겹치지 않게 한다
const BACKGROUNDS = [
  'linear-gradient(160deg, var(--sunlight), var(--twilight))',
  'linear-gradient(160deg, var(--beige-rose), var(--brown))',
  'linear-gradient(160deg, var(--beige-yellow), var(--brick))',
  'linear-gradient(160deg, var(--beige-coral), var(--twilight) 80%)',
  'linear-gradient(160deg, var(--marigold), var(--brown))',
]

// 가운데에서 300px 벗어나면 다 기울고 다 작아진 것으로 본다
const FALLOFF = 300

const pop = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 30, rotate: reduce ? 0 : 12 },
  shown: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 380, damping: 18 },
  },
})

const fade = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 10, scale: reduce ? 1 : 0.4 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 15 },
  },
})

/** 개발진 카드 한 장. 자기 별 점에서 커져 나오고, 가운데서 멀수록 기울고 어두워지며, 처음 가운데 오면 글자가 튀어나온다 */
export function DeveloperCard({
  index,
  member,
  department,
  enter,
  cards,
  span,
  stageHeight,
  revealed,
  reduce,
}: {
  index: number
  member: Member
  department: string
  enter: MotionValue<number>
  cards: MotionValue<number>
  span: number
  stageHeight: MotionValue<number>
  revealed: boolean
  reduce: boolean
}) {
  const node = NODES[index]
  // 화면 가운데를 0 으로 둔 이 카드의 가로 위치
  const offset = useTransform(cards, (c) => index * CARD_STEP - c * span)
  const distance = useTransform(offset, (o) => Math.min(Math.abs(o) / FALLOFF, 1))
  const x = useTransform([offset, enter], ([o, e]: number[]) =>
    reduce ? 0 : (node.x - o) * (1 - e),
  )
  const y = useTransform([stageHeight, enter], ([h, e]: number[]) =>
    reduce ? 0 : (node.y - 0.5) * h * (1 - e),
  )
  const scale = useTransform(
    [distance, enter],
    ([d, e]: number[]) => (reduce ? 1 : 0.04 + 0.96 * e) * (1 - d * 0.16),
  )
  const rotateY = useTransform(offset, (o) =>
    reduce ? 0 : Math.max(-1, Math.min(1, o / FALLOFF)) * -28,
  )
  const opacity = useTransform(enter, (e) => clamp01(reduce ? e : e * 4))
  // brightness 필터는 매 프레임 다시 그려 폰에서 끊겨서 검은 막의 투명도로 어둡게 한다
  const dim = useTransform(distance, (d) => d * 0.35)

  return (
    // 원근은 안쪽에만 건다. 날아가는 이동과 같은 transform 에 두면 멀리 간 카드가 뒤집혀 보인다
    <motion.li
      className="pointer-events-auto shrink-0"
      style={{ x, y, scale, opacity }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.025 } } }}
      initial="hidden"
      animate={revealed ? 'shown' : 'hidden'}
    >
      <motion.div
        className="relative h-[410px] w-[264px] rounded-[22px] p-3.5 text-text shadow-[0_20px_40px_rgb(0_0_0/0.45)]"
        style={{ rotateY, transformPerspective: 1100, background: BACKGROUNDS[index] }}
      >
        <motion.div
          className="relative h-[252px] overflow-hidden rounded-[14px] bg-linear-to-b from-bg/55 to-bg/20"
          variants={{ hidden: { scale: 1.08 }, shown: { scale: 1 } }}
        >
          {member.photo ? (
            <Image
              src={member.photo}
              alt=""
              fill
              sizes="236px"
              className="object-contain object-bottom"
            />
          ) : (
            <svg
              aria-hidden
              viewBox="0 0 100 90"
              className="absolute bottom-0 left-1/2 w-[150px] -translate-x-1/2 fill-secondary opacity-50"
            >
              <circle cx="50" cy="30" r="18" />
              <path d="M14 90c0-22 16-36 36-36s36 14 36 36z" />
            </svg>
          )}
          <span
            aria-hidden
            className="absolute top-2.5 right-3 font-cinzel text-[34px] leading-none font-bold text-text-inverse/85"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </motion.div>
        <h2
          aria-label={member.name}
          className="mt-3.5 font-cinzel text-[23px] leading-[1.1] font-bold tracking-[0.02em]"
        >
          {[...member.name].map((char, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block whitespace-pre"
              variants={pop(reduce)}
            >
              {char}
            </motion.span>
          ))}
        </h2>
        <motion.p
          className="mt-1.5 text-xs font-semibold tracking-[0.02em] opacity-80"
          variants={fade(reduce)}
        >
          {department} · {member.position}
        </motion.p>
        <SnsLinks links={member.links} variants={fade(reduce)} />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[22px] bg-black"
          style={{ opacity: dim }}
        />
      </motion.div>
    </motion.li>
  )
}

'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import type { Member } from '../members'
import { CARD_STEP, clamp01 } from '../scene'
import { CardName } from './CardName'
import { CardPhoto } from './CardPhoto'
import { SnsLinks } from './SnsLinks'
import { fade } from './variants'

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

/** 개발진 카드 한 장. 자기 별빛이 날아와 닿으면 나타나고, 가운데서 멀수록 기울고 어두워지며, 처음 가운데 오면 글자가 튀어나온다 */
export function DeveloperCard({
  index,
  member,
  department,
  enter,
  cards,
  span,
  revealed,
  reduce,
}: {
  index: number
  member: Member
  department: string
  enter: MotionValue<number>
  cards: MotionValue<number>
  span: number
  revealed: boolean
  reduce: boolean
}) {
  // 화면 가운데를 0 으로 둔 이 카드의 가로 위치
  const offset = useTransform(cards, (c) => index * CARD_STEP - c * span)
  const distance = useTransform(offset, (o) => Math.min(Math.abs(o) / FALLOFF, 1))
  const scale = useTransform(distance, (d) => 1 - d * 0.16)
  const rotateY = useTransform(offset, (o) =>
    reduce ? 0 : Math.max(-1, Math.min(1, o / FALLOFF)) * -28,
  )
  // 크기를 스크롤에 붙이면 Safari 가 매 프레임 다시 그려서, 별빛이 닿을 즈음 제자리에서 투명도로만 나타난다
  const opacity = useTransform(enter, (e) => (reduce ? e : clamp01((e - 0.45) / 0.4)))
  // brightness 필터는 매 프레임 다시 그려 폰에서 끊겨서 검은 막의 투명도로 어둡게 하고, 막은 따로 레이어로 올린다
  const dim = useTransform(distance, (d) => d * 0.35)

  return (
    // 원근은 안쪽에만 건다. 바깥 크기와 같은 transform 에 두면 멀리 간 카드가 뒤집혀 보인다
    // 스크롤마다 바뀌는 transform 을 레이어로 미리 올려 iOS 가 카드 그림을 매 프레임 다시 그리지 않게 한다
    <motion.li
      className="pointer-events-auto shrink-0 will-change-transform"
      style={{ scale, opacity }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.025 } } }}
      initial="hidden"
      animate={revealed ? 'shown' : 'hidden'}
    >
      <motion.div
        className="relative h-[410px] w-[264px] rounded-[22px] p-3.5 text-text shadow-[0_20px_40px_rgb(0_0_0/0.45)] will-change-transform"
        style={{ rotateY, transformPerspective: 1100, background: BACKGROUNDS[index] }}
      >
        <CardPhoto photo={member.photo} index={index} />
        <CardName name={member.name} reduce={reduce} />
        <motion.p
          className="mt-1.5 text-xs font-semibold tracking-[0.02em] opacity-80"
          variants={fade(reduce)}
        >
          {department} · {member.position}
        </motion.p>
        <SnsLinks links={member.links} variants={fade(reduce)} />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[22px] bg-black will-change-[opacity]"
          style={{ opacity: dim }}
        />
      </motion.div>
    </motion.li>
  )
}

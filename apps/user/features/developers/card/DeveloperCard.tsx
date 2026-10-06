'use client'

import { motion } from 'motion/react'
import type { Member } from '../members'
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

// 옆 카드 모양(크기 scale-84). 크기·기울기를 스크롤에 붙이면 Safari 가 카드를 매 프레임 다시 그려서, 가운데가 바뀔 때만 transition 으로 한 번 바꾼다
const SIDE_TILT = 28
const SIDE_DIM = 0.35
const EASE = 'cubic-bezier(.22,1,.36,1)'
const SETTLE = 'duration-500 ease-[cubic-bezier(.22,1,.36,1)]'

/** 개발진 카드 한 장. 자기 별빛이 날아와 닿으면 나타나고, 가운데가 아니면 작게 기울어 어두워지며, 처음 가운데 오면 글자가 튀어나온다 */
export function DeveloperCard({
  index,
  member,
  department,
  entered,
  active,
  revealed,
  reduce,
}: {
  index: number
  member: Member
  department: string
  entered: boolean
  /** 지금 가운데 선 카드 번호 */
  active: number
  revealed: boolean
  reduce: boolean
}) {
  // 가운데보다 오른쪽이면 1, 왼쪽이면 -1. 오른쪽 카드는 왼쪽으로, 왼쪽 카드는 오른쪽으로 기울어 가운데를 본다
  const side = Math.sign(index - active)

  return (
    // 원근은 안쪽에만 건다. 바깥 크기와 같은 transform 에 두면 멀리 간 카드가 뒤집혀 보인다
    <motion.li
      className={`shrink-0 snap-center ${side ? 'scale-84' : 'scale-100'}`}
      style={{
        // 별빛이 카드 자리에 닿을 즈음 제자리에서 투명도로만 나타난다
        opacity: entered ? 1 : 0,
        transition: reduce ? 'none' : `scale 0.5s ${EASE}, opacity 0.6s ease-out 0.45s`,
      }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.025 } } }}
      initial="hidden"
      animate={revealed ? 'shown' : 'hidden'}
    >
      <div
        className={`relative h-[410px] w-[264px] rounded-[22px] p-3.5 text-text shadow-[0_20px_40px_rgb(0_0_0/0.45)] transition-transform ${reduce ? 'duration-0' : SETTLE}`}
        style={{
          transform: `perspective(1100px) rotateY(${reduce ? 0 : side * -SIDE_TILT}deg)`,
          background: BACKGROUNDS[index],
        }}
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
        {/* brightness 필터는 바꿀 때마다 다시 그려 폰에서 끊겨서 검은 막의 투명도로 어둡게 한다 */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-[22px] bg-black transition-opacity ${reduce ? 'duration-0' : SETTLE}`}
          style={{ opacity: side ? SIDE_DIM : 0 }}
        />
      </div>
    </motion.li>
  )
}

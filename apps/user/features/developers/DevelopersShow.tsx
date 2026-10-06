'use client'

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cinzel } from '@/shared/fonts'
import { paperlogy } from '@/shared/fonts/paperlogy'
import { Constellation } from './Constellation'
import { DeveloperCard } from './DeveloperCard'
import type { Member } from './members'
import { CARD_STEP, phases, scrollScreens } from './scene'

const BACK_TEXT = 'DEVELOPERS ✦ DEVELOPERS ✦ DEVELOPERS ✦ '
const BACK_CLASS =
  'absolute left-0 font-cinzel text-[130px] leading-none font-bold whitespace-nowrap text-transparent'

/** 별자리 인트로 뒤 가로 카드로 이어지는 개발진 소개. 감싼 높이만큼 스크롤하는 동안 화면은 고정된다 */
export function DevelopersShow({
  title,
  organization,
  members,
  departments,
}: {
  title: ReactNode
  organization: string
  members: Member[]
  departments: Record<Member['id'], string>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const count = members.length
  const span = CARD_STEP * (count - 1)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const stageHeight = useMotionValue(0)
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
      stageHeight.set(height)
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [stageHeight])

  const { scrollY, scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  })
  const enter = useTransform(scrollYProgress, (p) => phases(p, count).enter)
  const cards = useTransform(scrollYProgress, (p) => phases(p, count).cards)
  const trackX = useTransform(cards, (c) => -c * span)
  const backX = useTransform(cards, (c) => -200 + c * 300)
  const backX2 = useTransform(cards, (c) => -c * 400)
  const backOpacity = useTransform(enter, (e) => (e - 0.6) / 0.4)

  // 빨리 굴리면 카드 줄이 기울고, 멈추면 스프링이 튕기며 바로 세운다
  const velocity = useVelocity(scrollY)
  const skewTarget = useTransform([velocity, enter], ([v, e]: number[]) =>
    reduce || e < 1 ? 0 : Math.max(-12, Math.min(12, -v / 160)),
  )
  const skewX = useSpring(skewTarget, { stiffness: 260, damping: 12 })

  // 가운데 온 적 있는 카드까지 글자를 띄운다. 넘기는 방향은 한쪽이라 가장 먼 번호만 들고 있으면 된다
  const [reached, setReached] = useState(-1)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const { enter, cards } = phases(p, count)
    if (enter > 0.97) setReached((prev) => Math.max(prev, Math.round(cards * (count - 1))))
  })

  return (
    <div
      ref={wrapRef}
      className={`${cinzel.variable} ${paperlogy.variable} relative text-text-inverse`}
      style={{ height: `${(1 + scrollScreens(count)) * 100}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {title}
        <div ref={stageRef} className="absolute inset-x-0 top-(--page-title-height) bottom-0">
          <Constellation
            names={members.map((member) => member.name)}
            positions={members.map((member) => member.position)}
            organization={organization}
            size={size}
            enter={enter}
            reduce={reduce}
          />
          <motion.div aria-hidden className="pointer-events-none" style={{ opacity: backOpacity }}>
            <motion.p
              className={`${BACK_CLASS} [-webkit-text-stroke:1px_rgb(253_235_184/0.22)]`}
              style={{ top: '6%', x: backX }}
            >
              {BACK_TEXT}
            </motion.p>
            <motion.p
              className={`${BACK_CLASS} [-webkit-text-stroke:1px_rgb(249_163_66/0.25)]`}
              style={{ top: '78%', x: backX2 }}
            >
              {BACK_TEXT}
            </motion.p>
          </motion.div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[410px] -translate-y-1/2">
            <motion.ul
              className="flex gap-[22px] pl-[calc(50%-132px)]"
              style={{ x: trackX, skewX }}
            >
              {members.map((member, i) => (
                <DeveloperCard
                  key={member.id}
                  index={i}
                  member={member}
                  department={departments[member.id]}
                  enter={enter}
                  cards={cards}
                  span={span}
                  stageHeight={stageHeight}
                  revealed={i <= reached}
                  reduce={reduce}
                />
              ))}
            </motion.ul>
          </div>
          <motion.div
            aria-hidden
            className="absolute inset-x-10 top-[calc(50%+235px)] h-0.5 bg-(--beige-yellow)/20"
            style={{ opacity: backOpacity }}
          >
            <motion.span
              className="absolute inset-0 origin-left bg-primary"
              style={{ scaleX: cards }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

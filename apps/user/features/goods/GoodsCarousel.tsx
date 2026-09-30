'use client'

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react'
import { useState } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { formatPrice } from './format-price'
import { CARD_FRAME, GoodsCard } from './GoodsCard'
import type { Goods } from './goods'

// 이만큼(px) 넘게 밀거나 빠르게 튕기면 옆 굿즈로 넘긴다
const SWIPE_OFFSET = 60
const SWIPE_VELOCITY = 400

const SLIDE = { type: 'spring', bounce: 0, duration: 0.35 } as const

// 좌우 꺾쇠. 왼쪽은 같은 모양을 뒤집는다
function Chevron({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`size-5 fill-current ${flip ? 'rotate-180' : ''}`}
    >
      <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
    </svg>
  )
}

/** 굿즈를 한 장씩 넘겨 보는 카드 더미. 꺾쇠나 좌우로 밀어 넘기고 끝에서는 처음으로 돌아간다 */
export function GoodsCarousel({ goods }: { goods: Goods[] }) {
  const locale = useLocale()
  const { goods: text } = getMessages(locale)
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  // 넘긴 방향. 새 카드가 그쪽에서 들어온다
  const [direction, setDirection] = useState(1)

  const go = (step: 1 | -1) => {
    setDirection(step)
    setIndex((i) => (i + step + goods.length) % goods.length)
  }

  const handleDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) go(1)
    else if (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY) go(-1)
  }

  const current = goods[index]
  const item = text.items[current.id]
  const shift = reduced ? 0 : 40

  return (
    <section className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full max-w-[331px]">
        {/* 뒤에 비스듬히 겹친 빈 카드 두 장. 더미처럼 보이게 하는 꾸밈이다 */}
        <div aria-hidden className={`${CARD_FRAME} absolute inset-0 -rotate-3`} />
        <div aria-hidden className={`${CARD_FRAME} absolute inset-0 rotate-3`} />
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * shift }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * shift }}
            transition={SLIDE}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            // 앞 카드만 기울여 흐트러진 더미를 만들고, 사진의 브라우저 그림 끌기가 밀기를 가로채지 않게 한다
            className="relative rotate-1 touch-pan-y [&_img]:pointer-events-none"
          >
            <GoodsCard
              image={current.image.src}
              name={item.name}
              price={formatPrice(current.price, locale)}
              description={item.description}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 text-text">
        <button
          type="button"
          aria-label={text.previous}
          onClick={() => go(-1)}
          className="-m-2 p-2"
        >
          <Chevron flip />
        </button>
        <p aria-live="polite" className="text-xs leading-[1.288] font-medium tabular-nums">
          {index + 1} / {goods.length}
        </p>
        <button type="button" aria-label={text.next} onClick={() => go(1)} className="-m-2 p-2">
          <Chevron />
        </button>
      </div>
    </section>
  )
}

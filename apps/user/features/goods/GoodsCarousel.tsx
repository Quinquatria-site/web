'use client'

import { AnimatePresence, useReducedMotion, type PanInfo } from 'motion/react'
import { useState } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { formatPrice } from './format-price'
import { pickExitEffect, type ExitPlan } from './exit-effects'
import { CARD_FRAME, GoodsCard } from './GoodsCard'
import { GoodsSwipeCard } from './GoodsSwipeCard'
import type { Goods } from './goods'

// 이만큼(px) 넘게 밀거나 빠르게 튕기면 옆 굿즈로 넘긴다
const SWIPE_OFFSET = 60
const SWIPE_VELOCITY = 400

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
  // 넘긴 방향과 떠나는 카드의 효과. 새 카드는 넘긴 쪽에서 들어오고 옛 카드는 반대로 사라진다
  const [plan, setPlan] = useState<ExitPlan>({ effect: 'fling', direction: 1, reduced: false })

  const go = (step: 1 | -1) => {
    setPlan((prev) => ({
      effect: pickExitEffect(prev.effect),
      direction: step,
      reduced: Boolean(reduced),
    }))
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
        <AnimatePresence mode="popLayout" initial={false} custom={plan}>
          <GoodsSwipeCard
            key={current.id}
            enterFrom={plan.direction * shift}
            onDragEnd={handleDragEnd}
          >
            <GoodsCard
              image={current.image.src}
              name={item.name}
              price={formatPrice(current.price, locale)}
              description={item.description}
            />
          </GoodsSwipeCard>
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

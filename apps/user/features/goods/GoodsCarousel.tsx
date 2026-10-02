'use client'

import { AnimatePresence, useReducedMotion, type PanInfo } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { formatPrice } from './format-price'
import { CARD_FRAME, GoodsCard } from './GoodsCard'
import { GoodsSwipeCard } from './GoodsSwipeCard'
import type { Goods } from './goods'
import doubleChevron from './images/double-chevron.svg'

// 이만큼(px) 넘게 밀거나 빠르게 튕기면 옆 굿즈로 넘긴다
const SWIPE_OFFSET = 60
const SWIPE_VELOCITY = 400

// 아래를 가리키는 겹꺾쇠 그림을 돌려 왼쪽·오른쪽으로 쓴다
const ARROWS = [
  { step: -1, side: '-left-2.5', turn: 'rotate-90' },
  { step: 1, side: '-right-2.5', turn: '-rotate-90' },
] as const

/** 굿즈를 한 장씩 넘겨 보는 카드 더미. 꺾쇠나 좌우로 밀어 넘기고 끝에서는 처음으로 돌아간다 */
export function GoodsCarousel({ goods }: { goods: Goods[] }) {
  const locale = useLocale()
  const { goods: text } = getMessages(locale)
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  // 넘긴 방향(1 다음, -1 이전). 새 카드는 그쪽에서 들어오고 옛 카드는 반대로 빠진다
  const [direction, setDirection] = useState<1 | -1>(1)

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
    <section className="relative w-full max-w-[331px]">
      {/* 뒤에 비스듬히 겹친 빈 카드 두 장. 더미처럼 보이게 하는 꾸밈이다 */}
      <div aria-hidden className={`${CARD_FRAME} absolute inset-0 -rotate-3`} />
      <div aria-hidden className={`${CARD_FRAME} absolute inset-0 rotate-3`} />
      {/* AnimatePresence 의 custom 은 떠나는 카드만 받아서, 들어오는 카드에는 shift 로 따로 준다 */}
      <AnimatePresence mode="popLayout" initial={false} custom={direction * shift}>
        <GoodsSwipeCard key={current.id} shift={direction * shift} onDragEnd={handleDragEnd}>
          <GoodsCard
            image={current.image.src}
            name={item.name}
            price={formatPrice(current.price, locale)}
            order={index + 1}
          />
        </GoodsSwipeCard>
      </AnimatePresence>
      {ARROWS.map(({ step, side, turn }) => (
        <button
          key={step}
          type="button"
          aria-label={step === 1 ? text.next : text.previous}
          onClick={() => go(step)}
          className={`absolute top-1/2 z-10 size-[39px] -translate-y-1/2 ${side}`}
        >
          {/* 그림이 빛 번짐까지 담아 버튼보다 커서 가운데 맞춰 넘치게 둔다 */}
          <Image
            src={doubleChevron}
            alt=""
            unoptimized
            className={`absolute top-1/2 left-1/2 max-w-none -translate-1/2 ${turn}`}
          />
        </button>
      ))}
      {/* 시안에서 몇 번째인지 보이는 표시가 빠져 스크린리더에만 알린다 */}
      <p aria-live="polite" className="sr-only">
        {index + 1} / {goods.length}
      </p>
    </section>
  )
}

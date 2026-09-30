'use client'

import { useState } from 'react'
import {
  BottomSheet,
  BottomSheetDescription,
  BottomSheetTitle,
} from '@/shared/bottom-sheet/BottomSheet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { Photo } from '@/shared/photo/Photo'
import { formatPrice } from './format-price'
import { PHOTO_SIZES, PRICE_TEXT } from './GoodsCard'
import type { Goods } from './goods'

/** 전체 굿즈 보기 버튼과, 누르면 끝까지 펼쳐 올라오는 두 줄 격자 시트 */
export function GoodsSheet({ goods }: { goods: Goods[] }) {
  const locale = useLocale()
  const { goods: text } = getMessages(locale)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 rounded-2xl border border-accent bg-bg px-[34px] leading-[1.288] font-medium whitespace-nowrap text-accent"
      >
        {text.viewAll}
      </button>
      {/* peekHeight 를 주지 않아 1단계 없이 목록을 바로 펼친다 */}
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <BottomSheetTitle className="px-1.5 text-2xl leading-[normal] font-bold">
          {text.viewAll}
        </BottomSheetTitle>
        {/* 시안에 설명 줄이 없어 화면에서는 숨기고 스크린리더만 읽는다 */}
        <BottomSheetDescription className="sr-only">{text.sheetDescription}</BottomSheetDescription>
        <ul className="mt-4 grid grid-cols-2 gap-2 px-1.5">
          {goods.map((g) => {
            const item = text.items[g.id]
            return (
              <li key={g.id} className="flex flex-col gap-2">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <Photo src={g.image.src} alt={item.name} sizes={PHOTO_SIZES} />
                </div>
                <div className="flex flex-col text-text">
                  <p className="leading-[normal] font-semibold">{item.name}</p>
                  <p className="text-xs leading-[1.288] font-medium">{item.description}</p>
                  <p className={`leading-[1.288] font-medium ${PRICE_TEXT}`}>
                    {formatPrice(g.price, locale)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </>
  )
}
